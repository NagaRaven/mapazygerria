const BetterSqlite = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'zygerria.db');

let db = null;

const getDb = () => {
  if (!db) {
    db = new BetterSqlite(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    createTables();
  }
  return db;
};

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS points_of_interest (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      faction TEXT,
      activities TEXT,
      color TEXT,
      x_percent REAL NOT NULL,
      y_percent REAL NOT NULL,
      image_url TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  try {
    db.exec(`ALTER TABLE points_of_interest ADD COLUMN color TEXT`);
  } catch (_) {}
};

// Convierte @param a :param y GETDATE() a CURRENT_TIMESTAMP
const normalizeQuery = (sql) => {
  return sql
    .replace(/@(\w+)\b/g, ':$1')
    .replace(/GETDATE\(\)/gi, "datetime('now')");
};

// Detecta si la consulta tiene cláusula OUTPUT INSERTED
const hasOutput = (sql) => /OUTPUT\s+INSERTED/i.test(sql);

// Extrae el nombre de la tabla
const extractTable = (sql, keyword) => {
  const match = sql.match(new RegExp(`${keyword}\\s+(INTO\\s+)?(\\w+)`, 'i'));
  return match ? match[2] : null;
};

// Elimina el bloque OUTPUT ... (hasta VALUES para INSERT, hasta WHERE para UPDATE)
const stripOutputClause = (sql) => {
  // Para INSERT: ... OUTPUT INSERTED.col1, INSERTED.col2, \n VALUES ...
  // Para UPDATE: SET ... OUTPUT INSERTED.col1, ... WHERE ...
  return sql.replace(/[\r\n\s]*OUTPUT\s+(?:INSERTED\.\w+(?:\s*,\s*)?[\r\n\s]*)+/gi, ' ');
};

const query = async (sql, params = {}) => {
  const database = getDb();

  const isInsert = /^\s*INSERT/i.test(sql);
  const isUpdate = /^\s*UPDATE/i.test(sql);
  const hasOutputClause = hasOutput(sql);

  if (isInsert && hasOutputClause) {
    const tableName = extractTable(sql, 'INSERT');
    const cleanSql = normalizeQuery(stripOutputClause(sql));
    const stmt = database.prepare(cleanSql);
    const result = stmt.run(params);
    const row = database.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(result.lastInsertRowid);
    return { recordset: row ? [row] : [] };
  }

  if (isUpdate && hasOutputClause) {
    const tableName = extractTable(sql, 'UPDATE');
    const cleanSql = normalizeQuery(stripOutputClause(sql));
    const stmt = database.prepare(cleanSql);
    stmt.run(params);
    const row = database.prepare(`SELECT * FROM ${tableName} WHERE id = :id`).get({ id: params.id });
    return { recordset: row ? [row] : [] };
  }

  const cleanSql = normalizeQuery(sql);
  const upperSql = sql.trim().toUpperCase();

  if (upperSql.startsWith('SELECT')) {
    const rows = database.prepare(cleanSql).all(params);
    return { recordset: rows };
  }

  database.prepare(cleanSql).run(params);
  return { recordset: [] };
};

const closePool = async () => {
  if (db) { db.close(); db = null; }
};

module.exports = { query, getDb, getPool: getDb, closePool, sql: {} };
