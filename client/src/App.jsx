import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Logs from "./pages/Logs.jsx";
import LogFormPage from "./pages/LogFormPage.jsx";
import Summary from "./pages/Summary.jsx";
import NotFound from "./pages/NotFound.jsx";
import { fetchLogs, createLog, updateLog, deleteLog } from "./api.js";

export default function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchLogs()
      .then((data) => setLogs(data))
      .catch(() => setLoadError("Cannot reach the API. Make sure the server is running on port 5000."))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(log) {
    const created = await createLog(log);
    setLogs((prev) => [created, ...prev]);
    return created;
  }

  async function handleUpdate(id, log) {
    const updated = await updateLog(id, log);
    setLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));
    return updated;
  }

  async function handleDelete(id) {
    await deleteLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="app">
      <Navbar />
      <main className="container">
        {loadError && <div className="banner banner-error">{loadError}</div>}
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard logs={logs} loading={loading} />} />
            <Route
              path="/logs"
              element={<Logs logs={logs} loading={loading} onDelete={handleDelete} />}
            />
            <Route
              path="/logs/new"
              element={<LogFormPage mode="add" logs={logs} loading={loading} onAdd={handleAdd} />}
            />
            <Route
              path="/logs/:id/edit"
              element={
                <LogFormPage mode="edit" logs={logs} loading={loading} onUpdate={handleUpdate} />
              }
            />
            <Route path="/summary" element={<Summary />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
