export default function DashboardSummary({ streams }) {
  const total = streams.length;
  const up = streams.filter((s) => s.status === "UP").length;
  const down = streams.filter((s) => s.status === "DOWN").length;
  const frozen = streams.filter((s) => s.status === "FROZEN").length;
  const low = streams.filter((s) => s.bitrateStatus === "LOW").length;

  const cards = [
    { title: "TOTAL", value: total },
    { title: "UP", value: up },
    { title: "DOWN", value: down },
    { title: "FROZEN", value: frozen },
    { title: "LOW BR", value: low },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="card bg-base-100 shadow-sm border border-base-200"
        >
          <div className="card-body p-4 sm:p-5">
            {/* Maps to MUI subtitle2 */}
            <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
              {card.title}
            </h3>

            {/* Maps to MUI h4 */}
            <p className="text-3xl font-semibold text-base-content">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
