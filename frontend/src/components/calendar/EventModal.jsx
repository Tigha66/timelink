import { useState } from 'react';

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

function fmtLocal(isoStr) {
  const d = new Date(isoStr);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default function EventModal({ event, onSave, onDelete, onClose }) {
  const now = new Date();
  const later = new Date(now.getTime() + 3600000);
  const [title, setTitle] = useState(event ? event.title : '');
  const [description, setDescription] = useState(event ? event.description || '' : '');
  const [location, setLocation] = useState(event ? event.location || '' : '');
  const [startTime, setStartTime] = useState(event ? fmtLocal(event.start_time) : fmtLocal(now));
  const [endTime, setEndTime] = useState(event ? fmtLocal(event.end_time) : fmtLocal(later));
  const [color, setColor] = useState(event ? event.color || '#3b82f6' : '#3b82f6');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description, location, start_time: startTime, end_time: endTime, color });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">{event ? 'Edit Event' : 'New Event'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Details..." />
          </div>
          <div>
            <label className="label">Location</label>
            <input type="text" className="input-field" value={location} onChange={e => setLocation(e.target.value)} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start</label>
              <input type="datetime-local" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label className="label">End</label>
              <input type="datetime-local" className="input-field" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={'w-7 h-7 rounded-full transition-all ' + (color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110')}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {onDelete && <button type="button" onClick={onDelete} className="btn-secondary text-red-600 hover:bg-red-50">Delete</button>}
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{event ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}