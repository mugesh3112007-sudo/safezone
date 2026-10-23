import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ConsentNotice from '../components/ConsentNotice';
import { useAttendeeStore } from '../stores/attendeeStore';

export default function Landing() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAttendeeStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);

  const zone = searchParams.get('zone') || 'Main Stage';
  const helppoint = searchParams.get('helppoint');

  useEffect(() => {
    if (helppoint === '1') {
      navigate(`/e/${eventId || 'demo'}/helppoint?zone=${zone}`);
    }
  }, [helppoint, eventId, zone, navigate]);

  const handleEnterEvent = () => {
    setLoading(true);
    setTimeout(() => {
      setSession({
        sessionId: 'ses_' + Math.random().toString(36).substr(2, 9),
        sessionToken: 'tok_' + Math.random().toString(36).substr(2, 9),
        eventId: eventId || 'demo',
        eventName: eventId === 'demo' ? 'TechCorp Annual Summit 2026' : `Event ${eventId}`,
        currentZone: zone
      });
      navigate(`/e/${eventId || 'demo'}/home`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-6 max-w-md mx-auto">
      <div>
        <div className="flex justify-center my-6">
          <div className="w-16 h-16 rounded-full bg-[#1B2A4A] text-teal-400 flex items-center justify-center text-3xl shadow-md">
            🛡️
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">SafeZone</h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            {eventId === 'demo' ? 'TechCorp Annual Summit 2026' : `Event Safety Companion`}
          </p>
          <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
            📍 Zone: {zone}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">How this works</h3>
          <ol className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
              <span>You get a private safety companion for this event. No app install required.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
              <span>If you feel unsafe, trigger a silent SOS instantly.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
              <span>The nearest security guard is alerted with your live zone location.</span>
            </li>
          </ol>
        </div>

        <ConsentNotice />
      </div>

      <div className="my-6">
        <button
          onClick={handleEnterEvent}
          disabled={loading}
          className="w-full bg-[#1B2A4A] hover:bg-[#0F1B33] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95 text-base flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>Enter Event Safely →</span>
          )}
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-3">Free for attendees. Paid for by the events they protect.</p>
      </div>
    </div>
  );
}
