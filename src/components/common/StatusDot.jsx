// Save as: src/components/common/StatusDot.jsx
// The one status marker used everywhere. Only DOWN pulses.
import { getStatusColor } from "../../utils/statusStyles";

const SIZES = { sm: "h-1.5 w-1.5", md: "h-2.5 w-2.5" };

export default function StatusDot({ status, size = "md" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${SIZES[size]} ${
        status === "DOWN" ? "motion-safe:animate-pulse" : ""
      }`}
      style={{ backgroundColor: getStatusColor(status) }}
    />
  );
}
