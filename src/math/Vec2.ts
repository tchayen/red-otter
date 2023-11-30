const EPSILON = 0.001;

/**
 * A 2D vector.
 */
export class Vec2 {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  add(other: Vec2): Vec2 {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vec2 {
    const length = this.length();
    return new Vec2(this.x / length, this.y / length);
  }

  scale(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  cross(other: Vec2): number {
    return this.x * other.y - this.y * other.x;
  }

  dot(other: Vec2): number {
    return this.x * other.x + this.y * other.y;
  }

  distance(other: Vec2): number {
    return this.subtract(other).length();
  }

  lerp(other: Vec2, t: number): Vec2 {
    return this.add(other.subtract(this).scale(t));
  }

  equalsEpsilon(other: Vec2, epsilon: number): boolean {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
  }

  equals(other: Vec2): boolean {
    return this.equalsEpsilon(other, EPSILON);
  }

  data(): number[] {
    return [this.x, this.y];
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
