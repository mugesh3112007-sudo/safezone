import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICards from '../components/KPICards';
import HeatmapOverlay from '../components/HeatmapOverlay';
import CrowdWarning from '../components/CrowdWarning';
import IncidentTable from '../components/IncidentTable';
import VenueMap from '../components/VenueMap';
import QRGenerator from '../components/QRGenerator';

export default function OrgDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const guards = [
    { id: '1', name: 'Ravi Kumar', status: 'Available', zone: 'Main Stage', x: 200, y: 150 },
    { id: '2', name: 'Priya Sharma', status: 'Busy', zone: 'Food Court', x: 460, y: 130 }
  ];

  const alerts = [
    { id: 'alt_1', type: 'sos', zone: 'Main Stage', sessionId: 'User #882', status: 'pending', x: 190, y: 130 }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col max-w-7xl mx-auto p-4 md:p-8">
      {/* Top Bar */}
      <header className="bg-[#1B2A4A] text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-teal-400 text-[#0F1B33] flex items-center justify-center font-bold text-2xl shadow-sm">
            📊
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold">TechCorp Annual Summit 2026</h1>
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">Active Event</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Organizer Dashboard • DPDP Compliant Data Vault</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/org/setup')}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            ⚙️ Event Setup
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            🗑️ Delete Data
          </button>
          <button
            onClick={() => navigate('/demo')}
            className="bg-teal-400 hover:bg-teal-500 text-[#0F1B33] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'map', 'incidents', 'qr'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 rounded-2xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-[#1B2A4A] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'overview' ? '📈 Overview & KPIs' : tab === 'map' ? '🗺️ Live Venue & Heatmap' : tab === 'incidents' ? '📋 Incident Log' : '📷 QR Codes'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <KPICards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
            <div className="lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Zone Density Heatmap</h3>
              <HeatmapOverlay />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Active Warnings</h3>
              <CrowdWarning onNotifyStaff={() => alert('Broadcast SMS sent to all on-duty security staff!')} />
            </div>
          </div>
          <IncidentTable />
        </div>
      )}

      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Live Venue Map (Guards & SOS Alerts)</h3>
            <VenueMap zones={[]} guards={guards} alerts={alerts} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Zone Density Overview</h3>
            <HeatmapOverlay />
          </div>
        </div>
      )}

      {activeTab === 'incidents' && <IncidentTable />}

      {activeTab === 'qr' && (
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-2">Printable QR Codes for Event Zones</h3>
          <p className="text-xs text-slate-500 mb-4">Place these at gates, stages, and restroom help points.</p>
          <QRGenerator />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#0F1B33]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Event Data?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              This will permanently delete all attendee session records, incident logs, and heatmap history in compliance with DPDP Act 2023. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('All event data permanently deleted.');
                  setShowDeleteModal(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3.5 rounded-xl transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
