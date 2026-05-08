import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import availabilityRoutes from './routes/availability.js';
import bookingRoutes from './routes/bookings.js';
import sharingRoutes from './routes/sharing.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sharing', sharingRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 TimeLink API running on http://localhost:${PORT}`);
});

export default app;
