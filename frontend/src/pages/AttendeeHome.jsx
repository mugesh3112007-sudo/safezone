import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SOSButton from '../components/SOSButton';
import HiddenTrigger from '../components/HiddenTrigger';
import VoiceTrigger from '../components/VoiceTrigger';
import ZonePicker from '../components/ZonePicker';
import DemoPanel from '../components/DemoPanel';
import StatusBadge from '../components/StatusBadge';
import { useAttendeeStore } from '../stores/attendeeStore';

export default function AttendeeHome() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { eventName, currentZone, setZone } = useAttendeeStore();
  const [showZonePicker, setShowZonePicker] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-6 max-w-md mx-auto relative">
      <HiddenTrigger />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{eventName || 'SafeZone Event'}</h2>
            <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5 cursor-pointer" onClick={() => setShowZonePicker(!showZonePicker)}>
              <span>📍 Zone: {currentZone || 'Main Stage'}</span>
              <span className="text-teal-600 font-semibold">(Change)</span>
            </p>
          </div>
          <StatusBadge />
        </div>

        {showZonePicker && (
          <ZonePicker currentZone={currentZone} onSelectZone={(z) => { setZone(z); setShowZonePicker(false); }} />
        )}

        {/* Center Safe Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center my-6">
          <div className="w-20 h-20 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-4xl mx-auto mb-4 shadow-sm animate-pulse-soft">
            🛡️
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">You&apos;re Safe & Connected</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Your safety companion is active. Help is just a tap away if you ever feel uncomfortable.
          </p>
        </div>

        {/* SOS Button */}
        <SOSButton />

        {/* Voice Trigger */}
        <VoiceTrigger />
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(`/e/${eventId || 'demo'}/helppoint`)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
        >
          Looking for Restroom Help Point?
        </button>
      </div>

      <DemoPanel />
    </div>
  );
}
