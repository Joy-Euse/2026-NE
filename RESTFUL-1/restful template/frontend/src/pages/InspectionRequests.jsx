import { useEffect, useState } from "react";
import { FiCheckCircle, FiUserCheck, FiClock } from "react-icons/fi";
import { useSelector } from "react-redux";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import LoadingState from "../components/LoadingState";
import Table from "../components/Table";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import { assignInspector, cancelInspection, completeInspection, getInspections } from "../services/inspectionApi";
import { getUsers } from "../services/userApi";
import { apiError } from "../services/api";
import { fullName } from "../utils/roles";

function InspectionRequests() {
  const { user } = useSelector((state) => state.auth);
  const [rows, setRows] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [filters, setFilters] = useState({ status: "REQUESTED" });
  const [assigningInspector, setAssigningInspector] = useState(null);
  const [inspectorId, setInspectorId] = useState("");
  const [completingInspection, setCompletingInspection] = useState(null);
  const [completionForm, setCompletionForm] = useState({ result: "PASS", resultNotes: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadInspections = () => {
    setLoading(true);
    setError("");
    getInspections({ ...filters, limit: 50 })
      .then((res) => setRows(res.data || []))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  };

  const loadInspectors = () => {
    if (user?.role === "ADMIN") {
      getUsers({ limit: 100, status: "ACTIVE" })
        .then((res) => {
          const inspectorList = (res.data || []).filter((u) => u.role === "INSPECTOR");
          setInspectors(inspectorList);
        })
        .catch(() => setInspectors([]));
    }
  };

  useEffect(() => {
    loadInspections();
    loadInspectors();
  }, [user?.role]);

  const handleAssignInspector = async (inspection) => {
    setError("");
    setSuccess("");

    if (!inspectorId) {
      return setError("Please select an inspector");
    }

    try {
      await assignInspector(inspection.id, { assignedInspectorId: inspectorId });
      const inspector = inspectors.find((i) => i.id === inspectorId);
      setSuccess(`Inspector ${fullName(inspector)} assigned to inspection on ${inspection.inspectionDate}`);
      setAssigningInspector(null);
      setInspectorId("");
      loadInspections();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const handleCompleteInspection = async (inspection) => {
    setError("");
    setSuccess("");

    if (!completionForm.result) {
      return setError("Please select an inspection result");
    }

    try {
      await completeInspection(inspection.id, completionForm);
      setSuccess(`Inspection completed with result: ${completionForm.result}`);
      setCompletingInspection(null);
      setCompletionForm({ result: "PASS", resultNotes: "" });
      loadInspections();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const handleCancelInspection = async (inspection) => {
    if (!window.confirm("Are you sure you want to cancel this inspection?")) return;

    try {
      await cancelInspection(inspection.id, { cancelReason: "Cancelled by admin" });
      setSuccess("Inspection cancelled successfully");
      loadInspections();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const getStatusBadge = (status) => {
    const tones = {
      REQUESTED: "amber",
      ASSIGNED: "blue",
      SCHEDULED: "purple",
      COMPLETED: "green",
      CANCELLED: "gray",
      OVERDUE: "red",
    };
    return <Badge tone={tones[status] || "slate"}>{status}</Badge>;
  };

  const columns = [
    { key: "inspectionDate", label: "Date" },
    { key: "inspectionTime", label: "Time" },
    {
      key: "extinguisherId",
      label: "Extinguisher",
      render: (row) => <span className="text-sm font-mono">{row.extinguisherId.slice(0, 8)}...</span>,
    },
    {
      key: "scheduledByUserId",
      label: "Requested By",
      render: (row) => <span className="text-sm font-mono">{row.scheduledByUserId.slice(0, 8)}...</span>,
    },
    {
      key: "assignedInspectorId",
      label: "Inspector",
      render: (row) =>
        row.assignedInspectorId ? (
          <span className="text-sm font-mono">{row.assignedInspectorId.slice(0, 8)}...</span>
        ) : (
          <span className="text-sm text-slate-400">Not assigned</span>
        ),
    },
    { key: "status", label: "Status", render: (row) => getStatusBadge(row.status) },
  ];

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-secondary">Inspection Requests</h1>
        <p className="text-sm text-slate-500">
          {user?.role === "ADMIN"
            ? "Manage inspection requests from users and assign inspectors"
            : "View and complete inspections assigned to you"}
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
        <FormField label="Status">
          <select
            className="rounded-md border border-slate-300 px-3 py-2"
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
          >
            <option value="">All</option>
            <option>REQUESTED</option>
            <option>ASSIGNED</option>
            <option>SCHEDULED</option>
            <option>COMPLETED</option>
            <option>CANCELLED</option>
            <option>OVERDUE</option>
          </select>
        </FormField>
        <Button className="bg-secondary text-white hover:bg-secondary/90" onClick={loadInspections}>
          Refresh
        </Button>
      </Toolbar>

      {loading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<FiClock className="h-12 w-12" />}
          title="No inspections found"
          message={
            filters.status === "REQUESTED"
              ? "No pending inspection requests at the moment"
              : "No inspections match your filters"
          }
        />
      ) : (
        <Card title={`${rows.length} Inspection${rows.length !== 1 ? "s" : ""}`}>
          <Table
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            actions={(row) => (
              <div className="flex gap-2">
                {user?.role === "ADMIN" && row.status === "REQUESTED" && (
                  <Button
                    className="bg-primary text-white hover:bg-primary/90"
                    onClick={() => setAssigningInspector(row)}
                  >
                    <FiUserCheck /> Assign Inspector
                  </Button>
                )}

                {user?.role === "INSPECTOR" &&
                  row.status === "ASSIGNED" &&
                  row.assignedInspectorId === user?.id && (
                    <Button
                      className="bg-success text-white hover:bg-success/90"
                      onClick={() => setCompletingInspection(row)}
                    >
                      <FiCheckCircle /> Complete
                    </Button>
                  )}

                {user?.role === "ADMIN" &&
                  (row.status === "ASSIGNED" || row.status === "SCHEDULED") && (
                    <Button
                      className="bg-success text-white hover:bg-success/90"
                      onClick={() => setCompletingInspection(row)}
                    >
                      <FiCheckCircle /> Complete
                    </Button>
                  )}

                {(user?.role === "ADMIN" || user?.role === "INSPECTOR") &&
                  row.status !== "COMPLETED" &&
                  row.status !== "CANCELLED" && (
                    <Button
                      className="bg-danger/10 text-danger hover:bg-danger/20"
                      onClick={() => handleCancelInspection(row)}
                    >
                      Cancel
                    </Button>
                  )}
              </div>
            )}
          />
        </Card>
      )}

      {/* Assign Inspector Modal */}
      {assigningInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md" title="Assign Inspector">
            <div className="mb-4 space-y-2 text-sm">
              <div>
                <span className="font-medium">Date:</span> {assigningInspector.inspectionDate} at{" "}
                {assigningInspector.inspectionTime}
              </div>
              <div>
                <span className="font-medium">Extinguisher:</span> {assigningInspector.extinguisherId.slice(0, 12)}
                ...
              </div>
            </div>

            <FormField label="Select Inspector">
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={inspectorId}
                onChange={(e) => setInspectorId(e.target.value)}
              >
                <option value="">Choose inspector...</option>
                {inspectors.map((inspector) => (
                  <option key={inspector.id} value={inspector.id}>
                    {fullName(inspector)} ({inspector.email})
                  </option>
                ))}
              </select>
            </FormField>

            <div className="mt-4 flex gap-2 border-t pt-4">
              <Button
                className="flex-1 bg-primary text-white hover:bg-primary/90"
                onClick={() => handleAssignInspector(assigningInspector)}
              >
                <FiUserCheck /> Assign
              </Button>
              <Button
                className="border border-slate-300 bg-white"
                onClick={() => {
                  setAssigningInspector(null);
                  setInspectorId("");
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Complete Inspection Modal */}
      {completingInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md" title="Complete Inspection">
            <div className="mb-4 space-y-2 text-sm">
              <div>
                <span className="font-medium">Date:</span> {completingInspection.inspectionDate} at{" "}
                {completingInspection.inspectionTime}
              </div>
              <div>
                <span className="font-medium">Extinguisher:</span> {completingInspection.extinguisherId.slice(0, 12)}
                ...
              </div>
            </div>

            <FormField label="Inspection Result">
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                value={completionForm.result}
                onChange={(e) => setCompletionForm({ ...completionForm, result: e.target.value })}
              >
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
                <option value="NEEDS_MAINTENANCE">NEEDS MAINTENANCE</option>
              </select>
            </FormField>

            <FormField label="Notes (optional)">
              <textarea
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                rows={3}
                placeholder="Add inspection notes..."
                value={completionForm.resultNotes}
                onChange={(e) => setCompletionForm({ ...completionForm, resultNotes: e.target.value })}
              />
            </FormField>

            <div className="mt-4 flex gap-2 border-t pt-4">
              <Button
                className="flex-1 bg-success text-white hover:bg-success/90"
                onClick={() => handleCompleteInspection(completingInspection)}
              >
                <FiCheckCircle /> Complete
              </Button>
              <Button
                className="border border-slate-300 bg-white"
                onClick={() => {
                  setCompletingInspection(null);
                  setCompletionForm({ result: "PASS", resultNotes: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

export default InspectionRequests;
