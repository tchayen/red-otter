import { Vec4 } from "./math/Vec4";

/**
 * https://stackoverflow.com/a/54014428
 */
function hslToRgb(h: number, s: number, l: number): number[] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number, k = (n + h / 30) % 12): number =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

  return [f(0), f(8), f(4)];
}

/**
 * Supported formats:
 *
 * ### Hex
 * - `#f00`
 * - `#ff0000`
 *
 * ### RGB
 *
 * - `rgb(255, 0, 0)`
 * - `rgba(255, 0, 0, 0.5)`
 *
 * ### HSL
 *
 * - `hsl(60, 100%, 50%)`
 * - `hsl(60 100% 50%)`
 * - `hsla(30, 60%, 90%, 0.8)`
 * - `hsla(30 60% 90% 0.8)`
 * - `hsla(30 60% 90% / 0.8)`
 */
export function parseColor(color: string): Vec4 {
  if (color.startsWith("#")) {
    if (color.length === 7) {
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;

      return new Vec4(r, g, b, 1);
    } else if (color.length === 4) {
      const r = parseInt(color.slice(1, 2), 16);
      const g = parseInt(color.slice(2, 3), 16);
      const b = parseInt(color.slice(3, 4), 16);

      return new Vec4(r, g, b, 1);
    } else {
      throw new Error(`Unsupported color: ${color}.`);
    }
  } else if (color.startsWith("rgb")) {
    const hasAlpha = color[3] === "a";
    const channels = color
      .slice(hasAlpha ? 5 : 4, -1)
      .split(",")
      .map((s) => Number(s));

    return new Vec4(
      channels[0] / 255,
      channels[1] / 255,
      channels[2] / 255,
      hasAlpha ? channels[3] : 1
    );
  } else if (color.startsWith("hsl")) {
    const separator = color.indexOf(",") !== -1 ? "," : " ";
    const hasAlpha = color[3] === "a";
    const channels = color.slice(hasAlpha ? 5 : 4, -1).split(separator);

    if (color.includes("/")) {
      channels[3] = channels[4];
      channels.pop();
    }

    const alpha = hasAlpha ? Number(channels[3]) : 1;
    const converted = hslToRgb(
      Number(channels[0]),
      Number(channels[1].slice(0, -1)) / 100,
      Number(channels[2].slice(0, -1)) / 100
    );

    return new Vec4(converted[0], converted[1], converted[2], alpha);
  } else {
    throw new Error(`Unsupported color: ${color}.`);
  }
}
