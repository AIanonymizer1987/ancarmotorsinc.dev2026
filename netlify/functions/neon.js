import { URLSearchParams } from 'url';
import { Pool } from 'pg';

const rawNeonDatabaseUrl =
  process.env.NETLIFY_NEON_DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL_UNPOOLED;
const rawNeonApiUrl = process.env.NETLIFY_NEON_API_URL || process.env.NEON_API_URL;
const rawNeonApiKey = process.env.NETLIFY_NEON_API_KEY || process.env.NEON_API_KEY;

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
const NEON_API_URL = isPlaceholderValue(rawNeonApiUrl) ? null : rawNeonApiUrl;
const NEON_API_KEY = isPlaceholderValue(rawNeonApiKey) ? null : rawNeonApiKey;

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
    console.error('Failed to create Neon database pool:', error);
  }
}

const isJwtToken = (token) => typeof token === 'string' && token.startsWith('eyJ');

const buildTargetUrl = (path, queryParams) => {
  const url = new URL(NEON_API_URL);
  const trimmedPath = path.replace(/^\/+/, '');

  if (trimmedPath) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${trimmedPath}`;
  }

  if (queryParams) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else if (typeof value !== 'undefined' && value !== null) {
        searchParams.append(key, value);
      }
    }
    url.search = searchParams.toString();
  }

  return url.toString();
};

const normalizeTargetPath = (path = '') => {
  let targetPath = path;
  if (targetPath.startsWith('/api/neon')) {
    targetPath = targetPath.slice('/api/neon'.length);
  } else if (targetPath.startsWith('/.netlify/functions/neon')) {
    targetPath = targetPath.slice('/.netlify/functions/neon'.length);
  }
  return targetPath.replace(/^\/+/, '');
};

const sanitizeSelect = (select) => {
  if (!select || select === '*') return '*';
  if (Array.isArray(select)) select = select[select.length - 1];
  if (typeof select !== 'string') return '*';

  const columns = select
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean);

  if (!columns.length) return '*';
  const safe = columns.every((column) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column));
  return safe ? columns.join(', ') : '*';
};

const parseFilterValue = (value) => {
  if (Array.isArray(value)) value = value[value.length - 1];
  if (typeof value !== 'string') return null;

  if (value.startsWith('eq.')) {
    return { operator: '=', value: value.slice(3) };
  }
  if (value.startsWith('like.')) {
    return { operator: 'LIKE', value: value.slice(5) };
  }
  if (value.startsWith('gt.')) {
    return { operator: '>', value: value.slice(3) };
  }
  if (value.startsWith('lt.')) {
    return { operator: '<', value: value.slice(3) };
  }
  return { operator: '=', value };
};

const buildWhereClause = (queryParams, startIndex = 1) => {
  const conditions = [];
  const values = [];

  for (const [key, value] of Object.entries(queryParams || {})) {
    if (key === 'select') continue;
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) continue;
    const parsed = parseFilterValue(value);
    if (!parsed) continue;
    values.push(parsed.value);
    conditions.push(`${key} ${parsed.operator} $${values.length + startIndex - 1}`);
  }

  return {
    clause: conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
};

const isValidTableName = (table) =>
  /^[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?$/.test(table);

const queryTable = async (table, queryParams) => {
  if (!pool) {
    throw new Error('Database pool is not initialized. Set NEON_DATABASE_URL or DATABASE_URL.');
  }
  if (!isValidTableName(table)) {
    throw new Error('Invalid table name');
  }

  const select = sanitizeSelect(queryParams.select || '*');
  const { clause, values } = buildWhereClause(queryParams);
  const sql = `SELECT ${select} FROM ${table}${clause}`;
  const result = await pool.query(sql, values);
  return result.rows;
};

const parseJsonBody = (event) => {
  if (!event.body) return null;
  try {
    return event.isBase64Encoded ? JSON.parse(Buffer.from(event.body, 'base64').toString('utf-8')) : JSON.parse(event.body);
  } catch {
    return null;
  }
};

const sanitizeColumnNames = (columns) => {
  return columns.filter((column) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column));
};

const buildInsertQuery = (table, payload) => {
  if (!pool) throw new Error('Database pool is not initialized.');
  const rows = Array.isArray(payload) ? payload : [payload];
  if (!rows.length) throw new Error('Missing insert payload.');

  const columns = sanitizeColumnNames(Object.keys(rows[0] || {})).filter(
    (column) => rows[0][column] !== undefined
  );
  if (!columns.length) throw new Error('No valid insert columns provided.');

  const values = [];
  const valueGroups = rows.map((row) => {
    const group = columns.map((column) => {
      values.push(row[column]);
      return `$${values.length}`;
    });
    return `(${group.join(', ')})`;
  });

  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valueGroups.join(', ')} RETURNING *`;
  return { sql, values };
};

