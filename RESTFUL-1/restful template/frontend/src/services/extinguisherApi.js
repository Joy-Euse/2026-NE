import api from "./api";

export const getExtinguishers = async (params) => (await api.get("/extinguishers", { params })).data;
export const getExtinguisherById = async (id) => (await api.get(`/extinguishers/${id}`)).data.data;
export const createExtinguisher = async (data) => (await api.post("/extinguishers", data)).data.data;
export const updateExtinguisher = async (id, data) => (await api.put(`/extinguishers/${id}`, data)).data.data;
export const updateExtinguisherStatus = async (id, data) => (await api.patch(`/extinguishers/${id}/status`, data)).data.data;
export const retireExtinguisher = async (id) => (await api.delete(`/extinguishers/${id}`)).data.data;
