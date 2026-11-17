// Save as: src/components/dashboard/CommandBar.jsx
import StatusDot from "../common/StatusDot";

const FILTERS = ["ALL", "UP", "DEGRADED", "FROZEN", "DOWN"];

export default function CommandBar({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  counts = {},
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <label className="relative block w-full lg:max-w-sm">
        <span className="sr-only">Search streams</span>
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          className="input input-bordered w-full pl-9"
          placeholder="Search by name, broadcaster or location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </label>

      <div
        role="group"
        aria-label="Filter by status"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((filter) => {
          const active = filterStatus === filter;

          return (
            <button
              key={filter}
              type="button"
              aria-pressed={active}
              onClick={() => setFilterStatus(filter)}
              className={`btn btn-sm ${
                active ? "btn-primary" : "btn-ghost border border-base-300"
              }`}
            >
              {filter !== "ALL" && <StatusDot status={filter} size="sm" />}
              {filter === "ALL" ? "All" : filter}
              {counts[filter] !== undefined && (
                <span className="text-xs opacity-70">{counts[filter]}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
