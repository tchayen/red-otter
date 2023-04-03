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

  scale(scalar: number): Vec4 {
    return new Vec4(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar,
      this.w * scalar
    );
  }
}
