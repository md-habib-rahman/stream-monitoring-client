import {
  MdOutlineConnectedTv,
  MdCheckCircleOutline,
  MdErrorOutline,
  MdOutlineAcUnit,
} from "react-icons/md";

export default function DashboardStats({ streams }) {
  const total = streams.length;

  const up = streams.filter((s) => s.status === "UP").length;

  const down = streams.filter((s) => s.status === "DOWN").length;

  const frozen = streams.filter((s) => s.status === "FROZEN").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
      {/* Total Channels Card */}
      <div className="bg-base-100 rounded-2xl p-6 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <MdOutlineConnectedTv className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1">
              Total Channels
            </span>
            <span className="text-3xl font-bold text-base-content leading-none">
              {total}
            </span>
          </div>
        </div>
      </div>

      {/* UP Status Card */}
      <div className="bg-base-100 rounded-2xl p-6 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-success/10 text-success rounded-xl flex items-center justify-center">
            <MdCheckCircleOutline className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1">
              Live (UP)
            </span>
            <span className="text-3xl font-bold text-base-content leading-none">
              {up}
            </span>
          </div>
        </div>
      </div>

      {/* DOWN Status Card */}
      <div className="bg-base-100 rounded-2xl p-6 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-error/10 text-error rounded-xl flex items-center justify-center">
            <MdErrorOutline className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1">
              Offline (DOWN)
            </span>
            <span className="text-3xl font-bold text-base-content leading-none">
              {down}
            </span>
          </div>
        </div>
      </div>

      {/* FROZEN Status Card */}
      <div className="bg-base-100 rounded-2xl p-6 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-warning/10 text-warning-content rounded-xl flex items-center justify-center">
            <MdOutlineAcUnit className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1">
              Frozen
            </span>
            <span className="text-3xl font-bold text-base-content leading-none">
              {frozen}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
