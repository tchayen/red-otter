import { Vec3 } from "./Vec3";

const EPSILON = 0.001;

/**
 * A 4-dimensional vector.
 */
export class Vec4 {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly w: number
  ) {}

  add(other: Vec4): Vec4 {
    return new Vec4(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z,
      this.w + other.w
    );
  }

  subtract(other: Vec4): Vec4 {
    return new Vec4(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z,
      this.w - other.w
    );
  }

  length(): number {
    return Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }

  normalize(): Vec4 {
    const length = this.length();
    return new Vec4(
      this.x / length,
      this.y / length,
      this.z / length,
      this.w / length
    );
  }

  scale(scalar: number): Vec4 {
    return new Vec4(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar,
      this.w * scalar
    );
  }

  cross(other: Vec4): Vec4 {
    return new Vec4(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
      0
    );
  }

  dot(other: Vec4): number {
    return (
      this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w
    );
  }

  distance(other: Vec4): number {
    return this.subtract(other).length();
  }

  lerp(other: Vec4, t: number): Vec4 {
    return this.add(other.subtract(this).scale(t));
  }

  xyz(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  equalsEpsilon(other: Vec4, epsilon: number): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon &&
      Math.abs(this.w - other.w) < epsilon
    );
  }

  equals(other: Vec4): boolean {
    return this.equalsEpsilon(other, EPSILON);
  }

  data(): number[] {
    return [this.x, this.y, this.z, this.w];
  }

  toString(): string {
    return `(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
  }
}
