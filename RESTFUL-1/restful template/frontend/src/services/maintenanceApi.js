import api from "./api";

export const getMaintenanceLogs = async (params) => (await api.get("/maintenance", { params })).data;
export const getMaintenanceById = async (id) => (await api.get(`/maintenance/${id}`)).data.data;
export const createMaintenanceLog = async (data) => (await api.post("/maintenance", data)).data.data;
