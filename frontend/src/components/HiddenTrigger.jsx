import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function HiddenTrigger() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapTime > 1000) {
      setTapCount(1);
    } else {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 5) {
        setTapCount(0);
        navigate(`/e/${eventId || 'demo'}/sos-confirm`);
      }
    }
    setLastTapTime(now);
  };

  return (
    <div
      onClick={handleTap}
      title="Secret Trigger (5 rapid taps)"
      className="fixed top-0 right-0 w-12 h-12 z-50 cursor-pointer opacity-0 hover:opacity-10 transition-opacity bg-red-500/20"
    />
  );
}
