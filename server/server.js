import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data", "logs.json");
const CATEGORIES = ["Service", "Repair", "Modification", "Gear", "Fuel", "Other"];
const PORT = process.env.PORT || 5001;

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    `${new Date().toLocaleTimeString("en-IN")}  ${req.method} ${req.url}`
  );
  next();
});

function readLogs() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeLogs(logs) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2));
}

function validate(body) {
  const errors = {};

  const vehicle = String(body.vehicle ?? "").trim();
  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "");
  const date = String(body.date ?? "");
  const notes = String(body.notes ?? "").trim();

  const cost = Number(body.cost);

  const hasOdometer =
    body.odometer !== "" &&
    body.odometer !== null &&
    body.odometer !== undefined;

  const odometer = hasOdometer ? Number(body.odometer) : null;

  if (vehicle.length < 2) {
    errors.vehicle = "Vehicle name is required (min 2 characters)";
  }

  if (title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  if (!CATEGORIES.includes(category)) {
    errors.category =
      "Category must be one of: " + CATEGORIES.join(", ");
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date))
  ) {
    errors.date = "Date must be a valid YYYY-MM-DD value";
  }

  if (
    body.cost === "" ||
    body.cost === null ||
    body.cost === undefined ||
    Number.isNaN(cost) ||
    cost < 0
  ) {
    errors.cost = "Cost must be a number, 0 or more";
  }

  if (
    hasOdometer &&
    (!Number.isInteger(odometer) || odometer < 0)
  ) {
    errors.odometer =
      "Odometer must be a whole number, 0 or more";
  }

  if (notes.length > 200) {
    errors.notes = "Notes can be at most 200 characters";
  }

  return {
    errors,
    clean: {
      vehicle,
      title,
      category,
      date,
      cost,
      odometer,
      notes,
    },
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    categories: CATEGORIES,
  });
});

app.get("/api/logs", (req, res) => {
  const { category, q } = req.query;

  let logs = readLogs();

  if (category && category !== "All") {
    logs = logs.filter((l) => l.category === category);
  }

  if (q) {
    const needle = String(q).toLowerCase();

    logs = logs.filter((l) =>
      `${l.title} ${l.vehicle} ${l.notes}`
        .toLowerCase()
        .includes(needle)
    );
  }

  logs.sort((a, b) => b.date.localeCompare(a.date));

  res.json(logs);
});

app.get("/api/logs/:id", (req, res) => {
  const log = readLogs().find(
    (l) => l.id === req.params.id
  );

  if (!log) {
    return res.status(404).json({
      message: "Log not found",
    });
  }

  res.json(log);
});

app.post("/api/logs", (req, res) => {
  const { errors, clean } = validate(req.body || {});

  if (Object.keys(errors).length) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  const log = {
    id: randomUUID(),
    ...clean,
    createdAt: new Date().toISOString(),
  };

  const logs = readLogs();

  logs.push(log);

  writeLogs(logs);

  res.status(201).json(log);
});

app.put("/api/logs/:id", (req, res) => {
  const logs = readLogs();

  const index = logs.findIndex(
    (l) => l.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Log not found",
    });
  }

  const { errors, clean } = validate(req.body || {});

  if (Object.keys(errors).length) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  logs[index] = {
    ...logs[index],
    ...clean,
    updatedAt: new Date().toISOString(),
  };

  writeLogs(logs);

  res.json(logs[index]);
});

app.delete("/api/logs/:id", (req, res) => {
  const logs = readLogs();

  const index = logs.findIndex(
    (l) => l.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Log not found",
    });
  }

  logs.splice(index, 1);

  writeLogs(logs);

  res.status(204).end();
});

app.get("/api/summary", (req, res) => {
  const logs = readLogs();

  const total = logs.reduce(
    (sum, l) => sum + l.cost,
    0
  );

  const byCategoryMap = {};
  const byMonthMap = {};

  for (const l of logs) {
    byCategoryMap[l.category] =
      byCategoryMap[l.category] || {
        category: l.category,
        total: 0,
        count: 0,
      };

    byCategoryMap[l.category].total += l.cost;
    byCategoryMap[l.category].count += 1;

    const month = l.date.slice(0, 7);

    byMonthMap[month] =
      (byMonthMap[month] || 0) + l.cost;
  }

  const byCategory = Object.values(
    byCategoryMap
  ).sort((a, b) => b.total - a.total);

  const byMonth = Object.entries(byMonthMap)
    .map(([month, amount]) => ({
      month,
      total: amount,
    }))
    .sort((a, b) =>
      a.month.localeCompare(b.month)
    );

  res.json({
    total,
    count: logs.length,
    byCategory,
    byMonth,
  });
});

app.use("/api", (req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON body",
    });
  }

  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(
    `Garage Log API running on http://localhost:${PORT}`
  );
});