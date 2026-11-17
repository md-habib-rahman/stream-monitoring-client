// Shared status palette. Colors match the login page.
// Save as: src/utils/statusStyles.js

export const STATUS_COLORS = {
  UP: "#2FB67C",
  DEGRADED: "#E8A93B",
  FROZEN: "#5BA8D6",
  DOWN: "#E5534B",
};

const UNKNOWN_COLOR = "#8FA3B5";

// Higher = more severe. Used to put problem streams first.
export const STATUS_WEIGHT = {
  DOWN: 4,
  FROZEN: 3,
  DEGRADED: 2,
  UP: 1,
};

export function getStatusColor(status) {
  return STATUS_COLORS[status] || UNKNOWN_COLOR;
}
