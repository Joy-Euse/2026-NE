import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/Button";
import Card from "../components/Card";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import LoadingState from "../components/LoadingState";
import Table from "../components/Table";
import {
  createReportExport,
  getComplianceReport,
  getInspectionReport,
  getInventoryReport,
  getMaintenanceReport,
} from "../services/reportApi";

const reportLoaders = {
  INVENTORY: getInventoryReport,
  INSPECTIONS: getInspectionReport,
  COMPLIANCE: getComplianceReport,
  MAINTENANCE: getMaintenanceReport,
};

function Reports() {
  const [reportType, setReportType] = useState("INVENTORY");
  const [filters, setFilters] = useState({ status: "", type: "", building: "", inspector: "", fromDate: "", toDate: "" });
  const [report, setReport] = useState(null);
  const [exportInfo, setExportInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setReport(await reportLoaders[reportType](filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    setExportInfo(await createReportExport({ reportType, format, filters }));
  };

  const rows = report?.rows || report?.recent || report?.expired || [];
  const columns = rows[0] ? Object.keys(rows[0]).slice(0, 6).map((key) => ({ key, label: key })) : [];

  return (
    <DashboardLayout>
      <h1 className="mb-5 text-2xl font-semibold text-secondary">Reports</h1>
      <Alert type="error">{error}</Alert>
      <Alert type="success">{exportInfo && `Export created: ${exportInfo.fileName}`}</Alert>
      <Card title="Report filters">
        <div className="grid gap-3 md:grid-cols-4">
          <FormField label="Report"><select className="w-full rounded-md border px-3 py-2" value={reportType} onChange={(e) => setReportType(e.target.value)}><option>INVENTORY</option><option>INSPECTIONS</option><option>COMPLIANCE</option><option>MAINTENANCE</option></select></FormField>
          {["status", "type", "building", "inspector", "fromDate", "toDate"].map((key) => (
            <FormField key={key} label={key}><input type={key.includes("Date") ? "date" : "text"} className="w-full rounded-md border px-3 py-2" value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} /></FormField>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="bg-secondary text-white hover:bg-secondary/90" onClick={load}>Run report</Button>
          <Button className="border border-slate-300 bg-white text-slate-700" onClick={() => exportReport("PDF")}><FiDownload /> PDF</Button>
          <Button className="border border-slate-300 bg-white text-slate-700" onClick={() => exportReport("CSV")}><FiDownload /> CSV</Button>
        </div>
      </Card>
      <div className="mt-5">
        {loading ? <LoadingState /> : report && (
          <Card title="Results">
            <pre className="mb-4 rounded-md bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(report.summary, null, 2)}</pre>
            {columns.length ? <Table columns={columns} rows={rows} getRowKey={(row, index) => row.id || index} /> : null}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Reports;
