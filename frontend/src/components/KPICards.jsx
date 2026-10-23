import React from 'react';

export default function KPICards({ kpis = {} }) {
  const cards = [
    { label: 'Active Attendees', value: kpis.activeAttendees || 342, icon: '👥', change: '+12%' },
    { label: 'Avg Response Time', value: `${kpis.avgResponseTime || 42}s`, icon: '⚡', change: '-8s vs target' },
    { label: 'QR Scans Today', value: kpis.qrScansToday || 1250, icon: '📷', change: '+240 today' },
    { label: 'False Alarm Rate', value: `${kpis.falseAlarmRate || 2.1}%`, icon: '🛡️', change: 'Normal' },
    { label: 'Active Alerts', value: kpis.activeAlerts || 1, icon: '🚨', change: 'Needs action' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-2xl">{card.icon}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{card.change}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
