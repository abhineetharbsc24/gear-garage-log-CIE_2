import { CATEGORIES } from "../utils.js";

export default function FilterBar({ search, category, sortBy, onSearchChange, onCategoryChange, onSortChange }) {
  return (
    <div className="filter-bar">
      <input
        type="search"
        placeholder="Search title, vehicle or notes"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="All">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="date-desc">Newest first</option>
        <option value="date-asc">Oldest first</option>
        <option value="cost-desc">Highest cost</option>
        <option value="cost-asc">Lowest cost</option>
      </select>
    </div>
  );
}
