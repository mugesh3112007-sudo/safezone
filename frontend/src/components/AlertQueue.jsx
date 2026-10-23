import React from 'react';
import { formatTimeAgo } from '../utils/formatTime';

export default function AlertQueue({ alerts = [], onAccept, onUpdateStatus }) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
          ✅
        </div>
        <h4 className="text-sm font-semibold text-slate-800">All Clear</h4>
        <p className="text-xs text-slate-500 mt-1">No active alerts in queue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const priorityColor = alert.type === 'sos' ? 'bg-rose-500' : alert.type === 'help_point' ? 'bg-amber-500' : 'bg-blue-500';
        return (
          <div key={alert.id || alert._id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${priorityColor} animate-pulse`} />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{alert.type || 'SOS Alert'}</h4>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{alert.zone || alert.zoneName || 'Main Stage'}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Attendee ID: {alert.sessionId || alert.attendeeId || 'Anonymous'} • {formatTimeAgo(alert.timestamp)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              {alert.status === 'pending' && onAccept && (
                <button
                  onClick={() => onAccept(alert.id || alert._id)}
                  className="bg-[#1B2A4A] hover:bg-[#0F1B33] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Accept Alert
                </button>
              )}
              {alert.status === 'assigned' && onUpdateStatus && (
                <>
                  <button
                    onClick={() => onUpdateStatus(alert.id || alert._id, 'en_route')}
                    className="bg-amber-500 hover:bg-amber-650 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    On the way
                  </button>
                  <button
                    onClick={() => onUpdateStatus(alert.id || alert._id, 'resolved')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    Resolve
                  </button>
                </>
              )}
              {alert.status === 'en_route' && onUpdateStatus && (
                <>
                  <button
                    onClick={() => onUpdateStatus(alert.id || alert._id, 'arrived')}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    Arrived
                  </button>
                  <button
                    onClick={() => onUpdateStatus(alert.id || alert._id, 'resolved')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    Resolve
                  </button>
                </>
              )}
              {alert.status === 'arrived' && onUpdateStatus && (
                <button
                  onClick={() => onUpdateStatus(alert.id || alert._id, 'resolved')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Mark Resolved
                </button>
              )}
              {alert.status === 'resolved' && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">Resolved</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
