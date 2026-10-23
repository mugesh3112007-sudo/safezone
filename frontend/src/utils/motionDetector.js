// DeviceMotion validation helper for shaking phone to confirm SOS

export function initMotionDetector(onShake) {
  let shakeCount = 0;
  let lastTime = 0;
  let threshold = 15; // acceleration m/s^2

  function handleMotion(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    const currentAcc = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
    // gravity is ~9.8, so acceleration variation indicates movement
    const delta = Math.abs(currentAcc - 9.8);
    
    if (delta > threshold) {
      const now = Date.now();
      if (now - lastTime > 1000) {
        shakeCount = 1;
      } else {
        shakeCount++;
      }
      lastTime = now;

      if (shakeCount >= 3) {
        shakeCount = 0;
        if (onShake) onShake();
      }
    }
  }

  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', handleMotion, true);
  }

  return () => {
    if (window.DeviceMotionEvent) {
      window.removeEventListener('devicemotion', handleMotion, true);
    }
  };
}
