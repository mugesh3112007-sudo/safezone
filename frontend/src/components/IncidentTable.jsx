import React from 'react';
import { formatTime } from '../utils/formatTime';

export default function IncidentTable({ incidents = [] }) {
  const demoIncidents = incidents.length > 0 ? incidents : [
    { id: '1', type: 'SOS', zone: 'Main Stage', attendee: 'User #882', responder: 'Ravi', time: Date.now() - 3600000, status: 'Resolved' },
    { id: '2', type: 'Help Point', zone: 'Restrooms', attendee: 'User #104', responder: 'Priya', time: Date.now() - 7200000, status: 'Resolved' },
    { id: '3', type: 'Crowd Warning', zone: 'Food Court', attendee: 'System', responder: 'Staff', time: Date.now() - 14400000, status: 'Notified' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden my-6">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">Incident Log</h3>
        <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="p-3">Type</th>
              <th className="p-3">Zone</th>
              <th className="p-3">Attendee</th>
              <th className="p-3">Responder</th>
              <th className="p-3">Time</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {demoIncidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-900">{inc.type}</td>
                <td className="p-3 text-slate-600">{inc.zone}</td>
                <td className="p-3 text-slate-600">{inc.attendee}</td>
                <td className="p-3 text-slate-600">{inc.responder}</td>
                <td className="p-3 text-slate-500">{formatTime(inc.time)}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${inc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
