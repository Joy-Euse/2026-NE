import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";
import FormField from "../components/FormField";
import LoadingState from "../components/LoadingState";
import Pagination from "../components/Pagination";
import Table from "../components/Table";
import Toolbar from "../components/Toolbar";
import RoleGate from "../components/RoleGate";
import { createExtinguisher, getExtinguishers, retireExtinguisher, updateExtinguisher } from "../services/extinguisherApi";
import { dateAfter, required } from "../utils/validators";

const emptyForm = { serialNumber: "", location: "", building: "", floor: "", zone: "", type: "WATER", size: "5 lb", installationDate: "", expiryDate: "", status: "ACTIVE" };

function FireExtinguishers() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", type: "", building: "" });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (page = meta.page) => {
    setLoading(true);
    getExtinguishers({ ...filters, page, limit: meta.limit })
      .then((response) => {
        setRows(response.data || []);
        setMeta(response.meta || { page, limit: 10, total: 0 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const save = async (event) => {
    event.preventDefault();
    setError("");
    if (!required(form.serialNumber) || !required(form.location) || !required(form.building)) return setError("Serial number, location, and building are required.");
    if (!dateAfter(form.expiryDate, form.installationDate)) return setError("Expiry date must be after installation date.");
    try {
      if (editing) await updateExtinguisher(editing.id, form);
      else await createExtinguisher(form);
      setForm(emptyForm);
      setEditing(null);
      load(1);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
    }
  };

  const columns = [
    { key: "serialNumber", label: "Serial", render: (row) => <Link className="font-medium text-primary" to={`/extinguishers/${row.id}`}>{row.serialNumber}</Link> },
    { key: "location", label: "Location" },
    { key: "building", label: "Building" },
    { key: "type", label: "Type" },
    { key: "size", label: "Size" },
    { key: "expiryDate", label: "Expiry" },
    { key: "status", label: "Status", render: (row) => <Badge tone={row.status === "EXPIRED" ? "red" : row.status === "ACTIVE" ? "green" : "amber"}>{row.status}</Badge> },
    {
      key: "assignmentStatus",
      label: "Assignment",
      render: (row) => (
        <Badge tone={row.assignment ? "green" : "slate"}>
          {row.assignment ? "ASSIGNED" : "NOT_ASSIGNED"}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-5 flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-secondary">Fire Extinguishers</h1><p className="text-sm text-slate-500">Track inventory, locations, expiry, and status.</p></div>
      </div>
      <div className="mb-4"><Alert type="error">{error}</Alert></div>
      <Toolbar>
        <FormField label="Search"><input className="rounded-md border border-slate-300 px-3 py-2" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></FormField>
        <FormField label="Status"><select className="rounded-md border border-slate-300 px-3 py-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All</option><option>ACTIVE</option><option>DUE_FOR_INSPECTION</option><option>UNDER_MAINTENANCE</option><option>EXPIRED</option><option>RETIRED</option></select></FormField>
        <FormField label="Type"><select className="rounded-md border border-slate-300 px-3 py-2" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option value="">All</option><option>WATER</option><option>CO2</option><option>FOAM</option><option>DRY_CHEMICAL</option></select></FormField>
        <Button className="bg-secondary text-white hover:bg-secondary/90" onClick={() => load(1)}><FiSearch /> Filter</Button>
      </Toolbar>
      <RoleGate roles={["ADMIN", "INSPECTOR"]}>
        <Card title={editing ? "Edit extinguisher" : "Register extinguisher"}>
          <form onSubmit={save} className="grid gap-3 md:grid-cols-4">
            {["serialNumber", "location", "building", "floor", "zone"].map((key) => (
              <FormField key={key} label={key.replace(/([A-Z])/g, " $1")}><input className="w-full rounded-md border border-slate-300 px-3 py-2" value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></FormField>
            ))}
            <FormField label="Type"><select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>WATER</option><option>CO2</option><option>FOAM</option><option>DRY_CHEMICAL</option></select></FormField>
            <FormField label="Size"><select className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}><option>1.5 lb</option><option>5 lb</option><option>9 lb</option><option>12 lb</option></select></FormField>
            <FormField label="Installation date"><input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.installationDate} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} /></FormField>
            <FormField label="Expiry date"><input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></FormField>
            <div className="flex items-end gap-2 md:col-span-4">
              <Button className="bg-primary text-white hover:bg-primary/90"><FiPlus /> {editing ? "Save changes" : "Register"}</Button>
              {editing && <Button type="button" className="border border-slate-300 bg-white" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</Button>}
            </div>
          </form>
        </Card>
      </RoleGate>
      <div className="mt-5">
        {loading ? <LoadingState /> : (
          <Card title="Inventory">
            <Table columns={columns} rows={rows} getRowKey={(row) => row.id} actions={(row) => (
              <div className="flex gap-2">
                <RoleGate roles={["ADMIN", "INSPECTOR"]}><Button className="border border-slate-300 bg-white" onClick={() => { setEditing(row); setForm({ ...row }); }}>Edit</Button></RoleGate>
                <RoleGate roles={["ADMIN"]}><Button className="bg-danger/10 text-danger" onClick={() => setConfirmDelete(row)}><FiTrash2 /></Button></RoleGate>
              </div>
            )} />
            <Pagination page={meta.page} total={meta.total} limit={meta.limit} onPageChange={load} />
          </Card>
        )}
      </div>
      <ConfirmDialog open={!!confirmDelete} title="Retire extinguisher?" message="This will retire the extinguisher instead of deleting the record." confirmLabel="Retire" onCancel={() => setConfirmDelete(null)} onConfirm={async () => { await retireExtinguisher(confirmDelete.id); setConfirmDelete(null); load(); }} />
    </DashboardLayout>
  );
}

export default FireExtinguishers;
