import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuardStore } from '../stores/guardStore';

export default function GuardLogin() {
  const navigate = useNavigate();
  const setGuard = useGuardStore((state) => state.setGuard);
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handlePinChange = (val, idx) => {
    if (isNaN(val)) return;
    const newPin = [...pin];
    newPin[idx] = val;
    setPin(newPin);

    // Auto focus next
    if (val && idx < 3) {
      const nextInput = document.getElementById(`pin-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setGuard({
        guardId: 'g_101',
        guardName: 'Ravi Kumar',
        eventId: 'demo',
        status: 'available'
      });
      navigate('/guard/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#1B2A4A] flex flex-col justify-between p-6 max-w-md mx-auto text-white">
      <div>
        <div className="flex justify-center my-8">
          <div className="w-16 h-16 rounded-full bg-teal-400 text-[#0F1B33] flex items-center justify-center text-3xl shadow-lg">
            🛡️
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Guard Portal</h1>
          <p className="text-sm text-slate-300 mt-1">Enter your 4-digit security PIN</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="flex justify-center space-x-3 mb-6">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                id={`pin-${idx}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(e.target.value, idx)}
                className="w-12 h-14 bg-white/20 border border-white/30 rounded-2xl text-center text-2xl font-bold text-white focus:outline-none focus:border-teal-400"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-400 hover:bg-teal-500 text-[#0F1B33] font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95 text-base"
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
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
