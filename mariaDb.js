const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  connectionLimit: 5
});

// NOTE: To ensure proper handling of Unicode (한글) make sure your MariaDB server,
// database and tables use utf8mb4 charset and a unicode collation (e.g. utf8mb4_unicode_ci).
// You can add charset in the connection config if needed (some drivers support it):
// charset: 'utf8mb4'

async function query(sql, params) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { query };