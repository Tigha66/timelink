import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

// GET /api/auth/google -> Redirect to Google OAuth
router.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

// GET /api/auth/google/callback -> Handle Google callback
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${error}`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Google token error:', tokenData);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed`);
    }

    // Get user info from Google
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoResponse.json();

    if (!googleUser.email) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_email`);
    }

    // Find or create user in database
    let userResult = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [googleUser.email]);

    let user;
    if (userResult.rows.length > 0) {
      // Existing user
      user = userResult.rows[0];
    } else {
      // New user - create account
      const randomPassword = crypto.randomUUID();
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      userResult = await pool.query(
        'INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
        [uuidv4(), googleUser.name || googleUser.email.split('@')[0], googleUser.email, hashedPassword]
      );
      user = userResult.rows[0];
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // Create auto-submitting HTML form to pass JWT to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Signing in...</title></head>
      <body>
        <form id="auth-form" method="post" action="${frontendUrl}/login" style="display:none;">
          <input type="hidden" name="token" value="${token}" />
          <input type="hidden" name="name" value="${user.name}" />
          <input type="hidden" name="email" value="${user.email}" />
        </form>
        <script>
          // Try to send to parent window (popup flow)
          try {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              token: '${token}',
              user: ${JSON.stringify(user)}
            }, '*');
            window.close();
          } catch (e) {
            // Fallback: redirect to frontend with token
            window.location.href = '${frontendUrl}/login?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}';
          }
        </script>
        <p>Signing you in...</p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
});

export default router;
