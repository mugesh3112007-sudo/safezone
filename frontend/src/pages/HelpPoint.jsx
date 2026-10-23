import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export default function HelpPoint() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const zone = searchParams.get('zone') || 'Restrooms';

  const handleHelpTrigger = () => {
    navigate(`/e/${eventId || 'demo'}/sos-confirm`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-6 max-w-md mx-auto">
      <div>
        <div className="flex justify-center my-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl shadow-md">
            🚻
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Restroom Help Point</h1>
          <p className="text-sm font-medium text-slate-600 mt-1">📍 {zone}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center mb-6">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Need immediate assistance?</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            This is a safe space. If you or someone you know needs help, tap the button below. A trained responder will come directly to this location.
          </p>
          <button
            onClick={handleHelpTrigger}
            className="w-full bg-[#1B2A4A] hover:bg-[#0F1B33] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95 text-base"
          >
            I Need Help Now
          </button>
        </div>

        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-200">
          <h4 className="text-xs font-bold text-teal-900 mb-1">Voice Safety Word</h4>
          <p className="text-xs text-teal-700">Say &quot;Angela&quot; or &quot;pineapple&quot; near your phone for silent help.</p>
        </div>
      </div>

      <div className="my-6 text-center">
        <button
          onClick={() => navigate(`/e/${eventId || 'demo'}/home`)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
        >
          Return to Attendee Home
        </button>
      </div>
    </div>
  );
}