const buildUpdateQuery = (table, body, queryParams) => {
  if (!pool) throw new Error('Database pool is not initialized.');
  if (!body || typeof body !== 'object') throw new Error('Missing update payload.');

  const updates = Object.keys(body)
    .filter((key) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) && body[key] !== undefined && body[key] !== null);
  if (!updates.length) throw new Error('No valid update fields provided.');

  const values = updates.map((field) => body[field]);
  const setClause = updates.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const where = buildWhereClause(queryParams, values.length + 1);
  if (!where.clause) throw new Error('Update operations require at least one filter parameter.');

  const sql = `UPDATE ${table} SET ${setClause}${where.clause} RETURNING *`;
  return { sql, values: [...values, ...where.values] };
};

const buildDeleteQuery = (table, queryParams) => {
  if (!pool) throw new Error('Database pool is not initialized.');
  const where = buildWhereClause(queryParams);
  if (!where.clause) throw new Error('Delete operations require at least one filter parameter.');

  const sql = `DELETE FROM ${table}${where.clause} RETURNING *`;
  return { sql, values: where.values };
};

const handleDirectDbRequest = async (event) => {
  if (!NEON_DATABASE_URL) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error:
          'Missing database connection. Set NETLIFY_NEON_DATABASE_URL, NEON_DATABASE_URL, DATABASE_URL, NETLIFY_DATABASE_URL, or NETLIFY_DATABASE_URL_UNPOOLED in your Netlify environment.',
      }),
    };
  }

  if (!pool) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Database pool failed to initialize.',
        detail: poolInitError?.message || 'Check your database connection settings.',
      }),
    };
  }

  const targetPath = normalizeTargetPath(event.path || '');
  const [table] = targetPath.split('/');

  if (!table) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing table path in request URL.' }),
    };
  }

  try {
    const queryParams = event.multiValueQueryStringParameters || event.queryStringParameters || {};

    if (event.httpMethod === 'GET') {
      const rows = await queryTable(table, queryParams);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      };
    }

    if (event.httpMethod === 'POST') {
      const payload = parseJsonBody(event);
      console.log('INSERT into table:', table);
      console.log('INSERT payload:', JSON.stringify(payload));
      const { sql, values } = buildInsertQuery(table, payload);
      console.log('INSERT SQL:', sql);
      console.log('INSERT values:', values);
      const result = await pool.query(sql, values);
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows),
      };
    }

    if (event.httpMethod === 'PATCH') {
      const payload = parseJsonBody(event);
      if (!payload) {
        console.error('PATCH: No payload in request body. event.body:', event.body, 'isBase64Encoded:', event.isBase64Encoded);
        throw new Error('Missing or invalid JSON body in PATCH request');
      }
      console.log('PATCH attempting update on table:', table);
      console.log('PATCH payload:', JSON.stringify(payload));
      console.log('PATCH queryParams:', queryParams);
      const { sql, values } = buildUpdateQuery(table, payload, queryParams);
      console.log('PATCH SQL:', sql);
      console.log('PATCH values:', values);
      const result = await pool.query(sql, values);
      console.log('PATCH result rows:', result.rowCount, 'affected');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows),
      };
    }

    if (event.httpMethod === 'DELETE') {
      const { sql, values } = buildDeleteQuery(table, queryParams);
      const result = await pool.query(sql, values);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows),
      };
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed.' }),
    };
  } catch (error) {
    console.error('Database operation error:', error.message, 'Stack:', error.stack);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Database operation failed.', detail: error.message }),
    };
  }
};

export const handler = async (event) => {
  if (directDbEnabled) {
    return handleDirectDbRequest(event);
  }

  if (!NEON_API_URL || !NEON_API_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error:
          'Missing Neon environment variables. Set NETLIFY_NEON_API_URL and NETLIFY_NEON_API_KEY in your Netlify environment.',
      }),
    };
  }

  if (!isJwtToken(NEON_API_KEY)) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error:
          'Invalid Neon API key format. Use a Neon REST JWT token (starts with eyJ...). Service keys starting with napi_ are not valid for Neon REST.',
      }),
    };
  }

  let targetPath = event.path || '';
  if (targetPath.startsWith('/api/neon')) {
    targetPath = targetPath.slice('/api/neon'.length);
  } else if (targetPath.startsWith('/.netlify/functions/neon')) {
    targetPath = targetPath.slice('/.netlify/functions/neon'.length);
  }

  const targetUrl = buildTargetUrl(targetPath, event.multiValueQueryStringParameters || event.queryStringParameters || {});

  const headers = {
    'Content-Type': event.headers['content-type'] || 'application/json',
    apikey: NEON_API_KEY,
    Authorization: `Bearer ${NEON_API_KEY}`,
  };

  let body = undefined;
  if (event.body && event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body;
  }

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers,
      body,
    });

    const responseBody = await response.text();
    const responseHeaders = {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    };

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: responseBody,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to forward request to Neon.', detail: error.message }),
    };
  }
};
