// Timer.js — Live ride timer that updates every second

import { useEffect, useState } from "react";

function Timer({ startTime }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Update timer every second
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [startTime]);

  const hours = Math.floor(seconds / 3600);
  const mins  = Math.floor((seconds % 3600) / 60);
  const secs  = seconds % 60;

  const pad = n => String(n).padStart(2, "0");

  // Estimated cost so far (€0.10 per minute)
  const estimatedCost = (Math.ceil(seconds / 60) * 0.1).toFixed(2);

  return (
    <div className="timer-wrap">
      <div className="timer-display">
        {hours > 0 && <span className="timer-seg">{pad(hours)}<span className="timer-unit">h</span></span>}
        <span className="timer-seg">{pad(mins)}<span className="timer-unit">m</span></span>
        <span className="timer-seg">{pad(secs)}<span className="timer-unit">s</span></span>
      </div>
      <div className="timer-cost">
        Est. cost: <strong>€{estimatedCost}</strong>
      </div>
    </div>
  );
}

export default Timer;
