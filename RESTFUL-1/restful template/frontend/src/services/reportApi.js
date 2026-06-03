import api from "./api";

export const getDashboard = async () => (await api.get("/reports/dashboard")).data.data;
export const getInventoryReport = async (params) => (await api.get("/reports/inventory", { params })).data.data;
export const getInspectionReport = async (params) => (await api.get("/reports/inspections", { params })).data.data;
export const getComplianceReport = async (params) => (await api.get("/reports/compliance", { params })).data.data;
export const getMaintenanceReport = async (params) => (await api.get("/reports/maintenance", { params })).data.data;
export const createReportExport = async (data) => (await api.post("/reports/exports", data)).data.data;
export const getReportExport = async (id) => (await api.get(`/reports/exports/${id}`)).data.data;

export const downloadReportExport = async (exportRecord) => {
  const response = await api.get(`/reports/exports/${exportRecord.id}/download`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = exportRecord.fileName || `report.${exportRecord.format?.toLowerCase() || "csv"}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
