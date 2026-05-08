import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function fmt12(t) {
  const [h, m] = t.split(':').map(Number);
  return (h > 12 ? h - 12 : h) + ':' + String(m).padStart(2, '0') + (h >= 12 ? 'pm' : 'am');
}

export default function PublicBooking() {
  const { slug } = useParams();
  const [linkInfo, setLinkInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/sharing/public/' + slug).then(async (res) => {
      setLinkInfo(res.data.link);
      setUserId(res.data.user_id);
      try { const av = await api.get('/availability/public/' + res.data.user_id); setAvailability(av.data.availability || []); } catch {}
    }).catch(() => { window.location.href = '/'; })
      .finally(() => setLoading(false));
  }, [slug]);

  const getSlots = (date) => {
    const dayAvail = availability.find(a => a.day_of_week === date.getDay());
    if (!dayAvail) return [];
    const slots = [];
    const [sh, sm] = dayAvail.start_time.split(':').map(Number);
    const [eh, em] = dayAvail.end_time.split(':').map(Number);
    const dur = linkInfo ? linkInfo.duration : 30;
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    while (cur + dur <= end) {
      slots.push(String(Math.floor(cur / 60)).padStart(2, '0') + ':' + String(cur % 60).padStart(2, '0'));
      cur += dur;
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return setError('Please select a date and time');
    setSubmitting(true); setError('');
    const [h, m] = selectedTime.split(':').map(Number);
    const start = new Date(selectedDate); start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + (linkInfo ? linkInfo.duration : 30) * 60000);
    try {
      await api.post('/bookings/public/' + userId, { booker_name: name, booker_email: email, start_time: start.toISOString(), end_time: end.toISOString(), notes });
      setSuccess(true);
    } catch (err) { setError(err.response?.data?.error || 'Booking failed. Try another time.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
        <div className="text-5xl mb-4">Booked!</div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-2">You are scheduled with <strong>{linkInfo ? linkInfo.host_name : 'the host'}</strong>.</p>
        <p className="text-sm text-gray-500">{selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''} at {selectedTime}</p>
        <p className="text-sm text-gray-400 mt-4">A confirmation email has been sent.</p>
      </div>
    </div>
  );

  const timeSlots = selectedDate ? getSlots(selectedDate) : [];
  const nextDays = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold">{linkInfo ? linkInfo.host_name : ''}</h1>
          <p className="text-gray-500 mt-1">{linkInfo ? linkInfo.title : ''} ({linkInfo ? linkInfo.duration : 30} min)</p>
          {linkInfo && linkInfo.description && <p className="text-gray-600 mt-2">{linkInfo.description}</p>}
        </div>
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold mb-3">Select a Date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {nextDays.map((d, i) => {
                const sel = selectedDate && selectedDate.toDateString() === d.toDateString();
                const avail = availability.some(a => a.day_of_week === d.getDay() && a.is_active);
                return (
                  <button key={i} type="button" disabled={!avail} onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                    className={'shrink-0 w-16 py-3 rounded-lg text-center transition-all ' + (sel ? 'bg-blue-600 text-white' : avail ? 'bg-white border border-gray-200 hover:border-blue-300' : 'bg-gray-100 text-gray-300 cursor-not-allowed')}>
                    <div className="text-xs">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-lg font-bold">{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
          </div>
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold mb-3">Select a Time</h2>
              {timeSlots.length === 0 ? <p className="text-gray-500 text-sm">No available times on this date.</p> : (
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map(t => (
                    <button key={t} type="button" onClick={() => setSelectedTime(t)}
                      className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (selectedTime === t ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:border-blue-300')}>
                      {fmt12(t)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold mb-3">Your Details</h2>
            <div className="space-y-4">
              <div><label className="label">Name</label><input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" /></div>
              <div><label className="label">Email</label><input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" /></div>
              <div><label className="label">Notes (optional)</label><textarea className="input-field" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything to add?" /></div>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3 text-lg" disabled={submitting || !selectedDate || !selectedTime || !name || !email}>
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}