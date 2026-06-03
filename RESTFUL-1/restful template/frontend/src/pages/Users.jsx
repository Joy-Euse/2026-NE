import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/Button";
import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import Table from "../components/Table";
import { changeUserRole, changeUserStatus, deactivateUser, getUsers } from "../services/userApi";

function Users() {
  const [rows, setRows] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => getUsers({ limit: 100 }).then((res) => setRows(res.data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const columns = [
    { key: "firstName", label: "First name" },
    { key: "lastName", label: "Last name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (row) => <Badge tone="blue">{row.role}</Badge> },
    { key: "status", label: "Status", render: (row) => <Badge tone={row.status === "ACTIVE" ? "green" : "red"}>{row.status}</Badge> },
  ];

  return (
    <DashboardLayout>
      <h1 className="mb-5 text-2xl font-semibold text-secondary">User Management</h1>
      <Alert type="error">{error}</Alert>
      {loading ? <LoadingState /> : <Table columns={columns} rows={rows} getRowKey={(row) => row.id} actions={(row) => (
        <div className="flex flex-wrap gap-2">
          <select className="rounded-md border px-2 py-1 text-sm" value={row.role} onChange={(e) => changeUserRole(row.id, e.target.value).then(load)}><option>ADMIN</option><option>INSPECTOR</option><option>USER</option></select>
          <select className="rounded-md border px-2 py-1 text-sm" value={row.status} onChange={(e) => changeUserStatus(row.id, e.target.value).then(load)}><option>ACTIVE</option><option>INACTIVE</option><option>DEACTIVATED</option></select>
          <Button className="bg-danger/10 text-danger" onClick={() => setConfirm(row)}>Deactivate</Button>
        </div>
      )} />}
      <ConfirmDialog open={!!confirm} title="Deactivate user?" message="This user will no longer be active." confirmLabel="Deactivate" onCancel={() => setConfirm(null)} onConfirm={() => deactivateUser(confirm.id).then(() => { setConfirm(null); load(); })} />
    </DashboardLayout>
  );
}

export default Users;
