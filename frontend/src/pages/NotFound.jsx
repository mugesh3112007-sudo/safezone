import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-4xl mb-4">
        🔍
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-xs mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/demo')}
        className="bg-[#1B2A4A] hover:bg-[#0F1B33] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all text-sm"
      >
        Return to SafeZone Home
      </button>
    </div>
  );
}
