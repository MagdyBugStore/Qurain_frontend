import React from "react";

export function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="progress-bar-outer">
      <div className="progress-bar-inner" style={{ width: `${pct}%` }} />
    </div>
  );
}
