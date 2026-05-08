-- TimeLink Database Schema
-- Run: psql $DATABASE_URL -f migrations/001_initial.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(200),
  color VARCHAR(7) DEFAULT '#3b82f6',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Availability slots (recurring weekly)
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Booking links (public scheduling pages)
CREATE TABLE IF NOT EXISTS booking_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(50) UNIQUE NOT NULL,
  duration INTEGER DEFAULT 30,
  title VARCHAR(200) DEFAULT 'Meeting',
  description TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings (made through public links)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booker_name VARCHAR(100) NOT NULL,
  booker_email VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  notes TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_time ON events(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_availability_user_day ON availability(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_bookings_user_time ON bookings(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_booking_links_slug ON booking_links(slug);
