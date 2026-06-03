import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import LoadingState from "../components/LoadingState";
import Table from "../components/Table";
import Toolbar from "../components/Toolbar";
import RoleGate from "../components/RoleGate";
import { cancelInspection, completeInspection, getInspections, scheduleInspection } from "../services/inspectionApi";

function Inspections() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ status: "" });
  const [form, setForm] = useState({ extinguisherId: "", assignedInspectorId: "", inspectionDate: "", inspectionTime: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getInspections({ ...filters, limit: 50 }).then((res) => setRows(res.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.extinguisherId || !form.inspectionDate || !form.inspectionTime) return setError("Extinguisher, date, and time are required.");
    await scheduleInspection({ ...form, assignedInspectorId: form.assignedInspectorId || undefined });
    setForm({ extinguisherId: "", assignedInspectorId: "", inspectionDate: "", inspectionTime: "" });
    load();
  };

  const columns = [
    { key: "inspectionDate", label: "Date" },
    { key: "inspectionTime", label: "Time" },
    { key: "extinguisherId", label: "Extinguisher" },
    { key: "assignedInspectorId", label: "Inspector" },
    { key: "status", label: "Status", render: (row) => <Badge tone={row.status === "OVERDUE" ? "red" : row.status === "COMPLETED" ? "green" : "amber"}>{row.status}</Badge> },
    { key: "result", label: "Result" },
  ];

  return (
    <DashboardLayout>
      <h1 className="mb-5 text-2xl font-semibold text-secondary">Inspections</h1>
      <Alert type="error">{error}</Alert>
      <Card title="Schedule inspection">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-5">
          <FormField label="Extinguisher ID"><input className="w-full rounded-md border px-3 py-2" value={form.extinguisherId} onChange={(e) => setForm({ ...form, extinguisherId: e.target.value })} /></FormField>
          <FormField label="Inspector ID"><input className="w-full rounded-md border px-3 py-2" value={form.assignedInspectorId} onChange={(e) => setForm({ ...form, assignedInspectorId: e.target.value })} /></FormField>
          <FormField label="Date"><input type="date" className="w-full rounded-md border px-3 py-2" value={form.inspectionDate} onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })} /></FormField>
          <FormField label="Time"><input type="time" className="w-full rounded-md border px-3 py-2" value={form.inspectionTime} onChange={(e) => setForm({ ...form, inspectionTime: e.target.value })} /></FormField>
          <div className="flex items-end"><Button className="bg-primary text-white hover:bg-primary/90">Schedule</Button></div>
        </form>
      </Card>
      <Toolbar>
        <FormField label="Status"><select className="rounded-md border px-3 py-2" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}><option value="">All</option><option>SCHEDULED</option><option>COMPLETED</option><option>CANCELLED</option><option>OVERDUE</option></select></FormField>
        <Button className="bg-secondary text-white hover:bg-secondary/90" onClick={load}>Filter</Button>
      </Toolbar>
      {loading ? <LoadingState /> : <Table columns={columns} rows={rows} getRowKey={(row) => row.id} actions={(row) => (
        <div className="flex gap-2">
          <RoleGate roles={["INSPECTOR"]}><Button className="bg-success/10 text-success" onClick={() => completeInspection(row.id, { result: "PASS", resultNotes: "Completed from dashboard" }).then(load)}>Complete</Button></RoleGate>
          <RoleGate roles={["ADMIN", "INSPECTOR"]}><Button className="bg-danger/10 text-danger" onClick={() => cancelInspection(row.id, { cancelReason: "Cancelled from dashboard" }).then(load)}>Cancel</Button></RoleGate>
        </div>
      )} />}
    </DashboardLayout>
  );
}

export default Inspections;
