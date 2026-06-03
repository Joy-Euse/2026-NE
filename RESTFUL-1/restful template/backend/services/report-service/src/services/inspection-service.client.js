import { env } from "../config/env.js";
import { getJson } from "./http-client.js";

export const listInspections = async ({ req, filters = {} }) => {
  const payload = await getJson({
    req,
    url: env.inspectionServiceUrl,
    params: {
      status: filters.status,
      assignedInspectorId: filters.inspector || filters.assignedInspectorId,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page || 1,
      limit: filters.limit || 100,
    },
  });

  return payload.data || [];
};

export const listMaintenance = async ({ req, filters = {} }) => {
  const payload = await getJson({
    req,
    url: env.maintenanceServiceUrl,
    params: {
      inspectorId: filters.inspector || filters.assignedInspectorId,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page || 1,
      limit: filters.limit || 100,
    },
  });

  return payload.data || [];
};
