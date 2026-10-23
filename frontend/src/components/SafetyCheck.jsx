import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { initMotionDetector } from '../utils/motionDetector';

export default function SafetyCheck({ onTimeout }) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeout) onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const cleanupMotion = initMotionDetector(() => {
      // Shake detected - immediate alert
      clearInterval(timer);
      if (onTimeout) onTimeout();
    });

    return () => {
      clearInterval(timer);
      cleanupMotion();
    };
  }, [onTimeout]);

  return (
    <div className="fixed inset-0 bg-[#0F1B33]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-white animate-fade-in">
      <div className="relative w-36 h-36 flex items-center justify-center mb-8">
        {/* Animated circle countdown */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#1E293B"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="6"
            strokeDasharray="276"
            strokeDashoffset={276 - (276 * (5 - countdown)) / 5}
            className="transition-all duration-1000 linear"
          />
        </svg>
        <span className="text-4xl font-bold">{countdown}</span>
      </div>

      <h2 className="text-2xl font-bold mb-2 text-center">Are you OK?</h2>
      <p className="text-slate-300 text-sm text-center max-w-xs mb-8">
        Sending silent alert to security guards in {countdown} seconds. Shake your phone to trigger instantly.
      </p>

      <button
        onClick={() => navigate(-1)}
        className="w-full max-w-xs bg-[#34D399] hover:bg-[#10B981] text-[#0F1B33] font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95 text-lg"
      >
        I&apos;M OK - CANCEL
      </button>
    </div>
  );
}
