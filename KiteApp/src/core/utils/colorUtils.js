/**
 * Converts a Unity-style color object {r, g, b} to a Hex string.
 * @param {Object} color - The Unity color object (0-1 range).
 * @param {string} fallback - Fallback hex color if input is invalid.
 * @returns {string} The hex color string.
 */
export function unityColorToHex(color, fallback = "#111827") {
  if (!color) {
    return fallback;
  }

  const r = Math.round((color.r || 0) * 255)
    .toString(16)
    .padStart(2, "0");

  const g = Math.round((color.g || 0) * 255)
    .toString(16)
    .padStart(2, "0");

  const b = Math.round((color.b || 0) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${r}${g}${b}`;
}
