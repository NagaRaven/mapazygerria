require('dotenv').config();

// Modo SQLite: activar con DB_TYPE=sqlite en .env (no requiere instalación)
if (process.env.DB_TYPE === 'sqlite') {
  module.exports = require('./database-sqlite');
  return;
}

const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'zygerria_map',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 15000,
  requestTimeout: 15000,
};

let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
};

const query = async (text, params = {}) => {
  const connection = await getPool();
  const request = connection.request();
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });
  return request.query(text);
};

const closePool = async () => {
  if (pool) {
    await pool.close();
    pool = null;
  }
};

module.exports = { sql, getPool, query, closePool };
