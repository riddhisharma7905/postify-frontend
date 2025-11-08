const API_BASE = process.env.REACT_APP_BACKEND_URL;

export const request = async (endpoint, method = "GET", body = null, headers = {}) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Request failed");
  }

  return res.json();
};
