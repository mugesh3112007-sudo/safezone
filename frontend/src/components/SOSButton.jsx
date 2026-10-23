import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function SOSButton() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  const startHold = (e) => {
    e.preventDefault();
    setIsHolding(true);
    setProgress(0);
    const startTime = Date.now();
    const duration = 2000; // 2 seconds

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
    }, 50);

    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      setIsHolding(false);
      navigate(`/e/${eventId || 'demo'}/sos-confirm`);
    }, duration);
  };

  const cancelHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsHolding(false);
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center justify-center my-6">
      <div className="relative">
        {/* Progress ring */}
        {isHolding && (
          <svg className="absolute -inset-2 w-28 h-28 pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#FF6B6B"
              strokeWidth="4"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * progress) / 100}
              className="transition-all duration-75"
            />
          </svg>
        )}
        <button
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          onMouseLeave={cancelHold}
          className="touch-target w-24 h-24 rounded-full bg-[#1B2A4A] border-2 border-[#FF6B6B]/40 shadow-lg flex flex-col items-center justify-center text-white active:scale-95 transition-transform select-none cursor-pointer"
        >
          <svg className="w-8 h-8 text-[#FF6B6B] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-[11px] font-medium tracking-tight text-slate-200">Hold for Help</span>
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">Hold for 2 seconds to trigger silent SOS</p>
    </div>
  );
}
