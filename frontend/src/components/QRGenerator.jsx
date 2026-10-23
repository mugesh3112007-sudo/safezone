import React from 'react';

export default function QRGenerator({ eventId = 'demo' }) {
  const zones = ['Main Stage', 'Food Court', 'VIP Lounge', 'Entrance Gate', 'Workshop Area', 'Restrooms'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      {zones.map((zone) => (
        <div key={zone} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center mb-4 border border-slate-200">
            {/* Placeholder QR code visual */}
            <div className="grid grid-cols-4 gap-1 p-2 w-full h-full">
              {[...Array(16)].map((_, i) => (
                <div key={i} className={`rounded-xs ${i % 2 === 0 ? 'bg-[#1B2A4A]' : 'bg-slate-300'}`} />
              ))}
            </div>
          </div>
          <h4 className="text-sm font-bold text-slate-800">{zone}</h4>
          <p className="text-xs text-slate-500 mt-0.5">Scan to check in / help point</p>
          <button className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-xl transition-colors">
            Download QR
          </button>
        </div>
      ))}
    </div>
  );
}
