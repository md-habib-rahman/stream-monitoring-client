// Save as: src/pages/DashboardPage.jsx
import { useEffect, useMemo, useState } from "react";

import SummaryCards from "../components/dashboard/SummaryCards";
import ChannelDrawer from "../components/dashboard/ChannelDrawer";
import StreamCard from "../components/dashboard/StreamCard";
import CommandBar from "../components/dashboard/CommandBar";
import StatusDot from "../components/common/StatusDot";

import socket from "../services/socket";
import { restartTbsStream } from "../services/tbsApi";
import { STATUS_WEIGHT } from "../utils/statusStyles";
import { showError, showSuccess } from "../utils/notifications";

export default function DashboardPage() {
  const [streams, setStreams] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [connected, setConnected] = useState(socket.connected);

  const [selectedChannel, setSelectedChannel] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [restartingIds, setRestartingIds] = useState(() => new Set());
  const [telemetryRefreshKey, setTelemetryRefreshKey] = useState(0);
  const [restartPickerChannel, setRestartPickerChannel] = useState(null);

  useEffect(() => {
    const handleUpdate = (data) => {
      setStreams(data);
      setLoaded(true);
    };
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("stream-update", handleUpdate);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.connect();

    return () => {
      socket.off("stream-update", handleUpdate);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, []);

  const counts = useMemo(() => {
    const result = {
      ALL: streams.length,
      UP: 0,
      DEGRADED: 0,
      FROZEN: 0,
      DOWN: 0,
    };
    for (const stream of streams) {
      if (result[stream.status] !== undefined) result[stream.status]++;
    }
    return result;
  }, [streams]);

  const visibleStreams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return streams
      .filter((stream) => {
        const matchesSearch =
          !query ||
          stream.name?.toLowerCase().includes(query) ||
          stream.broadcaster?.toLowerCase().includes(query) ||
          stream.location?.toLowerCase().includes(query);

        const matchesStatus =
          filterStatus === "ALL" || stream.status === filterStatus;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const weightA = STATUS_WEIGHT[a.status] || 0;
        const weightB = STATUS_WEIGHT[b.status] || 0;

        if (weightA !== weightB) return weightB - weightA;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [streams, searchQuery, filterStatus]);

  // Keep the open drawer in sync with live updates instead of a stale snapshot.
  const liveChannel =
    streams.find((s) => s.id === selectedChannel?.id) || selectedChannel;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("ALL");
  };

  const handleTbsRestart = async (stream, mapping) => {
    if (!mapping) return;
    setRestartingIds((current) => new Set(current).add(stream.id));
    setRestartPickerChannel(null);

    try {
      await restartTbsStream(
        mapping.tbs_device_id,
        mapping.tbs_mid,
        mapping.tbs_mod || "cdn",
        stream.id,
        mapping.label,
      );
      showSuccess(`Restart command sent for ${stream.name} (${mapping.label}).`);
      setTelemetryRefreshKey((current) => current + 1);
    } catch (error) {
      showError(
        error.response?.data?.error || `Failed to restart ${stream.name}.`,
      );
    } finally {
      setRestartingIds((current) => {
        const next = new Set(current);
        next.delete(stream.id);
        return next;
      });
    }
  };

  const openTbsRestart = (stream) => {
    const mappings = stream.tbs_mappings || [];
    if (mappings.length === 1) {
      handleTbsRestart(stream, mappings[0]);
    } else if (mappings.length > 1) {
      setRestartPickerChannel(stream);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-end gap-4">
        {/* <div>
          <h1 className="text-2xl font-semibold tracking-tight">Streams</h1>
          <p className="mt-1 text-sm text-base-content/70">
            Live status for every monitored channel.
          </p>
        </div> */}

        <div
          role="status"
          className="flex items-center gap-2 text-sm text-base-content/70"
        >
          <StatusDot status={connected ? "UP" : "DOWN"} size="sm" />
          {connected ? "Live" : "Reconnecting…"}
        </div>
      </header>

      <SummaryCards streams={streams} />

      <CommandBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        counts={counts}
      />

      {visibleStreams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visibleStreams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              onRestart={openTbsRestart}
              restarting={restartingIds.has(stream.id)}
              onClick={(clicked) => {
                setSelectedChannel(clicked);
                setDrawerOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-base-300 py-16 text-center text-base-content/70">
          {!loaded ? (
            <>
              <span className="loading loading-spinner loading-md" />
              <p>Waiting for the first status update…</p>
            </>
          ) : streams.length === 0 ? (
            <p>No channels are being monitored yet. Add a channel to start.</p>
          ) : (
            <>
              <p>No streams match your search or filter.</p>
              <button
                type="button"
                className="btn btn-sm btn-ghost border border-base-300"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}

      <ChannelDrawer
        open={drawerOpen}
        channel={liveChannel}
        onClose={() => setDrawerOpen(false)}
        refreshKey={telemetryRefreshKey}
      />

      {restartPickerChannel && (
        <dialog
          className="modal modal-open"
          aria-modal="true"
          aria-labelledby="tbs-restart-picker-title"
        >
          <div className="modal-box max-w-md">
            <h2 id="tbs-restart-picker-title" className="text-lg font-bold">
              Choose a rendition to restart
            </h2>
            <p className="mt-1 text-sm text-base-content/60">
              {restartPickerChannel.name} — select one mapped TBS stream.
            </p>
            <div className="mt-4 space-y-2">
              {restartPickerChannel.tbs_mappings.map((mapping) => (
                <button
                  type="button"
                  key={mapping.id || `${mapping.tbs_device_id}-${mapping.tbs_mod}-${mapping.tbs_mid}`}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-base-300 p-3 text-left hover:border-primary hover:bg-base-200/50"
                  disabled={restartingIds.has(restartPickerChannel.id)}
                  onClick={() =>
                    handleTbsRestart(restartPickerChannel, mapping)
                  }
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {mapping.label}
                    </span>
                    <span className="block truncate text-xs text-base-content/60">
                      {mapping.tbs_device_name || mapping.tbs_device_id} ·{" "}
                      {mapping.tbs_mod.toUpperCase()} · {mapping.tbs_mid}
                    </span>
                  </span>
                  <span className="btn btn-sm btn-outline">Restart</span>
                </button>
              ))}
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setRestartPickerChannel(null)}
              >
                Cancel
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              type="button"
              onClick={() => setRestartPickerChannel(null)}
            >
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
