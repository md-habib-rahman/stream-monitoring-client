// Save as: src/components/dashboard/SummaryCards.jsx
import { PANEL } from "../../config/brand";
import StatusDot from "../common/StatusDot";

const STATUSES = ["UP", "DEGRADED", "FROZEN", "DOWN"];

export default function SummaryCards({ streams = [] }) {
  const counts = { UP: 0, DEGRADED: 0, FROZEN: 0, DOWN: 0 };

  for (const stream of streams) {
    if (counts[stream.status] !== undefined) counts[stream.status]++;
  }

  const total = streams.length;
  const attention = counts.DEGRADED + counts.FROZEN + counts.DOWN;

  let headline = "Waiting for stream data";
  if (total > 0) {
    headline =
      attention === 0
        ? "All streams are healthy"
        : `${attention} of ${total} ${total === 1 ? "stream needs" : "streams need"} attention`;
  }

  return (
    <section
      aria-label="Stream summary"
      className={`rounded-xl p-6 lg:flex lg:items-center lg:justify-between lg:gap-10 ${PANEL.surface}`}
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{headline}</h2>
        <p className={`mt-1 text-sm ${PANEL.muted}`}>
          {total > 0
            ? `${counts.UP} of ${total} streams are up`
            : "Status appears here after the first check."}
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-y-5 sm:grid-cols-4 lg:mt-0">
        {STATUSES.map((status) => (
          <div key={status} className="border-l border-white/10 pl-4 sm:pl-6">
            <dt className={`flex items-center gap-2 text-sm ${PANEL.muted}`}>
              <StatusDot status={status} />
              {status}
            </dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">
              {counts[status]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
