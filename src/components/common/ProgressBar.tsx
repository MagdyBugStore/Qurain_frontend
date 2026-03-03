interface ProgressBarProps {
  pct: number
}

export function ProgressBar({ pct }: ProgressBarProps) {
  return (
    <div className="progress-bar-outer">
      <div className="progress-bar-inner" style={{ width: `${pct}%` }} />
    </div>
  )
}
