import { useEffect, useState } from "react";

import { getEvents } from "../services/eventApi";
import { getChannels } from "../services/channelApi";
import { TbFilterCancel } from "react-icons/tb";
import EventTable from "../components/events/EventTable";
import { showError } from "../utils/notifications";

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  const [channels, setChannels] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    channelId: "",
    location: "",
    broadcaster: "",
    from: "",
    to: "",
  });

  const handleClear = () => {
    setFilters({
      channelId: "",
      location: "",
      broadcaster: "",
      from: "",
      to: "",
    });
    setPage(1);
  };

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const data = await getChannels();

        setChannels(data);
      } catch (err) {
        showError(err.response?.data?.error || "Failed to load channels.");
      }
    };
    loadChannels();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents(page, 50, filters);

        setEvents(data.data);

        setPagination(data.pagination);
      } catch (err) {
        showError(err.response?.data?.error || "Failed to load events.");
      }
    };
    loadEvents();
  }, [page, filters]);

  const locations = [
    ...new Set(channels.map((c) => c.location).filter(Boolean)),
  ];

  const broadcasters = [
    ...new Set(channels.map((c) => c.broadcaster).filter(Boolean)),
  ];

  const updateFilter = (key, value) => {
    setPage(1);

    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Event History</h1>

      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 mb-8">
        {/* Responsive Grid: 
        1 col on mobile -> 2 cols on small tablets -> 3 cols on iPads -> 6 cols on large desktop 
      */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-4 gap-y-5 items-end">
          {/* Channel Filter */}
          <div className="form-control w-full">
            <label className="label px-1 py-1.5">
              <span className="label-text text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                Channel
              </span>
            </label>
            <select
              className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              value={filters.channelId}
              onChange={(e) => updateFilter("channelId", e.target.value)}
            >
              <option value="">All Channels</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="form-control w-full">
            <label className="label px-1 py-1.5">
              <span className="label-text text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                Location
              </span>
            </label>
            <select
              className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Broadcaster Filter */}
          <div className="form-control w-full">
            <label className="label px-1 py-1.5">
              <span className="label-text text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                Broadcaster
              </span>
            </label>
            <select
              className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
              value={filters.broadcaster}
              onChange={(e) => updateFilter("broadcaster", e.target.value)}
            >
              <option value="">All Broadcasters</option>
              {broadcasters.map((broadcaster) => (
                <option key={broadcaster} value={broadcaster}>
                  {broadcaster}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="form-control w-full">
            <label className="label px-1 py-1.5">
              <span className="label-text text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                Start Date
              </span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-shadow text-sm"
              value={filters.from}
              onChange={(e) => updateFilter("from", e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="form-control w-full">
            <label className="label px-1 py-1.5">
              <span className="label-text text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                End Date
              </span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-shadow text-sm"
              value={filters.to}
              onChange={(e) => updateFilter("to", e.target.value)}
            />
          </div>

          {/* Clear Filters Button */}
          <div className="form-control w-full mt-2 xl:mt-0">
            <button
              className="btn btn-ghost border border-base-200 hover:border-error hover:bg-error/10 hover:text-error transition-colors w-full flex items-center justify-center gap-2"
              onClick={handleClear}
              title="Clear all filters"
            >
              <TbFilterCancel size={18} />
              {/* The text shows on mobile/tablet, but hides on desktop to save space */}
              <span className="xl:hidden">Clear Filters</span>
            </button>
          </div>
        </div>
      </div>
      <div className="mb-4 text-sm opacity-70">
        Showing {events.length} of {pagination?.total || 0} events
      </div>

      <EventTable events={events} />

      {pagination && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button
              className="join-item btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <button className="join-item btn btn-active">
              Page {pagination.page} of {pagination.totalPages}
            </button>

            <button
              className="join-item btn"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
