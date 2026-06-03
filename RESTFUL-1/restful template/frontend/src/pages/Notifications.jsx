import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import { getNotifications } from "../services/notificationApi";
import { useSelector } from "react-redux";

function Notifications() {
  const { user } = useSelector((state) => state.auth);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getNotifications({ userId: user?.authUserId || user?.id, limit: 50 })
      .then((res) => setRows(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <DashboardLayout>
      <h1 className="mb-5 text-2xl font-semibold text-secondary">Notifications</h1>
      <Alert type="error">{error}</Alert>
      {loading ? <LoadingState /> : (
        <Card title="Notification center">
          <div className="space-y-3">
            {rows.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <Badge tone={item.isRead ? "slate" : "blue"}>{item.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              </div>
            ))}
            {!rows.length && <p className="text-sm text-slate-500">No notifications yet.</p>}
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default Notifications;
