import LogCard from "./LogCard.jsx";

export default function LogList({ logs, onDelete }) {
  if (logs.length === 0) {
    return <p className="empty">No entries match your filters.</p>;
  }

  return (
    <div className="log-grid">
      {logs.map((log) => (
        <LogCard key={log.id} log={log} onDelete={onDelete} />
      ))}
    </div>
  );
}
