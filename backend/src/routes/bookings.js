import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.js';
import pool from '../db.js';
import { sendBookingConfirmation, sendBookingNotification } from '../services/email.js';

const router = Router();

// GET /api/bookings - List bookings for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name as booker_name, u.email as booker_email
       FROM bookings b LEFT JOIN users u ON b.booker_email = u.email
       WHERE b.user_id = $1 ORDER BY b.start_time DESC`,
      [req.user.id]
    );
    res.json({ bookings: result.rows });
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings/public/:userId - Public booking
router.post('/public/:userId', async (req, res) => {
  try {
    const { booker_name, booker_email, start_time, end_time, notes } = req.body;
    if (!booker_name || !booker_email || !start_time || !end_time) {
      return res.status(400).json({ error: 'Name, email, start_time, and end_time are required' });
    }

    // Check for conflicts
    const conflicts = await pool.query(
      `SELECT id FROM events WHERE user_id = $1 AND start_time < $2 AND end_time > $3`,
      [req.params.userId, end_time, start_time]
    );
    if (conflicts.rows.length > 0) {
      return res.status(409).json({ error: 'Time slot is not available' });
    }

    const booking = await pool.query(
      `INSERT INTO bookings (id, user_id, booker_name, booker_email, start_time, end_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed') RETURNING *`,
      [uuidv4(), req.params.userId, booker_name, booker_email, start_time, end_time, notes || '']
    );

    // Also create an event for the host
    await pool.query(
      `INSERT INTO events (id, user_id, title, description, start_time, end_time, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), req.params.userId, `Meeting with ${booker_name}`, notes || '', start_time, end_time, '#10b981']
    );

    const b = booking.rows[0];

    // Get host info
    const hostResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [req.params.userId]);
    const host = hostResult.rows[0];

    // Send confirmation emails
    sendBookingConfirmation(b, booker_email, host?.name).catch(() => {});
    if (host) sendBookingNotification(b, host.email, booker_name).catch(() => {});

    res.status(201).json({ booking: b, message: 'Booking confirmed!' });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PUT /api/bookings/:id/status - Update booking status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'rescheduled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking: result.rows[0] });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

export default router;
