import { readFileSync } from 'fs';
import pool from '../src/db.js';

async function migrate() {
  try {
    console.log('🔄 Running migrations...');
    const sql = readFileSync('migrations/001_initial.sql', 'utf-8');
    await pool.query(sql);
    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrate();
