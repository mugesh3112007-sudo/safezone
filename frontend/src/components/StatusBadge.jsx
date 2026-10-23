import React from 'react';

export default function StatusBadge({ status = 'online', label = 'Safe & Connected' }) {
  const isOnline = status === 'online';
  return (
    <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
      <span>{label}</span>
    </div>
  );
}
