import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FilterBar from "../components/FilterBar.jsx";
import LogList from "../components/LogList.jsx";
import { formatCurrency, sumCost } from "../utils.js";

function sortLogs(logs, sortBy) {
  const copy = [...logs];
  switch (sortBy) {
    case "date-asc":
      return copy.sort((a, b) => a.date.localeCompare(b.date));
    case "cost-desc":
      return copy.sort((a, b) => b.cost - a.cost);
    case "cost-asc":
      return copy.sort((a, b) => a.cost - b.cost);
    default:
      return copy.sort((a, b) => b.date.localeCompare(a.date));
  }
}

export default function Logs({ logs, loading, onDelete }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");

  const needle = search.trim().toLowerCase();
  const filtered = sortLogs(
    logs.filter((l) => {
      const matchesCategory = category === "All" || l.category === category;
      const matchesSearch = !needle || `${l.title} ${l.vehicle} ${l.notes}`.toLowerCase().includes(needle);
      return matchesCategory && matchesSearch;
    }),
    sortBy
  );

  useEffect(() => {
    document.title = `Logs (${filtered.length}) | Gear & Garage Log`;
    return () => {
      document.title = "Gear & Garage Log";
    };
  }, [filtered.length]);

  if (loading) return <p className="muted">Loading logs...</p>;

  return (
    <section>
      <div className="page-head">
        <h1>All Logs</h1>
        <Link className="btn btn-primary" to="/logs/new">
          + Add Entry
        </Link>
      </div>

      <FilterBar
        search={search}
        category={category}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onSortChange={setSortBy}
      />

      <p className="muted result-line">
        Showing {filtered.length} of {logs.length} entries &middot; Total {formatCurrency(sumCost(filtered))}
      </p>

      <LogList logs={filtered} onDelete={onDelete} />
    </section>
  );
}
