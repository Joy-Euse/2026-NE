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
  downloadReportExport,
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

const statusOptions = {
  INVENTORY: ["ACTIVE", "DUE_FOR_INSPECTION", "UNDER_MAINTENANCE", "EXPIRED", "RETIRED"],
  INSPECTIONS: ["SCHEDULED", "COMPLETED", "CANCELLED", "OVERDUE"],
  COMPLIANCE: ["ACTIVE", "DUE_FOR_INSPECTION", "UNDER_MAINTENANCE", "EXPIRED", "RETIRED"],
  MAINTENANCE: [],
};

const extinguisherTypes = ["WATER", "CO2", "FOAM", "DRY_CHEMICAL"];

const normalizeFilters = (reportType, values) => {
  const allowedStatuses = statusOptions[reportType] || [];
  return {
    status: allowedStatuses.includes(values.status) ? values.status : "",
    type: ["INVENTORY", "COMPLIANCE"].includes(reportType) ? values.type : "",
    building: ["INVENTORY", "COMPLIANCE"].includes(reportType) ? values.building : "",
    inspector: ["INSPECTIONS", "MAINTENANCE"].includes(reportType) ? values.inspector : "",
    fromDate: values.fromDate,
    toDate: values.toDate,
  };
};

const cleanFilters = (reportType, values) => {
  const next = normalizeFilters(reportType, values);
  return Object.fromEntries(Object.entries(next).filter(([, value]) => value !== ""));
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
      setReport(await reportLoaders[reportType](cleanFilters(reportType, filters)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    setError("");
    setExportInfo(null);

    try {
      const exportRecord = await createReportExport({ reportType, format, filters: cleanFilters(reportType, filters) });
      setExportInfo(exportRecord);
      await downloadReportExport(exportRecord);
    } catch (err) {
      setError(err.message);
    }
  };

  const rows = report?.rows || report?.recent || report?.expired || [];
  const columns = rows[0] ? Object.keys(rows[0]).slice(0, 6).map((key) => ({ key, label: key })) : [];
  const canFilterByStatus = statusOptions[reportType]?.length > 0;
  const canFilterByExtinguisher = ["INVENTORY", "COMPLIANCE"].includes(reportType);
  const canFilterByInspector = ["INSPECTIONS", "MAINTENANCE"].includes(reportType);

  return (
    <DashboardLayout>
      <h1 className="mb-5 text-2xl font-semibold text-secondary">Reports</h1>
      <Alert type="error">{error}</Alert>
      <Alert type="success">{exportInfo && `Export downloaded: ${exportInfo.fileName}`}</Alert>
      <Card title="Report filters">
        <div className="grid gap-3 md:grid-cols-4">
          <FormField label="Report">
            <select
              className="w-full rounded-md border px-3 py-2"
              value={reportType}
              onChange={(e) => {
                const nextType = e.target.value;
                setReportType(nextType);
                setFilters((current) => normalizeFilters(nextType, current));
                setReport(null);
                setExportInfo(null);
              }}
            >
              <option>INVENTORY</option>
              <option>INSPECTIONS</option>
              <option>COMPLIANCE</option>
              <option>MAINTENANCE</option>
            </select>
          </FormField>

          {canFilterByStatus ? (
            <FormField label="Status">
              <select className="w-full rounded-md border px-3 py-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All statuses</option>
                {statusOptions[reportType].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </FormField>
          ) : null}

          {canFilterByExtinguisher ? (
            <>
              <FormField label="Type">
                <select className="w-full rounded-md border px-3 py-2" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                  <option value="">All types</option>
                  {extinguisherTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </FormField>
              <FormField label="Building">
                <input className="w-full rounded-md border px-3 py-2" value={filters.building} onChange={(e) => setFilters({ ...filters, building: e.target.value })} />
              </FormField>
            </>
          ) : null}

          {canFilterByInspector ? (
            <FormField label="Inspector ID">
              <input className="w-full rounded-md border px-3 py-2" value={filters.inspector} onChange={(e) => setFilters({ ...filters, inspector: e.target.value })} />
            </FormField>
          ) : null}

          <FormField label="From date"><input type="date" className="w-full rounded-md border px-3 py-2" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} /></FormField>
          <FormField label="To date"><input type="date" className="w-full rounded-md border px-3 py-2" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} /></FormField>
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
