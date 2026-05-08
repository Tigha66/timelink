export default function DayView({ currentDate, events, onEventClick }) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8);
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();
  const dateStr = currentDate.toISOString().split('T')[0];
  const dayEvents = events.filter(e => e.start_time && e.start_time.split('T')[0] === dateStr).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        <p className="text-sm text-gray-500">{dayEvents.length} event(s)</p>
      </div>
      <div className="overflow-y-auto max-h-[500px]">
        {hours.map(hour => {
          const hourEvents = dayEvents.filter(e => new Date(e.start_time).getHours() === hour);
          const isCurrentSlot = isToday && hour === today.getHours();
          return (
            <div key={hour} className={'flex border-b border-gray-100 ' + (isCurrentSlot ? 'bg-blue-50' : '')}>
              <div className="w-20 text-xs text-gray-400 text-right pr-3 pt-3 border-r border-gray-100 shrink-0">
                {hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'pm' : 'am'}
              </div>
              <div className="flex-1 p-1.5 min-h-[50px]">
                {hourEvents.map(ev => (
                  <div key={ev.id} onClick={() => onEventClick(ev)}
                    className="p-2 rounded-lg mb-1 cursor-pointer"
                    style={{ backgroundColor: (ev.color || '#3b82f6') + '22', borderLeft: '4px solid ' + (ev.color || '#3b82f6') }}>
                    <div className="font-medium text-sm" style={{ color: ev.color || '#3b82f6' }}>{ev.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(ev.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(ev.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                    {ev.description && <div className="text-xs text-gray-400 mt-0.5">{ev.description}</div>}
                    {ev.location && <div className="text-xs text-gray-400">Location: {ev.location}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}