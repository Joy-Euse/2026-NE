import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiCalendar, FiMapPin } from "react-icons/fi";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Badge from "../components/Badge";
import LoadingState from "../components/LoadingState";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { getMyExtinguishers } from "../services/extinguisherApi";
import { scheduleInspection } from "../services/inspectionApi";
import { apiError } from "../services/api";

function MyExtinguishers() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requestingInspection, setRequestingInspection] = useState(null);
  const [inspectionForm, setInspectionForm] = useState({ inspectionDate: "", inspectionTime: "" });

  const load = (page = meta.page) => {
    setLoading(true);
    setError("");
    getMyExtinguishers({ page, limit: meta.limit })
      .then((response) => {
        setRows(response.data || []);
        setMeta(response.meta || { page, limit: 10, total: 0 });
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, []);

  const requestInspection = async (extinguisher) => {
    setError("");
    setSuccess("");
    if (!inspectionForm.inspectionDate || !inspectionForm.inspectionTime) {
      return setError("Please select date and time for the inspection");
    }

    try {
      await scheduleInspection({
        extinguisherId: extinguisher.id,
        inspectionDate: inspectionForm.inspectionDate,
        inspectionTime: inspectionForm.inspectionTime,
      });
      setSuccess(`Inspection requested for ${extinguisher.serialNumber}. An admin will assign an inspector soon.`);
      setRequestingInspection(null);
      setInspectionForm({ inspectionDate: "", inspectionTime: "" });
    } catch (err) {
      setError(apiError(err));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "DUE_FOR_INSPECTION":
        return "amber";
      case "UNDER_MAINTENANCE":
        return "blue";
      case "EXPIRED":
        return "red";
      case "RETIRED":
        return "gray";
      default:
        return "slate";
    }
  };

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-secondary">My Assigned Extinguishers</h1>
        <p className="text-sm text-slate-500">
          View and manage fire extinguishers assigned to you. You can request inspections for your equipment.
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

      {loading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<FiAlertCircle className="h-12 w-12" />}
          title="No assigned extinguishers"
          message="You don't have any fire extinguishers assigned to you yet. Contact your administrator if you need equipment assigned."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((ext) => (
              <Card key={ext.id} className="relative">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <Link
                      to={`/extinguishers/${ext.id}`}
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      {ext.serialNumber}
                    </Link>
                    <Badge tone={getStatusColor(ext.status)} className="ml-2">
                      {ext.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FiMapPin className="h-4 w-4" />
                    <span className="font-medium">{ext.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="font-medium">Building:</span> {ext.building}
                    </div>
                    {ext.floor && (
                      <div>
                        <span className="font-medium">Floor:</span> {ext.floor}
                      </div>
                    )}
                    {ext.zone && (
                      <div className="col-span-2">
                        <span className="font-medium">Zone:</span> {ext.zone}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="font-medium">Type:</span> {ext.type}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {ext.size}
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FiCalendar className="h-4 w-4" />
                      <span className="font-medium">Expiry:</span> {ext.expiryDate}
                    </div>
                    {isExpiringSoon(ext.expiryDate) && (
                      <div className="mt-1 text-xs text-amber-600">
                        ⚠️ Expiring soon - request inspection
                      </div>
                    )}
                  </div>

                  {ext.assignment?.notes && (
                    <div className="border-t pt-2 text-slate-600">
                      <span className="font-medium">Assignment Notes:</span>
                      <p className="mt-1 text-xs italic">{ext.assignment.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t pt-3">
                  {requestingInspection === ext.id ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-slate-700">Request Inspection</div>
                      <input
                        type="date"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={inspectionForm.inspectionDate}
                        onChange={(e) =>
                          setInspectionForm({ ...inspectionForm, inspectionDate: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <input
                        type="time"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={inspectionForm.inspectionTime}
                        onChange={(e) =>
                          setInspectionForm({ ...inspectionForm, inspectionTime: e.target.value })
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-primary text-white hover:bg-primary/90"
                          onClick={() => requestInspection(ext)}
                        >
                          Submit Request
                        </Button>
                        <Button
                          className="border border-slate-300 bg-white"
                          onClick={() => {
                            setRequestingInspection(null);
                            setInspectionForm({ inspectionDate: "", inspectionTime: "" });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-secondary text-white hover:bg-secondary/90"
                      onClick={() => setRequestingInspection(ext.id)}
                    >
                      <FiCalendar className="mr-2" />
                      Request Inspection
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Pagination page={meta.page} total={meta.total} limit={meta.limit} onPageChange={load} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default MyExtinguishers;
