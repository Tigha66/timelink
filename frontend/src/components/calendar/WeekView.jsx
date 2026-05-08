export default function WeekView({ currentDate, events, onEventClick }) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek); d.setDate(d.getDate() + i); return d;
  });
  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-2 text-xs text-gray-400 border-r border-gray-100" />
        {weekDays.map((d, i) => (
          <div key={i} className={'text-center py-2 border-r border-gray-100 ' + (d.toDateString() === today.toDateString() ? 'bg-blue-50' : '')}>
            <div className="text-xs text-gray-500">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className={'text-lg font-semibold ' + (d.toDateString() === today.toDateString() ? 'text-blue-600' : '')}>{d.getDate()}</div>
          </div>
        ))}
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
            <div className="text-xs text-gray-400 text-right pr-2 py-3 border-r border-gray-100">
              {hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'pm' : 'am'}
            </div>
            {weekDays.map((d, i) => {
              const dateStr = d.toISOString().split('T')[0];
              const hourEvents = events.filter(e => {
                if (!e.start_time) return false;
                return e.start_time.split('T')[0] === dateStr && new Date(e.start_time).getHours() === hour;
              });
              return (
                <div key={i} className={'border-r border-gray-100 p-0.5 min-h-[50px] ' + (d.toDateString() === today.toDateString() ? 'bg-blue-50/30' : '')}>
                  {hourEvents.map(ev => (
                    <div key={ev.id} onClick={() => onEventClick(ev)}
                      className="text-xs px-1.5 py-0.5 rounded mb-0.5 cursor-pointer truncate"
                      style={{ backgroundColor: (ev.color || '#3b82f6') + '33', color: ev.color || '#3b82f6', borderLeft: '3px solid ' + (ev.color || '#3b82f6') }}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}