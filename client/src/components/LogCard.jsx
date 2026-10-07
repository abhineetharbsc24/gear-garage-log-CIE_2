import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../utils.js";

export default function LogCard({ log, onDelete }) {
  function handleDelete() {
    if (window.confirm(`Delete "${log.title}"?`)) {
      onDelete(log.id);
    }
  }

  return (
    <article className="log-card">
      <div className="log-card-head">
        <span className={`badge badge-${log.category.toLowerCase()}`}>{log.category}</span>
        <span className="log-cost">{formatCurrency(log.cost)}</span>
      </div>
      <h3 className="log-title">{log.title}</h3>
      <p className="log-meta">
        {log.vehicle} &middot; {formatDate(log.date)}
        {log.odometer !== null && log.odometer !== undefined && <> &middot; {log.odometer.toLocaleString("en-IN")} km</>}
      </p>
      {log.notes && <p className="log-notes">{log.notes}</p>}
      {onDelete && (
        <div className="log-actions">
          <Link className="btn btn-ghost" to={`/logs/${log.id}/edit`}>
            Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
