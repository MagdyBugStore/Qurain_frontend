const STATUS_CLASS = {
  scheduled: "status-scheduled",
  completed: "status-completed",
  cancelled: "status-cancelled",
  rescheduled: "status-rescheduled",
};

export function StatusBadge({ status }) {
  const cls = STATUS_CLASS[status] || "";
  return (
    <span className={`status-badge ${cls}`}>
      <span className="status-dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

