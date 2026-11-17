// Save as: src/components/common/StatusLine.jsx
// Status grammar used on both pages: colored dot + name on the left,
// status word on the right. Color lives on the dot; text stays neutral
// so it keeps good contrast on both light and dark surfaces.
import StatusDot from "./StatusDot";

export default function StatusLine({
  name,
  status,
  nameClassName = "",
  codeClassName = "text-base-content/70",
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`flex min-w-0 items-center gap-3 ${nameClassName}`}>
        <StatusDot status={status} />
        <span className="truncate">{name}</span>
      </span>
      <span className={`shrink-0 text-sm font-medium ${codeClassName}`}>
        {status || "UNKNOWN"}
      </span>
    </div>
  );
}
