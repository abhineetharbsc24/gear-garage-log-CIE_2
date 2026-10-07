export const CATEGORIES = ["Service", "Repair", "Modification", "Gear", "Fuel", "Other"];

export function todayLocal() {
  return new Date().toLocaleDateString("en-CA");
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatMonth(ym) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function sumCost(logs) {
  return logs.reduce((sum, l) => sum + l.cost, 0);
}
