// Save as: src/config/brand.js
// Single source of truth for branding. Login and dashboard both read this.
//
//   logo      Path or URL, e.g. "/logo.png" (file in /public). Used on light surfaces.
//   logoDark  Optional light/white version for the dark navy surfaces.
//             If empty, `logo` is shown on a white chip there.
export const BRAND = {
  productName: "HLS Monitor",
  companyName: "Wildroots",
  logo: "/wildroots_logo.png",
  logoDark: "/wildroots_logo.png",
};

// The dark navy surface shared by the login panel and the dashboard summary.
// Kept as complete class strings so Tailwind can detect them.
export const PANEL = {
  surface: "bg-[#12263A] text-white",
  muted: "text-[#9FB3C5]",
  faint: "text-[#6F8599]",
  list: "divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5",
};
