import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertQueue from '../components/AlertQueue';
import VenueMap from '../components/VenueMap';
import { useGuardStore } from '../stores/guardStore';

export default function GuardDashboard() {
  const navigate = useNavigate();
  const { guardName, status, setStatus } = useGuardStore();
  const [activeTab, setActiveTab] = useState('alerts');

  const [alerts, setAlerts] = useState([
    { id: 'alt_1', type: 'sos', zone: 'Main Stage', sessionId: 'User #882', status: 'pending', timestamp: Date.now() - 120000, x: 190, y: 130 },
    { id: 'alt_2', type: 'help_point', zone: 'Restrooms', sessionId: 'User #104', status: 'assigned', timestamp: Date.now() - 300000, x: 130, y: 490 }
  ]);

  const guards = [
    { id: 'g_101', name: guardName || 'Ravi', status: status, zone: 'Main Stage', x: 200, y: 150 }
  ];

  const handleAccept = (id) => {
    setAlerts(alerts.map(a => (a.id === id ? { ...a, status: 'assigned' } : a)));
  };

  const handleUpdateStatus = (id, newStatus) => {
    if (newStatus === 'resolved') {
      setAlerts(alerts.filter(a => a.id !== id));
    } else {
      setAlerts(alerts.map(a => (a.id === id ? { ...a, status: newStatus } : a)));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col max-w-4xl mx-auto p-4 md:p-6">
      {/* Top Bar */}
      <header className="bg-[#1B2A4A] text-white rounded-2xl p-4 md:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-teal-400 text-[#0F1B33] flex items-center justify-center font-bold text-xl">
            🛡️
          </div>
          <div>
            <h1 className="text-base font-bold">{guardName || 'Ravi Kumar'}</h1>
            <p className="text-xs text-slate-300">Zone: Main Stage • Guard ID: #101</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#0F1B33] text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none"
          >
            <option value="available">🟢 Available</option>
            <option value="busy">🔴 Busy</option>
            <option value="offline">⚪ Offline</option>
          </select>
          <button
            onClick={() => navigate('/demo')}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'alerts' ? 'bg-[#1B2A4A] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🚨 Alert Queue ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'map' ? 'bg-[#1B2A4A] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🗺️ Venue Map
        </button>
      </div>

      {/* Content */}
      {activeTab === 'alerts' ? (
        <AlertQueue alerts={alerts} onAccept={handleAccept} onUpdateStatus={handleUpdateStatus} />
      ) : (
        <VenueMap zones={[]} guards={guards} alerts={alerts} />
      )}
    </div>
  );
}
