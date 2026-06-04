import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import LoadingState from "../components/LoadingState";
import Table from "../components/Table";
import RoleGate from "../components/RoleGate";
import { apiError } from "../services/api";
import { getExtinguishers } from "../services/extinguisherApi";
import { getInspections } from "../services/inspectionApi";
import { createMaintenanceLog, getMaintenanceLogs } from "../services/maintenanceApi";

function Maintenance() {
  const [rows, setRows] = useState([]);
  const [extinguishers, setExtinguishers] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [form, setForm] = useState({ extinguisherId: "", inspectionId: "", actionTaken: "", maintenanceDate: "", issuesIdentified: "", notes: "", recommendations: "" });
  const [loading, setLoading] = useState(true);
  const [loadingExtinguishers, setLoadingExtinguishers] = useState(true);
  const [loadingInspections, setLoadingInspections] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => getMaintenanceLogs({ limit: 50 }).then((res) => setRows(res.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  const loadExtinguishers = () =>
    getExtinguishers({ limit: 100, status: "ACTIVE" })
      .then((res) => setExtinguishers(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingExtinguishers(false));
  const loadInspections = () =>
    getInspections({ limit: 100 })
      .then((res) => setInspections(res.data || []))
      .catch(() => setInspections([]))
      .finally(() => setLoadingInspections(false));

  useEffect(() => {
    load();
    loadExtinguishers();
    loadInspections();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.extinguisherId || !form.actionTaken || !form.maintenanceDate) {
      return setError("Extinguisher, action, and maintenance date are required.");
    }

    setSaving(true);
    try {
      await createMaintenanceLog({
        ...form,
        inspectionId: form.inspectionId || undefined,
        issuesIdentified: form.issuesIdentified || undefined,
        notes: form.notes || undefined,
        recommendations: form.recommendations || undefined,
      });
      setForm({ extinguisherId: "", inspectionId: "", actionTaken: "", maintenanceDate: "", issuesIdentified: "", notes: "", recommendations: "" });
      setSuccess("Maintenance log saved.");
      load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const extinguisherLabel = (extinguisher) =>
    [extinguisher.serialNumber, extinguisher.location, extinguisher.building].filter(Boolean).join(" - ");

  const extinguisherById = new Map(extinguishers.map((extinguisher) => [extinguisher.id, extinguisher]));
  const visibleInspections = form.extinguisherId
    ? inspections.filter((inspection) => inspection.extinguisherId === form.extinguisherId)
    : inspections;
  const inspectionLabel = (inspection) =>
    [inspection.inspectionDate, inspection.inspectionTime, inspection.status].filter(Boolean).join(" - ");

  const fields = [
    { key: "actionTaken", label: "Action taken" },
    { key: "maintenanceDate", label: "Maintenance date", type: "date" },
    { key: "issuesIdentified", label: "Issues identified" },
    { key: "notes", label: "Notes" },
    { key: "recommendations", label: "Recommendations" },
  ];

  return (
    <DashboardLayout>
      <h1 className="mb-5 text-2xl font-semibold text-secondary">Maintenance</h1>
      <Alert type="error">{error}</Alert>
      <Alert type="success">{success}</Alert>
      <RoleGate roles={["INSPECTOR"]}>
        <Card title="Log maintenance">
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
            <FormField label="Extinguisher">
              <select
                className="w-full rounded-md border px-3 py-2"
                value={form.extinguisherId}
                onChange={(e) => setForm({ ...form, extinguisherId: e.target.value, inspectionId: "" })}
                disabled={loadingExtinguishers}
              >
                <option value="">{loadingExtinguishers ? "Loading extinguishers..." : "Select extinguisher"}</option>
                {extinguishers.map((extinguisher) => (
                  <option key={extinguisher.id} value={extinguisher.id}>
                    {extinguisherLabel(extinguisher)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Inspection">
              <select
                className="w-full rounded-md border px-3 py-2"
                value={form.inspectionId}
                onChange={(e) => setForm({ ...form, inspectionId: e.target.value })}
                disabled={loadingInspections}
              >
                <option value="">{loadingInspections ? "Loading inspections..." : "No related inspection"}</option>
                {visibleInspections.map((inspection) => (
                  <option key={inspection.id} value={inspection.id}>
                    {inspectionLabel(inspection)}
                  </option>
                ))}
              </select>
            </FormField>
            {fields.map((field) => (
              <FormField key={field.key} label={field.label}>
                <input type={field.type || "text"} className="w-full rounded-md border px-3 py-2" value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />
              </FormField>
            ))}
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="bg-primary text-white hover:bg-primary/90">
                {saving ? "Saving..." : "Save log"}
              </Button>
            </div>
          </form>
        </Card>
      </RoleGate>
      <div className="mt-5">{loading ? <LoadingState /> : <Table columns={[
        { key: "maintenanceDate", label: "Date" },
        { key: "inspectorName", label: "Inspector" },
        {
          key: "extinguisherId",
          label: "Extinguisher",
          render: (row) => {
            const extinguisher = extinguisherById.get(row.extinguisherId);
            return extinguisher ? extinguisherLabel(extinguisher) : row.extinguisherId;
          },
        },
        { key: "actionTaken", label: "Action" },
        { key: "issuesIdentified", label: "Issues" },
        { key: "recommendations", label: "Recommendations" },
      ]} rows={rows} getRowKey={(row) => row.id} />}</div>
    </DashboardLayout>
  );
}

export default Maintenance;
