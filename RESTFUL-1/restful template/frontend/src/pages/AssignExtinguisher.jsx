import { useEffect, useState } from "react";
import { FiUserPlus, FiX, FiSearch, FiUser } from "react-icons/fi";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Badge from "../components/Badge";
import LoadingState from "../components/LoadingState";
import Pagination from "../components/Pagination";
import Table from "../components/Table";
import FormField from "../components/FormField";
import Toolbar from "../components/Toolbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { getExtinguishers, assignExtinguisher, removeAssignment } from "../services/extinguisherApi";
import { getUsers } from "../services/userApi";
import { apiError } from "../services/api";
import { fullName } from "../utils/roles";

function AssignExtinguisher() {
  const [extinguishers, setExtinguishers] = useState([]);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", building: "" });
  const [assignForm, setAssignForm] = useState({ extinguisherId: "", assignedUserId: "", notes: "" });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [confirmUnassign, setConfirmUnassign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadExtinguishers = (page = meta.page) => {
    setLoading(true);
    setError("");
    getExtinguishers({ ...filters, page, limit: meta.limit, status: filters.status || "ACTIVE" })
      .then((response) => {
        setExtinguishers(response.data || []);
        setMeta(response.meta || { page, limit: 10, total: 0 });
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  };

  const loadUsers = () => {
    getUsers({ limit: 100, status: "ACTIVE" })
      .then((response) => {
        // Filter to show only USER role for assignments
        const regularUsers = (response.data || []).filter((u) => u.role === "USER");
        setUsers(regularUsers);
      })
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    loadExtinguishers(1);
    loadUsers();
  }, []);

  const openAssignModal = (extinguisher) => {
    setAssignForm({
      extinguisherId: extinguisher.id,
      assignedUserId: extinguisher.assignment?.assignedUserId || "",
      notes: extinguisher.assignment?.notes || "",
    });
    setShowAssignModal(true);
    setError("");
    setSuccess("");
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!assignForm.assignedUserId) {
      return setError("Please select a user to assign");
    }

    try {
      await assignExtinguisher(assignForm.extinguisherId, {
        assignedUserId: assignForm.assignedUserId,
        notes: assignForm.notes,
      });

      const assignedUser = users.find((u) => u.id === assignForm.assignedUserId);
      setSuccess(`Successfully assigned extinguisher to ${fullName(assignedUser)}`);
      setShowAssignModal(false);
      setAssignForm({ extinguisherId: "", assignedUserId: "", notes: "" });
      loadExtinguishers();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const handleUnassign = async () => {
    try {
      await removeAssignment(confirmUnassign.id);
      setSuccess(`Successfully removed assignment from extinguisher ${confirmUnassign.serialNumber}`);
      setConfirmUnassign(null);
      loadExtinguishers();
    } catch (err) {
      setError(apiError(err));
      setConfirmUnassign(null);
    }
  };

  const columns = [
    { key: "serialNumber", label: "Serial Number", render: (row) => <span className="font-medium text-primary">{row.serialNumber}</span> },
    { key: "location", label: "Location" },
    { key: "building", label: "Building" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status", render: (row) => <Badge tone={row.status === "ACTIVE" ? "green" : "amber"}>{row.status}</Badge> },
    {
      key: "assignment",
      label: "Assigned To",
      render: (row) => {
        if (row.assignment) {
          return (
            <div className="flex items-center gap-2">
              <FiUser className="h-4 w-4 text-slate-500" />
              <span className="text-sm">User ID: {row.assignment.assignedUserId.slice(0, 8)}...</span>
            </div>
          );
        }
        return <span className="text-sm text-slate-400">Not assigned</span>;
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-secondary">Assign Extinguishers</h1>
        <p className="text-sm text-slate-500">
          Assign fire extinguishers to users for accountability and maintenance tracking.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {success && (
        <div className="mb-4">
          <Alert type="success">{success}</Alert>
        </div>
      )}

      <Toolbar>
        <FormField label="Search">
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Serial or location..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </FormField>
        <FormField label="Status">
          <select
            className="rounded-md border border-slate-300 px-3 py-2"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All</option>
            <option>ACTIVE</option>
            <option>DUE_FOR_INSPECTION</option>
            <option>UNDER_MAINTENANCE</option>
          </select>
        </FormField>
        <FormField label="Building">
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Building name..."
            value={filters.building}
            onChange={(e) => setFilters({ ...filters, building: e.target.value })}
          />
        </FormField>
        <Button className="bg-secondary text-white hover:bg-secondary/90" onClick={() => loadExtinguishers(1)}>
          <FiSearch /> Filter
        </Button>
      </Toolbar>

      {loading ? (
        <LoadingState />
      ) : (
        <Card title="Fire Extinguishers">
          <Table
            columns={columns}
            rows={extinguishers}
            getRowKey={(row) => row.id}
            actions={(row) => (
              <div className="flex gap-2">
                <Button
                  className="bg-primary text-white hover:bg-primary/90"
                  onClick={() => openAssignModal(row)}
                >
                  <FiUserPlus /> {row.assignment ? "Reassign" : "Assign"}
                </Button>
                {row.assignment && (
                  <Button
                    className="bg-danger/10 text-danger hover:bg-danger/20"
                    onClick={() => setConfirmUnassign(row)}
                  >
                    <FiX /> Remove
                  </Button>
                )}
              </div>
            )}
          />
          <Pagination page={meta.page} total={meta.total} limit={meta.limit} onPageChange={loadExtinguishers} />
        </Card>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md" title="Assign Extinguisher">
            <form onSubmit={handleAssign} className="space-y-4">
              <FormField label="Select User">
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  value={assignForm.assignedUserId}
                  onChange={(e) => setAssignForm({ ...assignForm, assignedUserId: e.target.value })}
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {fullName(user)} ({user.email})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Assignment Notes (optional)">
                <textarea
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  rows={3}
                  placeholder="Add notes about this assignment..."
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  maxLength={500}
                />
                <div className="text-xs text-slate-500">{assignForm.notes.length}/500 characters</div>
              </FormField>

              <div className="flex gap-2 border-t pt-4">
                <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90">
                  <FiUserPlus /> Assign
                </Button>
                <Button
                  type="button"
                  className="border border-slate-300 bg-white"
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssignForm({ extinguisherId: "", assignedUserId: "", notes: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Unassign Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmUnassign}
        title="Remove Assignment?"
        message={`This will remove the assignment for extinguisher ${confirmUnassign?.serialNumber}. The user will no longer see this equipment in their list.`}
        confirmLabel="Remove Assignment"
        onCancel={() => setConfirmUnassign(null)}
        onConfirm={handleUnassign}
      />
    </DashboardLayout>
  );
}

export default AssignExtinguisher;
