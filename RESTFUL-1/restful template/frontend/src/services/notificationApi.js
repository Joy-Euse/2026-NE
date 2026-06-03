import api from "./api";

export const getNotifications = async (params) => (await api.get("/notifications", { params })).data;
