import React from 'react';
import { formatTime } from '../utils/formatTime';

export default function AlertStatus({ status, guardName, updatedAt }) {
  const steps = [
    { key: 'pending', label: 'Alert sent', icon: '🚨' },
    { key: 'assigned', label: `Guard assigned — ${guardName || 'Responder'}`, icon: '👤' },
    { key: 'en_route', label: 'Guard on the way', icon: '🚶' },
    { key: 'arrived', label: 'Guard has arrived', icon: '📍' },
    { key: 'resolved', label: 'Resolved', icon: '✅' }
  ];

  const getStepIndex = (s) => {
    switch (s) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'en_route': return 2;
      case 'arrived': return 3;
      case 'resolved': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 my-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Live Alert Status</h3>
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step.key} className="flex items-start space-x-3 relative">
              {idx < steps.length - 1 && (
                <div className={`absolute left-4 top-8 w-0.5 h-6 ${idx < currentIndex ? 'bg-teal-500' : 'bg-slate-200'}`} />
              )}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 ${
                isCurrent ? 'bg-teal-500 text-white animate-pulse' : isDone ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {step.icon}
              </div>
              <div className="flex-1 pt-1">
                <p className={`text-sm font-medium ${isCurrent ? 'text-slate-900 font-semibold' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                {isCurrent && updatedAt && (
                  <p className="text-xs text-slate-400 mt-0.5">{formatTime(updatedAt)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
