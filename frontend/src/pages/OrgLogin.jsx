import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrgLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('organizer@demo.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate('/org/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#1B2A4A] flex flex-col justify-between p-6 max-w-md mx-auto text-white">
      <div>
        <div className="flex justify-center my-8">
          <div className="w-16 h-16 rounded-full bg-teal-400 text-[#0F1B33] flex items-center justify-center text-3xl shadow-lg">
            📊
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Organizer Portal</h1>
          <p className="text-sm text-slate-300 mt-1">Manage events, guards, and safety KPIs</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-400 hover:bg-teal-500 text-[#0F1B33] font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95 text-base mt-2"
          >
            {loading ? 'Logging in...' : 'Organizer Login'}
          </button>
        </form>
      </div>

      <div className="text-center my-6">
        <button
          onClick={() => navigate('/demo')}
          className="text-xs text-slate-400 hover:text-white underline"
        >
          ← Back to Demo / Attendee Home
        </button>
      </div>
    </div>
  );
}
