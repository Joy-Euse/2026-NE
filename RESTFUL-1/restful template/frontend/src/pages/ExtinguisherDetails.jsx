import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import { getExtinguisherById, updateExtinguisherStatus } from "../services/extinguisherApi";

function ExtinguisherDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => getExtinguisherById(id).then((data) => { setItem(data); setStatus(data.status); }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const saveStatus = async () => {
    await updateExtinguisherStatus(id, { status, reason });
    setReason("");
    load();
  };

  return (
    <DashboardLayout>
      <Alert type="error">{error}</Alert>
      {loading ? <LoadingState /> : item && (
        <div className="space-y-5">
          <Card title={`Extinguisher ${item.serialNumber}`}>
            <div className="grid gap-4 md:grid-cols-3">
              <p><span className="text-slate-500">Location:</span> {item.location}</p>
              <p><span className="text-slate-500">Building:</span> {item.building}</p>
              <p><span className="text-slate-500">Zone:</span> {item.zone || "N/A"}</p>
              <p><span className="text-slate-500">Type:</span> {item.type}</p>
              <p><span className="text-slate-500">Size:</span> {item.size}</p>
              <p><span className="text-slate-500">Status:</span> <Badge>{item.status}</Badge></p>
              <p><span className="text-slate-500">Installed:</span> {item.installationDate}</p>
              <p><span className="text-slate-500">Expires:</span> {item.expiryDate}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <select className="rounded-md border border-slate-300 px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>ACTIVE</option><option>DUE_FOR_INSPECTION</option><option>UNDER_MAINTENANCE</option><option>EXPIRED</option><option>RETIRED</option>
              </select>
              <input className="min-w-72 rounded-md border border-slate-300 px-3 py-2" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90" onClick={saveStatus}>Update status</button>
            </div>
          </Card>
          <Card title="Status history">
            <div className="space-y-2">
              {(item.statusHistory || []).map((entry) => (
                <div key={entry.id} className="rounded-md border border-slate-200 p-3 text-sm">
                  <Badge>{entry.oldStatus || "NEW"} to {entry.newStatus}</Badge>
                  <p className="mt-1 text-slate-600">{entry.reason || "No reason provided"}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ExtinguisherDetails;
