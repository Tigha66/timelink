import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pool from '../db.js';

const router = Router();

// GET /api/availability - Get availability slots
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM availability WHERE user_id = $1 ORDER BY day_of_week', [req.user.id]);
    res.json({ availability: result.rows });
  } catch (err) {
    console.error('Get availability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// PUT /api/availability - Set availability (upsert all slots)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { slots } = req.body;
    if (!Array.isArray(slots)) {
      return res.status(400).json({ error: 'Slots array is required' });
    }

    await pool.query('DELETE FROM availability WHERE user_id = $1', [req.user.id]);

    for (const slot of slots) {
      await pool.query(
        `INSERT INTO availability (id, user_id, day_of_week, start_time, end_time, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [crypto.randomUUID(), req.user.id, slot.day_of_week, slot.start_time, slot.end_time, slot.is_active !== false]
      );
    }

    const result = await pool.query('SELECT * FROM availability WHERE user_id = $1 ORDER BY day_of_week', [req.user.id]);
    res.json({ availability: result.rows });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// GET /api/availability/public/:userId - Public availability check
router.get('/public/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT day_of_week, start_time, end_time FROM availability WHERE user_id = $1 AND is_active = true ORDER BY day_of_week',
      [req.params.userId]
    );
    res.json({ availability: result.rows });
  } catch (err) {
    console.error('Public availability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
