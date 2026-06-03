const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });

  const text = query.toString();
  return text ? `?${text}` : "";
};

export const getJson = async ({ req, url, params }) => {
  const response = await fetch(`${url}${buildQuery(params)}`, {
    headers: {
      authorization: `Bearer ${req.accessToken}`,
      "x-request-id": req.requestId,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Service request failed");
    error.statusCode = response.status;
    error.code = payload?.error?.code || "SERVICE_REQUEST_FAILED";
    throw error;
  }

  return payload;
};
