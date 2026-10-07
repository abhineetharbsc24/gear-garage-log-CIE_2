import { useEffect, useState } from "react";
import { fetchSummary } from "../api.js";
import StatCard from "../components/StatCard.jsx";
import { formatCurrency, formatMonth } from "../utils.js";

function BarRow({ label, value, max, caption }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 3 : 0) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${width}%` }} />
      </div>
      <span className="bar-value">
        {formatCurrency(value)}
        {caption && <span className="muted small"> {caption}</span>}
      </span>
    </div>
  );
}

export default function Summary() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSummary()
      .then(setSummary)
      .catch(() => setError("Could not load the summary from the API."));
  }, []);

  if (error) return <div className="banner banner-error">{error}</div>;
  if (!summary) return <p className="muted">Crunching numbers...</p>;

  const maxCategory = Math.max(0, ...summary.byCategory.map((c) => c.total));
  const maxMonth = Math.max(0, ...summary.byMonth.map((m) => m.total));
  const average = summary.byMonth.length ? summary.total / summary.byMonth.length : 0;

  return (
    <section>
      <div className="page-head">
        <h1>Spending Summary</h1>
      </div>

      <div className="stat-grid">
        <StatCard label="Total spend" value={formatCurrency(summary.total)} hint={`${summary.count} entries`} />
        <StatCard label="Monthly average" value={formatCurrency(Math.round(average))} hint={`${summary.byMonth.length} active months`} />
        <StatCard
          label="Top category"
          value={summary.byCategory[0]?.category ?? "None"}
          hint={summary.byCategory[0] ? formatCurrency(summary.byCategory[0].total) : ""}
        />
      </div>

      <div className="two-col">
        <div className="panel">
          <h2>By category</h2>
          {summary.byCategory.length === 0 && <p className="empty">No data yet.</p>}
          {summary.byCategory.map((c) => (
            <BarRow key={c.category} label={c.category} value={c.total} max={maxCategory} caption={`(${c.count})`} />
          ))}
        </div>
        <div className="panel">
          <h2>By month</h2>
          {summary.byMonth.length === 0 && <p className="empty">No data yet.</p>}
          {summary.byMonth.map((m) => (
            <BarRow key={m.month} label={formatMonth(m.month)} value={m.total} max={maxMonth} />
          ))}
        </div>
      </div>
    </section>
  );
}
