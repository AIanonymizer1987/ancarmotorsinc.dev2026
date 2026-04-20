import { Pool } from 'pg';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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

const JWT_SECRET = process.env.AUTH_JWT_SECRET || process.env.NETLIFY_SECURE_JWT_SECRET || 'replace_this_secret_in_production';
const TOKEN_EXPIRY_SECONDS = 60 * 60; // 1 hour

let pool = null;
let poolInitError = null;
try {
  if (NEON_DATABASE_URL) {
    pool = new Pool({ connectionString: NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
} catch (error) {
  poolInitError = error;
  console.error('Failed to create database pool:', error);
}

const hashPassword = (password) =>
  crypto.createHash('sha256').update(password, 'utf8').digest('hex');

const createToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY_SECONDS });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const sendJson = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const queryUserByEmail = async (email) => {
  if (!pool) throw new Error('Database connection not configured for auth.');
  const result = await pool.query('SELECT * FROM users WHERE user_email = $1 LIMIT 1', [email]);
  return result.rows[0] || null;
};

const queryEmployeeByEmail = async (email) => {
  if (!pool) throw new Error('Database connection not configured for auth.');
  const result = await pool.query('SELECT * FROM employees WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] || null;
};

const createUser = async ({ name, email, password, phone, address }) => {
  if (!pool) throw new Error('Database connection not configured for auth.');
  const hashed = hashPassword(password);
  const result = await pool.query(
    `INSERT INTO users (user_name, user_email, user_password, user_role, user_phone_number, user_address, user_email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
    [name, email, hashed, 'user', phone, address, false]
  );
  return result.rows[0];
};

const createResponseUser = (account, source) => ({
  id: account.id,
  name: account.user_name || account.employee_name || account.name || '',
  email: account.user_email || account.email,
  role: account.user_role || (account.admin_role ? 'admin' : source),
  phone: account.user_phone_number || account.phone_number || account.phone || '',
  address: account.user_address || account.address || account.location || '',
  emailVerified: account.user_email_verified || false,
});

const handler = async (event) => {
  try {
    if (!event.httpMethod) {
      return sendJson(400, { error: 'Missing HTTP method.' });
    }

    // Debug logging
    if (!pool) {
      const detail = poolInitError ? poolInitError.message : 'No database pool available.';
      console.error('Database pool not initialized. NEON_DATABASE_URL:', NEON_DATABASE_URL ? 'SET' : 'NOT SET', 'poolInitError:', detail);
      return sendJson(500, {
        error: 'Database connection not configured.',
        detail:
          detail ||
          'Ensure NETLIFY_NEON_DATABASE_URL, NEON_DATABASE_URL, DATABASE_URL, NETLIFY_DATABASE_URL, or NETLIFY_DATABASE_URL_UNPOOLED is set for auth.',
      });
    }

    const action = event.queryStringParameters?.action || '';
    const payload = event.body ? JSON.parse(event.body) : {};

    if (event.httpMethod === 'POST' && action === 'login') {
      const { email, password } = payload;
      if (!email || !password) {
        return sendJson(400, { error: 'Email and password are required.' });
      }

      const user = await queryUserByEmail(email);
      let account = user;
      let roleSource = 'user';

      if (!account) {
        const employee = await queryEmployeeByEmail(email);
        if (employee) {
          account = employee;
          roleSource = employee.admin_role ? 'admin' : 'employee';
        }
      }

      if (!account) {
        return sendJson(401, { error: 'Invalid email or password.' });
      }

      const storedPassword = account.user_password || account.password;
      const hashedPassword = hashPassword(password);
      if (storedPassword !== hashedPassword && storedPassword !== password) {
        return sendJson(401, { error: 'Invalid email or password.' });
      }

      const responseUser = createResponseUser(account, roleSource);
      const token = createToken({ id: responseUser.id, email: responseUser.email, role: responseUser.role });
      return sendJson(200, { user: responseUser, token, expiresAt: Date.now() + TOKEN_EXPIRY_SECONDS * 1000 });
    }

    if (event.httpMethod === 'POST' && action === 'register') {
      const { name, email, password, phone, address } = payload;
      if (!name || !email || !password) {
        return sendJson(400, { error: 'Name, email, and password are required.' });
      }

      const existingUser = await queryUserByEmail(email);
      const existingEmployee = await queryEmployeeByEmail(email);
      if (existingEmployee) {
        return sendJson(409, { error: 'An employee account already exists with this email.' });
      }
      if (existingUser) {
        return sendJson(409, { error: 'A registered user already exists with this email.' });
      }

      const newUser = await createUser({ name, email, password, phone, address });
      const responseUser = createResponseUser(newUser, 'user');
      const token = createToken({ id: responseUser.id, email: responseUser.email, role: responseUser.role });
      return sendJson(201, { user: responseUser, token, expiresAt: Date.now() + TOKEN_EXPIRY_SECONDS * 1000 });
    }

    if (event.httpMethod === 'POST' && action === 'refresh') {
      const authHeader = event.headers.authorization || event.headers.Authorization || '';
      const token = authHeader.replace('Bearer ', '').trim();
      if (!token) {
        return sendJson(401, { error: 'Authorization token required.' });
      }

      const verified = verifyToken(token);
      if (!verified) {
        return sendJson(401, { error: 'Invalid or expired token.' });
      }

      const { id, email, role } = verified;
      const newToken = createToken({ id, email, role });
      return sendJson(200, { token: newToken, expiresAt: Date.now() + TOKEN_EXPIRY_SECONDS * 1000 });
    }

    return sendJson(404, { error: 'Action not found.' });
  } catch (error) {
    console.error('Auth handler error:', error);
    return sendJson(500, { error: 'Auth service failed.', detail: error.message });
  }
};

export { handler };
