import { useEffect, useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiTool } from "react-icons/fi";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import { getDashboard } from "../services/reportApi";

function Stat({ icon: Icon, label, value }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{value ?? 0}</p>
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const summary = report?.summary || {};

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-secondary">Dashboard</h1>
        <p className="text-sm text-slate-500">Live operational status from inventory, inspections, and maintenance.</p>
      </div>
      <Alert type="error">{error}</Alert>
      {loading ? <LoadingState /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat icon={FiCheckCircle} label="Active extinguishers" value={summary.activeExtinguishers} />
          <Stat icon={FiClock} label="Pending inspections" value={summary.pendingInspections} />
          <Stat icon={FiAlertTriangle} label="Overdue inspections" value={summary.overdueInspections} />
          <Stat icon={FiTool} label="Recent maintenance" value={summary.recentMaintenanceCount} />
        </div>
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
