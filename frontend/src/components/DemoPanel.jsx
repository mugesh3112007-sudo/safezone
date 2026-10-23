import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function DemoPanel({ onTestSOS }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { eventId } = useParams();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#1B2A4A] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 hover:bg-[#0F1B33] transition-all"
        >
          🎮 Demo Controls
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 w-72 animate-slide-up">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Demo Panel</h4>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">×</button>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                if (onTestSOS) onTestSOS();
                navigate(`/e/${eventId || 'demo'}/sos-confirm`);
              }}
              className="w-full bg-[#FF6B6B] hover:bg-rose-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors"
            >
              🚨 Send Test SOS
            </button>
            <button
              onClick={() => navigate('/guard/login')}
              className="w-full bg-[#1B2A4A] hover:bg-[#0F1B33] text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors"
            >
              🛡️ Guard Dashboard
            </button>
            <button
              onClick={() => navigate('/org/login')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors"
            >
              📊 Organizer Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
