import api from "./api";

export const getInspections = async (params) => (await api.get("/inspections", { params })).data;
export const getInspectionById = async (id) => (await api.get(`/inspections/${id}`)).data.data;
export const scheduleInspection = async (data) => (await api.post("/inspections", data)).data.data;
export const updateInspection = async (id, data) => (await api.put(`/inspections/${id}`, data)).data.data;
export const completeInspection = async (id, data) => (await api.patch(`/inspections/${id}/complete`, data)).data.data;
export const cancelInspection = async (id, data) => (await api.patch(`/inspections/${id}/cancel`, data)).data.data;
export const assignInspector = async (id, data) => (await api.patch(`/inspections/${id}/assign-inspector`, data)).data.data;
