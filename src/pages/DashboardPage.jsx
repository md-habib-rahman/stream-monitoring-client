import { useEffect, useState } from "react";

import SummaryCards from "../components/dashboard/SummaryCards";

import ChannelDrawer from "../components/dashboard/ChannelDrawer";

import socket from "../services/socket";
import StreamCard from "../components/dashboard/StreamCard";
import CommandBar from "../components/dashboard/CommandBar";

export default function DashboardPage() {
  const [streams, setStreams] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    socket.on("stream-update", setStreams);

    return () => {
      socket.off("stream-update");
    };
  }, []);

  const filteredStreams = streams.filter((stream) => {
    // Check search query (Checking across name, broadcaster, and location)
    const matchesSearch =
      stream.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.broadcaster?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.location?.toLowerCase().includes(searchQuery.toLowerCase());

    // Check status filter
    const matchesStatus =
      filterStatus === "ALL" || stream.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const sortedAndFilteredStreams = [...filteredStreams].sort((a, b) => {
    const statusWeight = {
      DOWN: 3, // Critical priority
      FROZEN: 2, // Warning priority
      UP: 1, // Normal priority (pushed to the bottom)
    };

    const weightA = statusWeight[a.status] || 0;
    const weightB = statusWeight[b.status] || 0;

    if (weightA !== weightB) {
      return weightB - weightA;
    }
    return (a.name || "").localeCompare(b.name || "");
  });

  return (
    <>
      <SummaryCards streams={streams} />

      <CommandBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {sortedAndFilteredStreams.map((stream) => (
          <div key={stream.id}>
            <StreamCard
              stream={stream}
              onClick={(stream) => {
                setSelectedChannel(stream);
                setDrawerOpen(true);
              }}
            />
          </div>
        ))}

        {/* Empty State Handler */}
        {filteredStreams.length === 0 && (
          <div className="col-span-full py-12 text-center text-base-content/50">
            No streams match your current filters.
          </div>
        )}
      </div>

      <ChannelDrawer
        open={drawerOpen}
        channel={selectedChannel}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
