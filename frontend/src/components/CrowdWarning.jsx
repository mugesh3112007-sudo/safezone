import React from 'react';

export default function CrowdWarning({ warnings = [], onNotifyStaff }) {
  if (warnings.length === 0) {
    return (
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="text-xs font-bold text-amber-900">Main Stage at 92% Capacity</h4>
            <p className="text-[11px] text-amber-700">Recommended action: Redirect incoming crowd to Workshop Area.</p>
          </div>
        </div>
        <button
          onClick={onNotifyStaff}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          Notify Staff
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {warnings.map((w, idx) => (
        <div key={idx} className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="text-xs font-bold text-amber-900">{w.title || 'Crowd Threshold Warning'}</h4>
              <p className="text-[11px] text-amber-700">{w.message}</p>
            </div>
          </div>
          {onNotifyStaff && (
            <button
              onClick={() => onNotifyStaff(w)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              Notify Staff
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
