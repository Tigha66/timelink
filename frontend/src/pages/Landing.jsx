import { Link } from 'react-router-dom';

export default function Landing() {
  const features = [
    { icon: '\ud83d\udcc5', title: 'Smart Calendar', desc: 'Day, week, and month views with intuitive event management.' },
    { icon: '\ud83d\udd17', title: 'Share Your Link', desc: 'Send a booking link so others can schedule time with you.' },
    { icon: '\u23f0', title: 'Set Availability', desc: 'Define your working hours and let the app handle the rest.' },
    { icon: '\ud83d\udce7', title: 'Email Reminders', desc: 'Automatic notifications for upcoming events and new bookings.' },
  ];

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <span className="text-xl font-bold text-blue-600">TimeLink</span>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium">Log in</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Scheduling made <span className="text-blue-600">simple</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Manage your calendar, share your availability, and let people book meetings with you - all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="btn-primary text-lg px-8 py-3">Start Free</Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">Log In</Link>
        </div>
      </section>

      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-gray-400 text-sm pb-12">Built with React, Node.js, and PostgreSQL</footer>
    </div>
  );
}