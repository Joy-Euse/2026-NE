import { env } from "../config/env.js";
import { getJson } from "./http-client.js";

export const listExtinguishers = async ({ req, filters = {} }) => {
  const payload = await getJson({
    req,
    url: env.extinguisherServiceUrl,
    params: {
      status: filters.status,
      type: filters.type,
      building: filters.building,
      expiryBefore: filters.expiryBefore,
      page: filters.page || 1,
      limit: filters.limit || 100,
    },
  });

  return payload.data || [];
};
