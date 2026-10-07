import { Link, useNavigate, useParams } from "react-router-dom";
import LogForm from "../components/LogForm.jsx";
import { todayLocal } from "../utils.js";

const EMPTY = {
  vehicle: "",
  title: "",
  category: "",
  date: todayLocal(),
  cost: "",
  odometer: "",
  notes: ""
};

export default function LogFormPage({ mode, logs, loading, onAdd, onUpdate }) {
  const navigate = useNavigate();
  const { id } = useParams();

  if (mode === "edit") {
    if (loading) return <p className="muted">Loading entry...</p>;
    const log = logs.find((l) => l.id === id);
    if (!log) {
      return (
        <div className="panel">
          <h2>Entry not found</h2>
          <Link to="/logs">Back to logs</Link>
        </div>
      );
    }
    const initial = {
      vehicle: log.vehicle,
      title: log.title,
      category: log.category,
      date: log.date,
      cost: String(log.cost),
      odometer: log.odometer === null || log.odometer === undefined ? "" : String(log.odometer),
      notes: log.notes || ""
    };
    return (
      <section>
        <h1>Edit Entry</h1>
        <LogForm
          key={log.id}
          initialValues={initial}
          submitLabel="Save changes"
          onSubmit={async (data) => {
            await onUpdate(id, data);
            navigate("/logs");
          }}
        />
      </section>
    );
  }

  return (
    <section>
      <h1>Add Entry</h1>
      <LogForm
        initialValues={EMPTY}
        submitLabel="Add entry"
        onSubmit={async (data) => {
          await onAdd(data);
          navigate("/logs");
        }}
      />
    </section>
  );
}
