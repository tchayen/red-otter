import type { Vec2 } from "./Vec2";
import { Vec4 } from "./Vec4";

/**
 * Makes sure that the given value is within the given range using combination
 * of min() and max().
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min);
}

/**
 * Performs a linear interpolation between two values.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Performs a smooth interpolation between two values.
 * `t` should be in the range [0, 1].
 */
export function smoothstep(a: number, b: number, t: number): number {
  t = clamp((t - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Converts degrees to radians.
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Returns the next power of two that is greater than or equal to the given
 * value.
 */
export function nextPowerOfTwo(value: number): number {
  return Math.pow(2, Math.ceil(Math.log(value) / Math.log(2)));
}

/**
 * Returns intersection of two rectangles. If there is no intersection, returns a Vec4(0, 0, 0, 0).
 */
export function intersection(a: Vec4, b: Vec4): Vec4 {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const width = Math.min(a.x + a.z, b.x + b.z) - x;
  const height = Math.min(a.y + a.w, b.y + b.w) - y;

  if (width <= 0 || height <= 0) {
    return new Vec4(0, 0, 0, 0);
  }

  return new Vec4(x, y, width, height);
}

/**
 * Checks if the given point is inside the given rectangle.
 */
export function isInside(point: Vec2, rectangle: Vec4): boolean {
  return (
    point.x >= rectangle.x &&
    point.x <= rectangle.x + rectangle.z &&
    point.y >= rectangle.y &&
    point.y <= rectangle.y + rectangle.w
  );
}
