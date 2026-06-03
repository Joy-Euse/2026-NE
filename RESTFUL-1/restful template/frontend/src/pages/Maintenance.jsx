import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import LoadingState from "../components/LoadingState";
import Table from "../components/Table";
import RoleGate from "../components/RoleGate";
import { createMaintenanceLog, getMaintenanceLogs } from "../services/maintenanceApi";

function Maintenance() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ extinguisherId: "", inspectionId: "", actionTaken: "", maintenanceDate: "", issuesIdentified: "", notes: "", recommendations: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => getMaintenanceLogs({ limit: 50 }).then((res) => setRows(res.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.extinguisherId || !form.actionTaken || !form.maintenanceDate) return setError("Extinguisher, action, and maintenance date are required.");
    await createMaintenanceLog({ ...form, inspectionId: form.inspectionId || undefined });
    setForm({ extinguisherId: "", inspectionId: "", actionTaken: "", maintenanceDate: "", issuesIdentified: "", notes: "", recommendations: "" });
    load();
  };

  const fields = ["extinguisherId", "inspectionId", "actionTaken", "maintenanceDate", "issuesIdentified", "notes", "recommendations"];

  return (
    <DashboardLayout>
      <h1 className="mb-5 text-2xl font-semibold text-secondary">Maintenance</h1>
      <Alert type="error">{error}</Alert>
      <RoleGate roles={["INSPECTOR"]}>
        <Card title="Log maintenance">
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
            {fields.map((field) => (
              <FormField key={field} label={field.replace(/([A-Z])/g, " $1")}>
                <input type={field === "maintenanceDate" ? "date" : "text"} className="w-full rounded-md border px-3 py-2" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
              </FormField>
            ))}
            <div className="flex items-end"><Button className="bg-primary text-white hover:bg-primary/90">Save log</Button></div>
          </form>
        </Card>
      </RoleGate>
      <div className="mt-5">{loading ? <LoadingState /> : <Table columns={[
        { key: "maintenanceDate", label: "Date" },
        { key: "extinguisherId", label: "Extinguisher" },
        { key: "actionTaken", label: "Action" },
        { key: "issuesIdentified", label: "Issues" },
        { key: "recommendations", label: "Recommendations" },
      ]} rows={rows} getRowKey={(row) => row.id} />}</div>
    </DashboardLayout>
  );
}

export default Maintenance;
