import React from 'react';

export default function GuardMarker({ guard }) {
  return (
    <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
        🛡️
      </div>
      <div>
        <h5 className="text-xs font-semibold text-slate-800">{guard.name}</h5>
        <p className="text-[10px] text-slate-500">Zone: {guard.zone || 'Assigned'}</p>
      </div>
    </div>
  );
}
