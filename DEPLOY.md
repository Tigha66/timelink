# TimeLink -- Scheduling & Calendar App

## Quick Start (Local Development)

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install

# Create database (replace with your credentials)
createdb timelink  # or: psql -c "CREATE DATABASE timelink;"

# Run migrations
npm run migrate

# Seed demo data (optional)
npm run seed

# Start dev server
npm run dev
# API runs on http://localhost:4000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Demo Login

After seeding:
- Email: demo@timelink.app
- Password: demo123

---

## Project Structure

```
timelink/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express app entry point
│   │   ├── db.js             # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js       # /api/auth (signup, login, me)
│   │   │   ├── events.js     # /api/events (CRUD)
│   │   │   ├── availability.js  # /api/availability (weekly slots)
│   │   │   ├── bookings.js   # /api/bookings (public + admin)
│   │   │   └── sharing.js    # /api/sharing (booking links)
│   │   └── services/
│   │       └── email.js      # Nodemailer email service
│   ├── migrations/
│   │   └── 001_initial.sql   # Database schema
│   ├── scripts/
│   │   ├── migrate.js        # Run migrations
│   │   └── seed.js           # Seed demo data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # React Router + protected routes
│   │   ├── main.jsx          # Entry point
│   │   ├── index.css         # Tailwind + custom styles
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── services/
│   │   │   └── api.js        # Axios instance with interceptors
│   │   ├── pages/
│   │   │   ├── Landing.jsx   # Public landing page
│   │   │   ├── Login.jsx     # Login form
│   │   │   ├── Signup.jsx    # Signup form
│   │   │   ├── Dashboard.jsx # Main calendar view
│   │   │   ├── Availability.jsx  # Weekly schedule editor
│   │   │   └── PublicBooking.jsx # Public booking page (/book/:slug)
│   │   └── components/
│   │       └── calendar/
│   │           ├── MonthView.jsx  # Month calendar grid
│   │           ├── WeekView.jsx   # Week timeline view
│   │           ├── DayView.jsx    # Day detailed view
│   │           └── EventModal.jsx # Create/edit event modal
│   └── package.json
└── DEPLOY.md
```

---

## API Endpoints

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | No | Create account |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |

### Events
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/events?start=&end= | Yes | List events (date range) |
| POST | /api/events | Yes | Create event |
| PUT | /api/events/:id | Yes | Update event |
| DELETE | /api/events/:id | Yes | Delete event |

### Availability
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/availability | Yes | Get weekly slots |
| PUT | /api/availability | Yes | Set weekly slots |
| GET | /api/availability/public/:userId | No | Public availability check |

### Bookings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/bookings | Yes | List user's bookings |
| POST | /api/bookings/public/:userId | No | Create public booking |
| PUT | /api/bookings/:id/status | Yes | Update booking status |

### Sharing
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/sharing | Yes | Get booking links |
| GET | /api/sharing/public/:slug | No | Get booking link info |

---

## Database Schema

### users
- id (UUID), name, email (unique), password_hash, created_at

### events
- id (UUID), user_id (FK), title, description, start_time, end_time, location, color, is_available

### availability
- id (UUID), user_id (FK), day_of_week (0-6), start_time, end_time, is_active

### booking_links
- id (UUID), user_id (FK), slug (unique), duration, title, description

### bookings
- id (UUID), user_id (FK), booker_name, booker_email, start_time, end_time, notes, status

---

## Deployment

### Vercel (Frontend) + Railway/Render (Backend)

**Backend (Railway/Render):**
1. Push backend to a Git repo
2. Connect Railway/Render to the repo
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add env vars: DATABASE_URL, JWT_SECRET, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, FRONTEND_URL

**Frontend (Vercel):**
1. Push frontend to a Git repo
2. Connect Vercel to the repo
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add env var: VITE_API_URL (set to your backend URL)

**Database (Railway/Supabase):**
1. Create PostgreSQL instance
2. Get connection string
3. Run migration: `psql $DATABASE_URL -f backend/migrations/001_initial.sql`

---

## Features Summary

- User signup/login with JWT authentication
- Personal calendar with month/week/day views
- Create, edit, delete events with color coding
- Set weekly availability (working hours)
- Share booking links for public scheduling
- Book meetings through public links (no account needed)
- Email confirmations for bookings
- Email reminders for upcoming events
- Mobile-responsive design
- Clean, modular codebase
