import HlsPlayer from "../player/HlsPlayer";

export default function ChannelDrawer({ open, onClose, channel }) {
  // If no channel is selected, do not render anything
  if (!channel) return null;

  const statusClass =
    channel.status === "UP"
      ? "badge-success text-success-content"
      : channel.status === "DOWN"
        ? "badge-error text-error-content"
        : "badge-warning text-warning-content";

  return (
    <>
      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-base-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-base-200">
          <h2 className="text-xl font-bold line-clamp-1 pr-4">
            {channel.name}
          </h2>
          <button
            className="btn btn-ghost btn-circle btn-sm bg-base-200"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Media Section: Player or Fallback Logo */}
          <div className="w-full bg-black rounded-xl overflow-hidden shadow-inner mb-6 aspect-video relative flex items-center justify-center">
            {channel.status === "UP" && open ? (
              <HlsPlayer url={channel.preview_url || channel.url} />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-content/50">
                <img
                  src={
                    channel.logo_url ||
                    "https://placehold.co/150x150?text=OFFLINE"
                  }
                  alt={channel.name}
                  className="w-20 h-20 object-contain rounded-lg opacity-50 mb-3"
                />
                <span className="text-sm font-semibold tracking-widest uppercase">
                  Stream Unavailable
                </span>
              </div>
            )}
          </div>

          {/* Quick Status Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div
              className={`badge ${statusClass} font-semibold uppercase tracking-wider`}
            >
              {channel.status}
            </div>
            {channel.bitrateStatus === "LOW" && (
              <div className="badge badge-warning font-semibold uppercase tracking-wider">
                Low Bitrate
              </div>
            )}
            {channel.status === "FROZEN" && (
              <div className="badge badge-error font-semibold uppercase tracking-wider">
                Frozen
              </div>
            )}
          </div>

          <div className="divider my-0 mb-6"></div>

          {/* Metadata Grid */}
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-base-content/60 font-medium col-span-1">
                Broadcaster
              </span>
              <span className="font-semibold col-span-2 text-right">
                {channel.broadcaster || "-"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-base-content/60 font-medium col-span-1">
                Location
              </span>
              <span className="font-semibold col-span-2 text-right">
                {channel.location || "-"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-base-content/60 font-medium col-span-1">
                Bitrate
              </span>
              <span className="font-semibold col-span-2 text-right text-primary">
                {channel.bitrate || 0} Kbps
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-base-content/60 font-medium col-span-1">
                Min Bitrate
              </span>
              <span className="font-semibold col-span-2 text-right">
                {channel.min_bitrate || 0} Kbps
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-base-content/60 font-medium col-span-1">
                Segments
              </span>
              <span className="font-semibold col-span-2 text-right">
                {channel.segmentCount || 0}
              </span>
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <span className="text-base-content/60 font-medium">
                Last Segment
              </span>
              <span className="bg-base-200 p-2 rounded-lg break-all font-mono text-xs">
                {channel.lastSegment || "-"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-base-content/60 font-medium">
                Stream URL
              </span>
              <span className="bg-base-200 p-2 rounded-lg break-all font-mono text-xs text-primary">
                {channel.url}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-base-content/60 font-medium">
                Preview URL
              </span>

              <span className="font-semibold col-span-2 text-right">
                {channel.preview_url ? "Configured" : "Not Set"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <span className="text-base-content/60 font-medium col-span-1">
                Last Checked
              </span>
              <span className="font-semibold col-span-2 text-right text-xs">
                {channel.checkedAt
                  ? new Date(channel.checkedAt).toLocaleString()
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
