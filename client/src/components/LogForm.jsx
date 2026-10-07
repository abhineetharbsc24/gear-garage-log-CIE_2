import { useEffect, useRef, useState } from "react";
import { CATEGORIES, todayLocal } from "../utils.js";

function validate(v) {
  const errors = {};
  if (v.vehicle.trim().length < 2) errors.vehicle = "Vehicle name is required (min 2 characters)";
  if (v.title.trim().length < 3) errors.title = "Title must be at least 3 characters";
  if (!v.category) errors.category = "Pick a category";
  if (!v.date) errors.date = "Date is required";
  else if (v.date > todayLocal()) errors.date = "Date cannot be in the future";
  if (v.cost === "" || Number.isNaN(Number(v.cost)) || Number(v.cost) < 0) errors.cost = "Enter a valid cost (0 or more)";
  if (v.odometer !== "" && (!Number.isInteger(Number(v.odometer)) || Number(v.odometer) < 0)) {
    errors.odometer = "Odometer must be a whole number, 0 or more";
  }
  if (v.notes.length > 200) errors.notes = "Notes can be at most 200 characters";
  return errors;
}

export default function LogForm({ initialValues, submitLabel, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        vehicle: values.vehicle.trim(),
        title: values.title.trim(),
        notes: values.notes.trim(),
        cost: Number(values.cost),
        odometer: values.odometer === "" ? null : Number(values.odometer)
      });
    } catch (err) {
      setErrors(err.errors || {});
      setServerError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="banner banner-error">{serverError}</div>}

      <div className="form-row">
        <label>
          Vehicle
          <input name="vehicle" value={values.vehicle} onChange={handleChange} placeholder="e.g. Scooter 125" />
          {errors.vehicle && <span className="field-error">{errors.vehicle}</span>}
        </label>
        <label>
          Category
          <select name="category" value={values.category} onChange={handleChange}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <span className="field-error">{errors.category}</span>}
        </label>
      </div>

      <label>
        Title
        <input ref={titleRef} name="title" value={values.title} onChange={handleChange} placeholder="e.g. Engine oil change" />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </label>

      <div className="form-row">
        <label>
          Date
          <input type="date" name="date" value={values.date} max={todayLocal()} onChange={handleChange} />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </label>
        <label>
          Cost (INR)
          <input type="number" name="cost" min="0" step="1" value={values.cost} onChange={handleChange} placeholder="0" />
          {errors.cost && <span className="field-error">{errors.cost}</span>}
        </label>
        <label>
          Odometer (km, optional)
          <input type="number" name="odometer" min="0" step="1" value={values.odometer} onChange={handleChange} />
          {errors.odometer && <span className="field-error">{errors.odometer}</span>}
        </label>
      </div>

      <label>
        Notes (optional)
        <textarea name="notes" rows="3" value={values.notes} onChange={handleChange} />
        <span className="muted small">{values.notes.length}/200</span>
        {errors.notes && <span className="field-error">{errors.notes}</span>}
      </label>

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
