// Save as: src/components/brand/Logo.jsx
// Use <Logo /> in your navbar too, so the brand appears on every page.
import { useState } from "react";
import { BRAND } from "../../../config/brand";


export default function Logo({ onDark = false }) {
  const [failed, setFailed] = useState(false);

  const src = onDark ? BRAND.logoDark || BRAND.logo : BRAND.logo;
  const needsChip = onDark && !BRAND.logoDark;

  if (src && !failed) {
    const image = (
      <img
        src={src}
        alt={BRAND.companyName}
        onError={() => setFailed(true)}
        className="h-9 w-auto max-w-[180px] object-contain"
      />
    );

    return needsChip ? (
      <div className="inline-flex rounded-lg bg-white px-3 py-2">{image}</div>
    ) : (
      image
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-content"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12h4l3-8 4 16 3-8h6" />
        </svg>
      </span>
      <span
        className={`text-lg font-semibold ${
          onDark ? "text-white" : "text-base-content"
        }`}
      >
        {BRAND.companyName}
      </span>
    </div>
  );
}
