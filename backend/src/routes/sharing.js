import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.js';
import pool from '../db.js';

const router = Router();

// GET /api/sharing - Get user's booking links
router.get('/', authMiddleware, async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM booking_links WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      // Create default booking link
      const slug = req.user.email.split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 20);
      result = await pool.query(
        'INSERT INTO booking_links (id, user_id, slug, duration, title, description) VALUES ($1, $2, $3, 30, $4, $5) RETURNING *',
        [uuidv4(), req.user.id, slug, '30-min Meeting', 'Schedule a meeting']
      );
    }
    res.json({ links: result.rows });
  } catch (err) {
    console.error('Get sharing error:', err);
    res.status(500).json({ error: 'Failed to fetch booking links' });
  }
});

// GET /api/sharing/public/:slug - Get booking link info
router.get('/public/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bl.*, u.name, u.email FROM booking_links bl JOIN users u ON bl.user_id = u.id WHERE bl.slug = $1`,
      [req.params.slug]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking link not found' });
    const link = result.rows[0];
    res.json({ link: { slug: link.slug, duration: link.duration, title: link.title, description: link.description, host_name: link.name }, user_id: link.user_id });
  } catch (err) {
    console.error('Public link error:', err);
    res.status(500).json({ error: 'Failed to fetch booking link' });
  }
});

export default router;
