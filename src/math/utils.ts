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
 * Returns the next power of two that is greater than or equal to the given value.
 */
export function nextPowerOfTwo(value: number): number {
  return Math.pow(2, Math.ceil(Math.log(value) / Math.log(2)));
}
