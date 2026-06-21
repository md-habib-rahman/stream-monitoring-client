import { MdOutlineSensors, MdOutlineLocationOn, MdSpeed } from "react-icons/md";

export default function StreamCard({ stream, onClick }) {
  // Determines the ambient background glow based on stream health
  const getAmbientGlow = (status) => {
    switch (status) {
      case "UP":
        return "bg-success/20";
      case "DOWN":
        return "bg-error/20";
      default:
        return "bg-warning/20";
    }
  };

  // Determines the specific text color for the status indicator
  const getStatusTextColor = (status) => {
    switch (status) {
      case "UP":
        return "text-success";
      case "DOWN":
        return "text-error";
      default:
        return "text-warning";
    }
  };

  return (
    <div
      onClick={() => onClick(stream)}
      className="group relative overflow-hidden flex flex-col bg-base-100 rounded-[24px] border border-base-200/60 shadow-sm hover:shadow-xl hover:border-base-300 hover:-translate-y-1 transition-all duration-400 ease-out cursor-pointer p-6"
    >
      {/* Ambient Status Glow (Top Right) */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 blur-[40px] rounded-full pointer-events-none transition-colors duration-500 ${getAmbientGlow(stream.status)}`}
      />

      {/* Header: Logo & Status */}
      <div className="relative z-10 flex justify-between items-start mb-5">
        <div className="w-14 h-14 rounded-[16px] bg-base-200/40 flex items-center justify-center p-1 border border-base-200/80 shadow-sm backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
          <img
            src={stream.logo_url || "https://placehold.co/100x100"}
            alt={stream.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Minimalist Status Indicator */}
        <div className="flex items-center gap-2 bg-base-100/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-base-200 shadow-sm">
          <span className="relative flex h-2 w-2">
            {stream.status === "UP" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${getStatusTextColor(stream.status).replace("text-", "bg-")}`}
            ></span>
          </span>
          <span
            className={`text-xs font-bold tracking-wider uppercase ${getStatusTextColor(stream.status)}`}
          >
            {stream.status}
          </span>
        </div>
      </div>

      {/* Body: Title & Metadata Pills */}
      <div className="relative z-10 flex-1 mb-2">
        <h2 className="text-lg font-bold tracking-tight text-base-content group-hover:text-primary transition-colors mb-4 line-clamp-1">
          {stream.name}
        </h2>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 bg-base-200/50 text-base-content/70 px-2.5 py-1 rounded-lg text-xs font-medium border border-base-200/50">
            <MdOutlineSensors className="w-3.5 h-3.5 text-base-content/40" />
            <span className="truncate max-w-[100px]">{stream.broadcaster}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-base-200/50 text-base-content/70 px-2.5 py-1 rounded-lg text-xs font-medium border border-base-200/50">
            <MdOutlineLocationOn className="w-3.5 h-3.5 text-base-content/40" />
            <span className="truncate max-w-[100px]">{stream.location}</span>
          </div>
        </div>
      </div>

      {/* Footer: Prominent Metric Focus */}
      <div className="relative z-10 pt-4 mt-auto border-t border-base-200/60 flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mb-0.5">
            Network Bitrate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-base-content tracking-tight leading-none">
              {stream.bitrate || 0}
            </span>
            <span className="text-xs font-semibold text-base-content/50">
              kbps
            </span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-content transition-colors duration-300">
          <MdSpeed className="w-4 h-4 text-primary group-hover:text-primary-content transition-colors" />
        </div>
      </div>
    </div>
  );
}
