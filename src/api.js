const BASE_URL = "http://localhost:5001";

export const request = async (url, method = "GET", data) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return await res.json();
};
