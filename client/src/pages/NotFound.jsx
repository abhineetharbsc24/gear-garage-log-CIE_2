import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="panel">
      <h1>404</h1>
      <p className="muted">That page does not exist.</p>
      <Link className="btn btn-primary" to="/">
        Back to dashboard
      </Link>
    </div>
  );
}
