const EPSILON = 0.001;

/**
 * A 3-dimensional vector.
 */
export class Vec3 {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {}

  add(other: Vec3): Vec3 {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other: Vec3): Vec3 {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vec3 {
    const length = this.length();
    return new Vec3(this.x / length, this.y / length, this.z / length);
  }

  scale(scalar: number): Vec3 {
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  cross(other: Vec3): Vec3 {
    return new Vec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
    );
  }

  dot(other: Vec3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  distance(other: Vec3): number {
    return this.subtract(other).length();
  }

  lerp(other: Vec3, t: number): Vec3 {
    return this.add(other.subtract(this).scale(t));
  }

  equalsEpsilon(other: Vec3, epsilon: number): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  equals(other: Vec3): boolean {
    return this.equalsEpsilon(other, EPSILON);
  }

  toString(): string {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }
}
