import pool from '../src/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash('demo123', 10);

    await pool.query('DELETE FROM users WHERE email = $1', ['demo@timelink.app']);
    await pool.query(
      'INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)',
      [userId, 'Demo User', 'demo@timelink.app', hashedPassword]
    );
    console.log('✅ Created demo user: demo@timelink.app / demo123');

    // Create some sample events
    const today = new Date();
    const events = [
      { title: 'Team Standup', offset: 0, hours: 9, duration: 30, color: '#3b82f6' },
      { title: 'Client Meeting', offset: 1, hours: 14, duration: 60, color: '#10b981' },
      { title: 'Lunch Break', offset: 0, hours: 12, duration: 60, color: '#f59e0b' },
      { title: 'Design Review', offset: 2, hours: 10, duration: 90, color: '#8b5cf6' },
      { title: 'Sprint Planning', offset: 3, hours: 9, duration: 120, color: '#ef4444' },
    ];

    for (const e of events) {
      const start = new Date(today);
      start.setDate(start.getDate() + e.offset);
      start.setHours(e.hours, 0, 0, 0);
      const end = new Date(start.getTime() + e.duration * 60000);

      await pool.query(
        'INSERT INTO events (id, user_id, title, description, start_time, end_time, color) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [uuidv4(), userId, e.title, 'Sample event', start.toISOString(), end.toISOString(), e.color]
      );
    }
    console.log('✅ Created 5 sample events');

    // Create availability
    for (let day = 1; day <= 5; day++) { // Mon-Fri
      await pool.query(
        'INSERT INTO availability (id, user_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), userId, day, '09:00', '17:00']
      );
    }
    console.log('✅ Created availability (Mon-Fri 9am-5pm)');

    // Create booking link
    await pool.query(
      'INSERT INTO booking_links (id, user_id, slug, duration, title) VALUES ($1, $2, $3, 30, $4)',
      [uuidv4(), userId, 'demo-user', '30-min Meeting']
    );
    console.log('✅ Created booking link: demo-user');

    console.log('🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
