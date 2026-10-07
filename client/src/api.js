const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    const error = new Error(data?.message || "Request failed");
    error.errors = data?.errors || {};
    throw error;
  }
  return data;
}

export const fetchLogs = () => request("/logs");
export const createLog = (log) => request("/logs", { method: "POST", body: JSON.stringify(log) });
export const updateLog = (id, log) => request(`/logs/${id}`, { method: "PUT", body: JSON.stringify(log) });
export const deleteLog = (id) => request(`/logs/${id}`, { method: "DELETE" });
export const fetchSummary = () => request("/summary");
