export function ProgressBar({ pct }) {
  return (
    <div className="progress-bar-outer">
      <div className="progress-bar-inner" style={{ width: `${pct}%` }} />
    </div>
  );
}

