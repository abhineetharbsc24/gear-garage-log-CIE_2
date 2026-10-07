import { Link } from "react-router-dom";
import StatCard from "../components/StatCard.jsx";
import ServiceReminder from "../components/ServiceReminder.jsx";
import LogCard from "../components/LogCard.jsx";
import { formatCurrency, sumCost, todayLocal } from "../utils.js";

export default function Dashboard({ logs, loading }) {
  if (loading) return <p className="muted">Loading your garage...</p>;

  const thisMonth = todayLocal().slice(0, 7);
  const monthLogs = logs.filter((l) => l.date.startsWith(thisMonth));
  const biggest = logs.reduce((max, l) => (l.cost > (max?.cost ?? -1) ? l : max), null);
  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <section>
      <div className="page-head">
        <h1>Dashboard</h1>
        <Link className="btn btn-primary" to="/logs/new">
          + Add Entry
        </Link>
      </div>

      <ServiceReminder logs={logs} threshold={90} />

      <div className="stat-grid">
        <StatCard label="Total spend" value={formatCurrency(sumCost(logs))} hint={`${logs.length} entries`} />
        <StatCard label="This month" value={formatCurrency(sumCost(monthLogs))} hint={`${monthLogs.length} entries`} />
        <StatCard
          label="Biggest expense"
          value={biggest ? formatCurrency(biggest.cost) : "None"}
          hint={biggest ? biggest.title : "Add an entry"}
        />
      </div>

      <div className="page-head">
        <h2>Recent activity</h2>
        <Link to="/logs">View all</Link>
      </div>
      {recent.length === 0 ? (
        <p className="empty">Nothing logged yet.</p>
      ) : (
        <div className="log-grid">
          {recent.map((log) => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </section>
  );
}
