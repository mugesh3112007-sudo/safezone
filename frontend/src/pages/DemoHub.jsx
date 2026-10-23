import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function DemoHub() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultEvent = events[0];

  return (
    <div className="min-h-screen bg-[#0F1B33] text-white flex flex-col justify-center p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-[#1B2A4A] rounded-3xl border border-[#2DD4BF]/40 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#2DD4BF]/10">
          <span className="text-3xl">🛡️</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">SafeZone Demo Hub</h1>
        <p className="text-sm text-[#2DD4BF] font-medium">Free for attendees. Paid for by the events they protect.</p>
        <p className="text-xs text-[#94A3B8] mt-2">Hackathon Prototype Dashboard • Select any role below to test instantly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Attendee Card */}
        <div className="bg-[#1B2A4A] rounded-2xl p-6 border border-[#2a3a5a] flex flex-col justify-between hover:border-[#2DD4BF] transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#0F1B33] flex items-center justify-center text-xl mb-4">📱</div>
            <h2 className="font-bold text-base text-white mb-1">1. Attendee</h2>
            <p className="text-xs text-[#94A3B8] mb-4">Scan QR code, view silent SOS companion, test rapid tap / voice trigger.</p>
          </div>
          <button
            onClick={() => navigate(defaultEvent ? `/e/${defaultEvent.id}?zone=Gate 1` : '/e/demo?zone=Gate 1')}
            className="w-full py-3 bg-[#2DD4BF] text-[#0F1B33] font-extrabold rounded-xl text-xs"
          >
            Open Attendee View
          </button>
        </div>

        {/* Guard Card */}
        <div className="bg-[#1B2A4A] rounded-2xl p-6 border border-[#2a3a5a] flex flex-col justify-between hover:border-[#2DD4BF] transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#0F1B33] flex items-center justify-center text-xl mb-4">🛡️</div>
            <h2 className="font-bold text-base text-white mb-1">2. Guard / Responder</h2>
            <p className="text-xs text-[#94A3B8] mb-4">PIN login (1234 for Ravi), accept alerts, update status (On the way, Reached, Resolved).</p>
          </div>
          <button
            onClick={() => navigate('/guard/login')}
            className="w-full py-3 bg-[#34D399] text-[#0F1B33] font-extrabold rounded-xl text-xs"
          >
            Open Guard Portal
          </button>
        </div>

        {/* Organizer Card */}
        <div className="bg-[#1B2A4A] rounded-2xl p-6 border border-[#2a3a5a] flex flex-col justify-between hover:border-[#2DD4BF] transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#0F1B33] flex items-center justify-center text-xl mb-4">📊</div>
            <h2 className="font-bold text-base text-white mb-1">3. Organizer</h2>
            <p className="text-xs text-[#94A3B8] mb-4">Login (organizer@demo.com), live heatmap density, crowd warnings, CSV audit logs.</p>
          </div>
          <button
            onClick={() => navigate('/org/dashboard')}
            className="w-full py-3 bg-[#FBBF24] text-[#0F1B33] font-extrabold rounded-xl text-xs"
          >
            Open Organizer Dashboard
          </button>
        </div>
      </div>

      {/* Simulator Shortcut */}
      <div className="bg-[#1B2A4A] rounded-2xl p-6 border border-[#2a3a5a] text-center">
        <h3 className="font-bold text-white text-sm mb-1">🎮 Visual Simulator & Test Controls</h3>
        <p className="text-xs text-[#94A3B8] mb-4">Spawn 300 fake attendees, trigger crowd surges, and test end-to-end alerts.</p>
        <button
          onClick={() => window.open('/simulator/web_simulator.html', '_blank')}
          className="px-6 py-3 bg-[#0F1B33] text-[#2DD4BF] border border-[#2DD4BF]/30 font-extrabold rounded-xl text-xs hover:bg-[#2DD4BF]/10 transition"
        >
          Open Web Simulator Control Panel ↗
        </button>
      </div>
    </div>
  );
}
