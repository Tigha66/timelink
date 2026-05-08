import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: process.env.EMAIL_USER ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } : undefined,
});

export async function sendEventReminder(event, userEmail) {
  const eventDate = new Date(event.start_time);
  const delay = eventDate.getTime() - Date.now() - 60 * 60 * 1000; // 1 hour before

  if (delay <= 0) return; // Event already started or passed

  setTimeout(async () => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'TimeLink',
        to: userEmail,
        subject: `Reminder: ${event.title} in 1 hour`,
        html: `<h2>Event Reminder</h2><p><strong>${event.title}</strong></p>
               <p>Time: ${eventDate.toLocaleString()}</p>
               ${event.description ? `<p>${event.description}</p>` : ''}
               ${event.location ? `<p>Location: ${event.location}</p>` : ''}`,
      });
    } catch (err) {
      console.error('Failed to send reminder:', err.message);
    }
  }, Math.min(delay, 2147483647)); // Max setTimeout is ~24.8 days
}

export async function sendBookingConfirmation(booking, bookerEmail, hostName) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'TimeLink',
      to: bookerEmail,
      subject: 'Booking Confirmed - TimeLink',
      html: `<h2>Booking Confirmed ✅</h2>
             <p>Your meeting with ${hostName || 'the host'} has been confirmed.</p>
             <p><strong>Time:</strong> ${new Date(booking.start_time).toLocaleString()}</p>
             <p><strong>Duration:</strong> ${Math.round((new Date(booking.end_time) - new Date(booking.start_time)) / 60000)} minutes</p>
             ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}`,
    });
  } catch (err) {
    console.error('Failed to send booking confirmation:', err.message);
  }
}

export async function sendBookingNotification(booking, hostEmail, bookerName) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'TimeLink',
      to: hostEmail,
      subject: `New Booking from ${bookerName}`,
      html: `<h2>New Booking 📅</h2>
             <p><strong>${bookerName}</strong> booked a meeting.</p>
             <p><strong>Time:</strong> ${new Date(booking.start_time).toLocaleString()}</p>
             ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}`,
    });
  } catch (err) {
    console.error('Failed to send booking notification:', err.message);
  }
}
