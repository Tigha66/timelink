import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/common/GoogleLoginButton';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (token, user) => {
    localStorage.setItem('token', token);
    window.location.href = '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="text-xl font-bold text-blue-600 mb-8 block">TimeLink</Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-1">Create account</h2>
          <p className="text-gray-500 mb-6">Start managing your schedule</p>
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
          <GoogleLoginButton onSuccess={handleGoogleSuccess} />
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters" minLength={6} />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}