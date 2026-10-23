import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ title = 'SafeZone', subtitle = '' }) {
  const navigate = useNavigate();

  return (
    <header className="bg-[#1B2A4A] text-white px-6 py-4 shadow-md flex items-center justify-between">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/demo')}>
        <div className="w-9 h-9 rounded-full bg-teal-400 text-[#0F1B33] flex items-center justify-center font-bold text-lg shadow-sm">
          🛡️
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-slate-300 font-medium">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/guard/login')}
          className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors"
        >
          Guard Portal
        </button>
        <button
          onClick={() => navigate('/org/login')}
          className="text-xs font-semibold bg-teal-400 hover:bg-teal-500 text-[#0F1B33] px-3 py-1.5 rounded-xl transition-colors"
        >
          Organizer
        </button>
      </div>
    </header>
  );
}
