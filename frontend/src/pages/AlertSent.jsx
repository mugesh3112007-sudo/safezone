import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertStatus from '../components/AlertStatus';
import { useAttendeeStore } from '../stores/attendeeStore';

export default function AlertSent() {
  const { eventId, alertId } = useParams();
  const navigate = useNavigate();
  const { alertStatus, setAlertStatus } = useAttendeeStore();
  const [guardName, setGuardName] = useState('Ravi');
  const [updatedAt, setUpdatedAt] = useState(Date.now());

  // Simulate WebSocket progression for demo
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAlertStatus('assigned');
      setGuardName('Ravi');
      setUpdatedAt(Date.now());
    }, 4000);

    const timer2 = setTimeout(() => {
      setAlertStatus('en_route');
      setUpdatedAt(Date.now());
    }, 8000);

    const timer3 = setTimeout(() => {
      setAlertStatus('arrived');
      setUpdatedAt(Date.now());
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [setAlertStatus]);

  const handleCancel = () => {
    setAlertStatus('resolved');
    navigate(`/e/${eventId || 'demo'}/home`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-6 max-w-md mx-auto">
      <div>
        <div className="text-center my-6">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm animate-pulse">
            🚨
          </div>
          <h2 className="text-xl font-bold text-slate-900">Help is on the way</h2>
          <p className="text-xs text-slate-500 mt-1">Nearest security guard has been alerted.</p>
        </div>

        <AlertStatus status={alertStatus || 'pending'} guardName={guardName} updatedAt={updatedAt} />
      </div>

      <div className="my-6">
        {alertStatus !== 'resolved' && (
          <button
            onClick={handleCancel}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3.5 px-6 rounded-2xl transition-all text-sm mb-3"
          >
            Cancel Alert (False Alarm)
          </button>
        )}
        <button
          onClick={() => navigate(`/e/${eventId || 'demo'}/home`)}
          className="w-full bg-[#1B2A4A] hover:bg-[#0F1B33] text-white font-bold py-3.5 px-6 rounded-2xl transition-all text-sm"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
