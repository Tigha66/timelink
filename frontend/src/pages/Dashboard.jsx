import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import DayView from '../components/calendar/DayView';
import EventModal from '../components/calendar/EventModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [bookingLinks, setBookingLinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = new Date(currentDate);
    start.setDate(1); start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    api.get('/events?start=' + start.toISOString() + '&end=' + end.toISOString())
      .then(res => setEvents(res.data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
    api.get('/sharing').then(res => setBookingLinks(res.data.links || [])).catch(() => {});
  }, [currentDate]);

  const handleSaveEvent = async (eventData) => {
    if (editingEvent) {
      const res = await api.put('/events/' + editingEvent.id, eventData);
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? res.data.event : e));
    } else {
      const res = await api.post('/events', eventData);
      setEvents(prev => [...prev, res.data.event]);
    }
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (id) => {
    await api.delete('/events/' + id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleNavigate = (dir) => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const bookingUrl = bookingLinks.length > 0 ? window.location.origin + '/book/' + bookingLinks[0].slug : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-600">TimeLink</span>
            <nav className="flex gap-1">
              {['month', 'week', 'day'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ' + (view === v ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100')}>
                  {v}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {bookingUrl && (
              <button onClick={() => { navigator.clipboard.writeText(bookingUrl); }} className="btn-secondary text-sm">Share Link</button>
            )}
            <Link to="/availability" className="btn-secondary text-sm">Availability</Link>
            <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-gray-500 hover:text-red-600">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => handleNavigate(-1)} className="btn-secondary px-3">Prev</button>
          <button onClick={() => setCurrentDate(new Date())} className="btn-secondary text-sm">Today</button>
          <button onClick={() => handleNavigate(1)} className="btn-secondary px-3">Next</button>
          <h2 className="text-lg font-semibold ml-2">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <button onClick={() => { setEditingEvent(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <span>+</span> New Event
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : view === 'month' ? (
          <MonthView currentDate={currentDate} events={events} onEventClick={(e) => { setEditingEvent(e); setShowModal(true); }} onDateClick={(d) => { setCurrentDate(d); setView('day'); }} />
        ) : view === 'week' ? (
          <WeekView currentDate={currentDate} events={events} onEventClick={(e) => { setEditingEvent(e); setShowModal(true); }} />
        ) : (
          <DayView currentDate={currentDate} events={events} onEventClick={(e) => { setEditingEvent(e); setShowModal(true); }} />
        )}
      </div>

      {showModal && (
        <EventModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onDelete={editingEvent ? () => { handleDeleteEvent(editingEvent.id); setShowModal(false); setEditingEvent(null); } : null}
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}