interface Toast {
  id: string | number;
  type: string;
  msg: string;
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === "success" ? "✅" : "ℹ️"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
