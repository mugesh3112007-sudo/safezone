import React from 'react';

export default function ConsentNotice() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm my-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
          🔒
        </div>
        <h4 className="text-sm font-bold text-slate-800">Your Privacy Matters</h4>
      </div>
      <ul className="space-y-2 text-xs text-slate-600">
        <li className="flex items-start space-x-2">
          <span className="text-teal-500 font-bold">✓</span>
          <span>Location is shared only during an active alert or SOS.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-teal-500 font-bold">✓</span>
          <span>Crowd heatmap data is completely anonymous.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-teal-500 font-bold">✓</span>
          <span>All personal data is permanently deleted 24 hours after the event.</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-teal-500 font-bold">✓</span>
          <span>Fully compliant with DPDP Act 2023.</span>
        </li>
      </ul>
    </div>
  );
}
