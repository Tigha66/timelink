import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEventReminder } from '../services/email.js';

const router = Router();

// GET /api/events - List events (with optional date range)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { start, end } = req.query;
    let query = 'SELECT * FROM events WHERE user_id = $1';
    let params = [req.user.id];

    if (start && end) {
      query += ' AND start_time <= $3 AND end_time >= $2';
      params = [req.user.id, start, end];
    }

    query += ' ORDER BY start_time ASC';
    const result = await pool.query(query, params);
    res.json({ events: result.rows });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/events - Create event
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, start_time, end_time, location, color, is_available } = req.body;
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: 'Title, start_time, and end_time are required' });
    }

    const result = await pool.query(
      `INSERT INTO events (id, user_id, title, description, start_time, end_time, location, color, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [uuidv4(), req.user.id, title, description || '', start_time, end_time, location || null, color || '#3b82f6', is_available !== false]
    );

    const event = result.rows[0];

    // Schedule email reminder if event is in the future
    const eventStart = new Date(start_time);
    if (eventStart > new Date()) {
      sendEventReminder(event, req.user.email).catch(() => {});
    }

    res.status(201).json({ event });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, start_time, end_time, location, color, is_available } = req.body;
    const result = await pool.query(
      `UPDATE events SET title = COALESCE($1, title), description = COALESCE($2, description),
       start_time = COALESCE($3, start_time), end_time = COALESCE($4, end_time),
       location = COALESCE($5, location), color = COALESCE($6, color),
       is_available = COALESCE($7, is_available), updated_at = NOW()
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [title, description, start_time, end_time, location, color, is_available, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ event: result.rows[0] });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
