import { Pool } from 'pg';

const rawNeonDatabaseUrl =
  process.env.NETLIFY_NEON_DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL_UNPOOLED;

const isPlaceholderValue = (value) => {
  if (!value || typeof value !== 'string') return true;
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes('your_') ||
    normalized.includes('replace_') ||
    normalized.includes('example') ||
    normalized.includes('placeholder')
  );
};

const NEON_DATABASE_URL = isPlaceholderValue(rawNeonDatabaseUrl) ? null : rawNeonDatabaseUrl;

let pool = null;
let poolInitError = null;
const directDbEnabled = Boolean(NEON_DATABASE_URL);
if (directDbEnabled) {
  try {
    pool = new Pool({
      connectionString: NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  } catch (error) {
    poolInitError = error;
    console.error('Failed to create db-admin database pool:', error);
  }
}

const allowedTables = {
  users: 'id',
  orders: 'order_id',
  'public.vehicles': 'vehicle_id',
  suppliers: 'id',
  tickets: 'id',
  test_drives: 'id',
};

const isValidTableName = (table) => Object.hasOwn(allowedTables, table);

const parseJsonBody = (event) => {
  if (!event.body) return null;
  try {
    return event.isBase64Encoded
      ? JSON.parse(Buffer.from(event.body, 'base64').toString('utf-8'))
      : JSON.parse(event.body);
  } catch {
    return null;
  }
};

const sanitizeColumnNames = (columns = []) => {
  return columns.filter((column) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column));
};

const buildInsertQuery = (table, records) => {
  const rows = Array.isArray(records) ? records : [records];
  if (!rows.length) throw new Error('No records provided for import.');

  const columns = sanitizeColumnNames(Object.keys(rows[0] || {}));
  if (!columns.length) throw new Error('No valid columns found in import data.');

  const values = [];
  const valueGroups = rows.map((row, rowIndex) => {
    const group = columns.map((column) => {
      values.push(row[column]);
      return `$${values.length}`;
    });
    return `(${group.join(', ')})`;
  });

  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valueGroups.join(', ')} RETURNING *`;
  return { sql, values };
};

const buildUpsertQuery = (table, records, primaryKey) => {
  const rows = Array.isArray(records) ? records : [records];
  if (!rows.length) throw new Error('No records provided for import.');
  if (!primaryKey) throw new Error('Missing primary key for upsert.');

  const columns = sanitizeColumnNames(Object.keys(rows[0] || {}));
  if (!columns.length) throw new Error('No valid columns found in import data.');
  if (!columns.includes(primaryKey)) {
    throw new Error(`Import records must include the primary key column: ${primaryKey}`);
  }

  const values = [];
  const valueGroups = rows.map((row) => {
    const group = columns.map((column) => {
      values.push(row[column]);
      return `$${values.length}`;
    });
    return `(${group.join(', ')})`;
  });

  const updateColumns = columns.filter((column) => column !== primaryKey);
  const setClause = updateColumns.length
    ? updateColumns.map((column) => `${column} = EXCLUDED.${column}`).join(', ')
    : `${primaryKey} = EXCLUDED.${primaryKey}`;

  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valueGroups.join(', ')} ON CONFLICT (${primaryKey}) DO UPDATE SET ${setClause} RETURNING *`;
  return { sql, values };
};

const handler = async (event) => {
  if (!directDbEnabled) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Database import/export requires NEON database connection.' }),
    };
  }

  if (!pool) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Database pool failed to initialize.' }),
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const isHealth = event.path?.endsWith('/health') || event.queryStringParameters?.health === 'true';
      if (isHealth) {
        const healthResult = await pool.query(`SELECT current_database() AS database, current_schema() AS schema, version() AS version, now() AS server_time`);
        const health = healthResult.rows[0];
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...health, connected: true }),
        };
      }

      const table = event.queryStringParameters?.table;
      const exportAll = event.queryStringParameters?.all === 'true';
      if (exportAll) {
        const allData = {};
        for (const tableName of Object.keys(allowedTables)) {
          const { rows } = await pool.query(`SELECT * FROM ${tableName}`);
          allData[tableName] = rows;
        }
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allData),
        };
      }

      if (!table || !isValidTableName(table)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid or missing table parameter.' }),
        };
      }

      const { rows } = await pool.query(`SELECT * FROM ${table}`);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = parseJsonBody(event);
      if (!body) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid JSON body.' }),
        };
      }

      const { table, records, mode } = body;
      if (!records || (typeof records !== 'object' && !Array.isArray(records))) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Records must be provided as an array or an object mapping tables to arrays.' }),
        };
      }

      if (mode !== 'insert' && mode !== 'upsert') {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Mode must be either insert or upsert.' }),
        };
      }

      let results = [];
      await pool.query('BEGIN');
      try {
        if (Array.isArray(records)) {
          if (!table || !isValidTableName(table)) {
            throw new Error('Invalid or missing table.');
          }
          if (!records.length) {
            throw new Error('Records must be a non-empty array.');
          }
          const primaryKey = allowedTables[table];
          const queryData = mode === 'upsert' ? buildUpsertQuery(table, records, primaryKey) : buildInsertQuery(table, records);
          const result = await pool.query(queryData.sql, queryData.values);
          results.push({ table, count: result.rowCount });
        } else {
          const tables = Object.keys(records);
          if (!tables.length) {
            throw new Error('Records object must contain at least one table.');
          }
          for (const tableName of tables) {
            if (!isValidTableName(tableName)) {
              throw new Error(`Invalid table name: ${tableName}`);
            }
            const tableRecords = records[tableName];
            if (!Array.isArray(tableRecords) || !tableRecords.length) {
              continue;
            }
            const primaryKey = allowedTables[tableName];
            const queryData = mode === 'upsert' ? buildUpsertQuery(tableName, tableRecords, primaryKey) : buildInsertQuery(tableName, tableRecords);
            const result = await pool.query(queryData.sql, queryData.values);
            results.push({ table: tableName, count: result.rowCount });
          }
        }
        await pool.query('COMMIT');
      } catch (innerError) {
        await pool.query('ROLLBACK');
        throw innerError;
      }

      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      };
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed.' }),
    };
  } catch (error) {
    console.error('db-admin error:', error?.message, error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Database admin operation failed.', detail: error?.message }),
    };
  }
};

export { handler };
