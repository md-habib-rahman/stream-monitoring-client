import { MdSearch, MdFilterList } from "react-icons/md";

export default function CommandBar({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
}) {
  const filters = [
    { id: "ALL", label: "All Streams" },
    { id: "DOWN", label: "Critical (Down)" },
    { id: "FROZEN", label: "Warnings" },
    { id: "UP", label: "Healthy" },
  ];

  return (
    <div className="sticky top-0 z-40 flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100/85 backdrop-blur-md px-6 py-4 border-b border-base-200/60 mb-8 shadow-sm">
      {/* Search Input */}
      <div className="relative w-full md:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <MdSearch className="text-base-content/40 w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Search name, broadcaster, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full pl-11 focus:input-primary transition-colors bg-base-200/30"
        />
      </div>

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <MdFilterList className="text-base-content/40 w-5 h-5 hidden md:block shrink-0" />
        <div className="join w-full md:w-auto bg-base-200/30 p-1 rounded-xl border border-base-200">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterStatus(filter.id)}
              className={`btn btn-sm join-item flex-1 md:flex-auto border-none hover:bg-base-300 transition-all ${
                filterStatus === filter.id
                  ? "bg-base-100 shadow-sm text-base-content hover:bg-base-100 font-bold"
                  : "bg-transparent text-base-content/60 font-medium"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
