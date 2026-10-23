import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVoiceDetection } from '../hooks/useVoiceDetection';

export default function VoiceTrigger() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { supported, isListening, toggleListening } = useVoiceDetection(['pineapple', 'angela'], () => {
    navigate(`/e/${eventId || 'demo'}/sos-confirm`);
  });

  if (!supported) return null;

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 my-3">
      <div className="flex items-center space-x-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isListening ? 'bg-teal-100 text-teal-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-800">Voice Safety Word</h4>
          <p className="text-xs text-slate-500">Say &quot;pineapple&quot; for silent SOS</p>
        </div>
      </div>
      <button
        onClick={toggleListening}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isListening ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {isListening ? 'Listening...' : 'Enable Mic'}
      </button>
    </div>
  );
}
