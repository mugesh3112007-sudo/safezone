import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EventSetup() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('TechCorp Annual Summit 2026');
  const [eventDate, setEventDate] = useState('2026-10-25');
  const [zones, setZones] = useState(['Main Stage', 'Food Court', 'VIP Lounge', 'Entrance Gate', 'Workshop Area', 'Restrooms']);
  const [newZone, setNewZone] = useState('');

  const handleAddZone = (e) => {
    e.preventDefault();
    if (newZone && !zones.includes(newZone)) {
      setZones([...zones, newZone]);
      setNewZone('');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Event configuration saved successfully!');
    navigate('/org/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col max-w-2xl mx-auto p-4 md:p-8">
      <header className="bg-[#1B2A4A] text-white rounded-3xl p-6 shadow-md flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Event Setup & Management</h1>
          <p className="text-xs text-slate-300 mt-0.5">Configure event details, zones, and security personnel</p>
        </div>
        <button
          onClick={() => navigate('/org/dashboard')}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          Back to Dashboard
        </button>
      </header>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4">Event Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#1B2A4A]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#1B2A4A]"
                required
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4">Venue Zones</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {zones.map((zone) => (
              <span key={zone} className="bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center space-x-2">
                <span>📍 {zone}</span>
                <button
                  type="button"
                  onClick={() => setZones(zones.filter(z => z !== zone))}
                  className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add new zone name..."
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#1B2A4A]"
            />
            <button
              type="button"
              onClick={handleAddZone}
              className="bg-[#1B2A4A] hover:bg-[#0F1B33] text-white text-xs font-semibold px-5 py-3 rounded-2xl transition-colors"
            >
              Add Zone
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-[#1B2A4A] hover:bg-[#0F1B33] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95 text-sm"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
