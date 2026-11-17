import {
  MdBusiness,
  MdLocationOn,
  MdRestartAlt,
  MdSpeed,
} from "react-icons/md";
import StatusDot from "../common/StatusDot";
import { getStatusColor } from "../../utils/statusStyles";

function formatTime(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusMessage(stream) {
  if (stream.status === "DOWN" && stream.error) return stream.error;
  if (stream.status === "FROZEN") {
    return `No new segment for ${stream.freezeCount || 0} checks`;
  }
  if (stream.status === "DEGRADED") return "Some stream variants are missing";
  if (stream.status === "DOWN") return "Stream is currently unavailable";
  if (stream.status === "UP") return "All systems operational";
  return "Waiting for stream status";
}

export default function StreamCard({
  stream,
  onClick,
  onRestart,
  restarting = false,
}) {
  const statusColor = getStatusColor(stream.status);
  const checkedAt = formatTime(stream.checkedAt);
  const hasBitrate = typeof stream.bitrate === "number" && stream.bitrate > 0;
  const variants = stream.variants || [];
  const isTbsMapped = (stream.tbs_mappings || []).length > 0;

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-base-300/70 bg-base-100 text-left shadow-sm transition-colors hover:border-base-content/25 hover:shadow-md">
      <button
        type="button"
        onClick={() => onClick?.(stream)}
        aria-label={`View ${stream.name || "channel"} details, status ${stream.status || "unknown"}`}
        className="relative flex w-full flex-col text-left focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
      <span
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: statusColor }}
        aria-hidden="true"
      />

      <div className="flex min-w-0 flex-col gap-1.5 px-3 py-2.5 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white text-sm font-bold uppercase text-base-content/60 ring-1 ring-base-300 shadow-sm">
            <span aria-hidden="true">{stream.name?.trim()?.[0] || "?"}</span>
            {stream.logo_url && (
              <img
                src={stream.logo_url}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full bg-white object-contain p-0.5"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold leading-4 text-base-content">
              {stream.name || "Unnamed channel"}
            </h2>
            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[10px] leading-3 text-base-content/55">
              {stream.broadcaster && (
                <>
                  <MdBusiness className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{stream.broadcaster}</span>
                </>
              )}
              {stream.location && (
                <>
                  {stream.broadcaster && <span aria-hidden="true">·</span>}
                  <MdLocationOn
                    className="h-3 w-3 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{stream.location}</span>
                </>
              )}
              {!stream.broadcaster && !stream.location && (
                <span className="truncate">
                  {checkedAt ? `Checked ${checkedAt}` : "Not checked"}
                </span>
              )}
            </p>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: `${statusColor}18`,
              color: statusColor,
            }}
          >
            <StatusDot status={stream.status} size="sm" />
            {stream.status || "UNKNOWN"}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2 border-t border-base-200 pt-1.5 pr-8 text-[10px] leading-3 text-base-content/60">
          {hasBitrate ? (
            <span
              className={`shrink-0 font-semibold tabular-nums ${
                stream.bitrateStatus === "LOW"
                  ? "text-warning"
                  : "text-base-content/75"
              }`}
              title="Bitrate"
            >
              <MdSpeed className="mr-0.5 inline h-3 w-3" aria-hidden="true" />
              {new Intl.NumberFormat().format(stream.bitrate)} kbps
            </span>
          ) : (
            <span className="shrink-0">No bitrate</span>
          )}
          {stream.segmentCount > 0 && (
            <span className="shrink-0">{stream.segmentCount} seg</span>
          )}
          <span
            className="min-w-0 flex-1 truncate"
            title={getStatusMessage(stream)}
          >
            {getStatusMessage(stream)}
          </span>
          {checkedAt && (
            <span className="shrink-0 tabular-nums text-base-content/45">
              {checkedAt}
            </span>
          )}
        </div>

        {variants.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {variants.map((variant) => (
              <li
                key={variant.name}
                className="inline-flex items-center gap-1 rounded bg-base-200/70 px-1 py-0.5 text-[9px] leading-3 text-base-content/70"
              >
                <StatusDot status={variant.status} size="sm" />
                <span>{variant.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      </button>
      <button
        type="button"
        disabled={!isTbsMapped || restarting}
        onClick={(event) => {
          event.stopPropagation();
          onRestart?.(stream);
        }}
        title={
          isTbsMapped
            ? stream.tbs_mappings.length > 1
              ? "Choose a mapped TBS rendition to restart"
              : "Restart mapped TBS stream"
            : "No TBS mapping configured"
        }
        aria-label={
          isTbsMapped
            ? `Restart TBS stream for ${stream.name || "channel"}`
            : `TBS restart unavailable for ${stream.name || "channel"}: no mapping`
        }
        className="absolute bottom-1 right-1 z-10 inline-flex h-6 w-6 items-center justify-center rounded-md text-base-content/60 transition-colors hover:bg-base-200 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        {restarting ? (
          <span className="loading loading-spinner loading-xs" aria-hidden="true" />
        ) : (
          <MdRestartAlt className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </article>
  );
}
