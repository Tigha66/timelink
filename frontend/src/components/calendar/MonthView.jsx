export default function MonthView({ currentDate, events, onEventClick, onDateClick }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const days = [];

  for (let i = 0; i < firstDay; i++) days.push({ empty: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = events.filter(e => e.start_time && e.start_time.split('T')[0] === dateStr);
    days.push({ date, dayEvents, isToday: date.toDateString() === today.toDateString(), empty: false });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center py-2 text-sm font-medium text-gray-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          if (day.empty) return <div key={i} className="min-h-24 border-b border-r border-gray-100 bg-gray-50" />;
          return (
            <div key={i} className={'min-h-24 border-b border-r border-gray-100 p-1 cursor-pointer hover:bg-gray-50 ' + (day.isToday ? 'bg-blue-50' : '')}
              onClick={() => onDateClick(day.date)}>
              <div className={'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ' + (day.isToday ? 'bg-blue-600 text-white' : 'text-gray-700')}>
                {day.date.getDate()}
              </div>
              <div className="space-y-0.5">
                {day.dayEvents.slice(0, 3).map(ev => (
                  <div key={ev.id} onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer"
                    style={{ backgroundColor: (ev.color || '#3b82f6') + '22', color: ev.color || '#3b82f6', borderLeft: '3px solid ' + (ev.color || '#3b82f6') }}>
                    {ev.title}
                  </div>
                ))}
                {day.dayEvents.length > 3 && <div className="text-xs text-gray-400 pl-1">+{day.dayEvents.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}