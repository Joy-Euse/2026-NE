function Badge({ children, tone = "slate" }) {
  const styles = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-success/10 text-success",
    red: "bg-danger/10 text-danger",
    amber: "bg-warning/20 text-slate-900",
    blue: "bg-secondary/10 text-secondary",
  };

  return <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${styles[tone]}`}>{children}</span>;
}

export default Badge;
