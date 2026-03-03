const STATUS_CLASS: Record<string, string> = {
  scheduled: "status-scheduled",
  completed: "status-completed",
  cancelled: "status-cancelled",
  rescheduled: "status-rescheduled",
  // Arabic status mappings
  "مجدولة": "status-scheduled",
  "مكتملة": "status-completed",
  "ملغاة": "status-cancelled",
  "أعيد جدولتها": "status-rescheduled",
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cls = STATUS_CLASS[status] || ""
  // Display status as-is (already in correct language)
  const displayText = status
  return (
    <span className={`status-badge ${cls}`}>
      <span className="status-dot" />
      {displayText}
    </span>
  )
}
