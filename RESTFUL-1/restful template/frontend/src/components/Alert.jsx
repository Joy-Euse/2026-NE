function Alert({ type = "info", children }) {
  const styles = {
    error: "border-danger/20 bg-danger/5 text-danger",
    success: "border-success/20 bg-success/5 text-success",
    info: "border-slate-200 bg-slate-50 text-slate-700",
    warning: "border-warning/30 bg-warning/10 text-slate-900",
  };

  if (!children) return null;

  return <div className={`rounded-md border px-3 py-2 text-sm ${styles[type]}`}>{children}</div>;
}

export default Alert;
