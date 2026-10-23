import React from 'react';

export default function ZonePicker({ currentZone, onSelectZone }) {
  const zones = ['Main Stage', 'Food Court', 'VIP Lounge', 'Entrance Gate', 'Workshop Area', 'Restrooms'];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 my-4">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Zone</h4>
      <div className="grid grid-cols-2 gap-2">
        {zones.map((zone) => {
          const isSelected = currentZone === zone;
          return (
            <button
              key={zone}
              onClick={() => onSelectZone(zone)}
              className={`p-3 rounded-xl text-xs font-medium text-left transition-all ${
                isSelected
                  ? 'bg-[#1B2A4A] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              📍 {zone}
            </button>
          );
        })}
      </div>
    </div>
  );
}
