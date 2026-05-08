import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Availability() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookingLinks, setBookingLinks] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/availability').then(res => setSlots(res.data.availability || [])).catch(() => setSlots([])).finally(() => setLoading(false));
    api.get('/sharing').then(res => setBookingLinks(res.data.links || [])).catch(() => {});
  }, []);

  const handleToggle = (day) => {
    setSlots(prev => {
      const existing = prev.find(s => s.day_of_week === day);
      if (existing) return prev.map(s => s.day_of_week === day ? { ...s, is_active: !s.is_active } : s);
      return [...prev, { day_of_week: day, start_time: '09:00', end_time: '17:00', is_active: true }];
    });
  };

  const handleTimeChange = (day, field, value) => {
    setSlots(prev => prev.map(s => s.day_of_week === day ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try { await api.put('/availability', { slots }); } catch (err) { alert('Failed to save availability'); }
    finally { setSaving(false); }
  };

  const bookingUrl = bookingLinks.length > 0 ? window.location.origin + '/book/' + bookingLinks[0].slug : '';

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary text-sm">Back to Calendar</button>
          <h1 className="text-lg font-semibold">Availability</h1>
          <div />
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {bookingUrl && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="font-semibold mb-2">Your Booking Link</h2>
            <div className="flex gap-2">
              <input readOnly className="input-field bg-gray-50" value={bookingUrl} />
              <button onClick={() => { navigator.clipboard.writeText(bookingUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="btn-primary shrink-0">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Share this link so people can book time with you.</p>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-semibold">Weekly Schedule</h2>
            <p className="text-sm text-gray-500 mt-1">Toggle days and set your available hours.</p>
          </div>
          <div className="p-6 space-y-3">
            {dayNames.map((day, i) => {
              const slot = slots.find(s => s.day_of_week === i);
              const isActive = slot ? slot.is_active : false;
              return (
                <div key={i} className={'flex items-center gap-4 p-3 rounded-lg border transition-colors flex-wrap ' + (isActive ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200')}>
                  <div className="flex items-center gap-3 w-36 shrink-0">
                    <button onClick={() => handleToggle(i)} className={'w-10 h-6 rounded-full transition-colors relative ' + (isActive ? 'bg-blue-600' : 'bg-gray-300')}>
                      <div className={'w-4 h-4 bg-white rounded-full absolute top-1 transition-all ' + (isActive ? 'left-5' : 'left-1')} />
                    </button>
                    <span className="text-sm font-medium">{day}</span>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-2">
                      <input type="time" className="input-field w-32" value={slot ? slot.start_time : '09:00'} onChange={e => handleTimeChange(i, 'start_time', e.target.value)} />
                      <span className="text-gray-400">to</span>
                      <input type="time" className="input-field w-32" value={slot ? slot.end_time : '17:00'} onChange={e => handleTimeChange(i, 'end_time', e.target.value)} />
                    </div>
                  )}
                  {!isActive && <span className="text-sm text-gray-400">Unavailable</span>}
                </div>
              );
            })}
          </div>
          <div className="p-6 border-t border-gray-200">
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Schedule'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}