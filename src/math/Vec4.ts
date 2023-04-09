import { Vec3 } from "./Vec3";

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

  xyz(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }
}
