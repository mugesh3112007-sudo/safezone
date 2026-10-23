import React from 'react';

export default function HeatmapOverlay({ zones = [] }) {
  // Demo zones layout mapping for density heatmap
  const zoneCoords = {
    'Main Stage': { x: 40, y: 40, w: 300, h: 200, cap: 500, count: 420 },
    'Food Court': { x: 360, y: 40, w: 200, h: 200, cap: 200, count: 180 },
    'VIP Lounge': { x: 580, y: 40, w: 180, h: 200, cap: 50, count: 35 },
    'Entrance Gate': { x: 40, y: 260, w: 200, h: 150, cap: 300, count: 250 },
    'Workshop Area': { x: 260, y: 260, w: 250, h: 150, cap: 150, count: 90 }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
      {Object.entries(zoneCoords).map(([name, data]) => {
        const pct = Math.round((data.count / data.cap) * 100);
        let color = 'bg-emerald-500/20 text-emerald-700 border-emerald-300';
        let barColor = 'bg-emerald-500';
        if (pct >= 85) {
          color = 'bg-rose-500/20 text-rose-700 border-rose-300';
          barColor = 'bg-rose-500';
        } else if (pct >= 60) {
          color = 'bg-amber-500/20 text-amber-700 border-amber-300';
          barColor = 'bg-amber-500';
        }

        return (
          <div key={name} className={`p-3 rounded-xl border ${color} bg-white shadow-sm flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-800">{name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${pct >= 85 ? 'bg-rose-100 text-rose-700' : pct >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {pct}%
              </span>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>{data.count} / {data.cap}</span>
                <span>{pct >= 85 ? 'High Density' : pct >= 60 ? 'Moderate' : 'Normal'}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
