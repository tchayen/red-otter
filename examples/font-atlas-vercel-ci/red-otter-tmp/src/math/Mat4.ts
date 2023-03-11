export class Mat4 {
  constructor(public readonly data: number[]) {}

  static identity(): Mat4 {
    return new Mat4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  static scale(x: number, y: number, z: number): Mat4 {
    return new Mat4([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]);
  }

  static orthographic(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ): Mat4 {
    return new Mat4([
      2 / (right - left),
      0,
      0,
      0,
      0,
      2 / (top - bottom),
      0,
      0,
      0,
      0,
      -2 / (far - near),
      0,
      -(right + left) / (right - left),
      -(top + bottom) / (top - bottom),
      -(far + near) / (far - near),
      1,
    ]);
  }

  static translate(x: number, y: number, z: number): Mat4 {
    return new Mat4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }

  multiply(other: Mat4): Mat4 {
    return new Mat4([
      this.data[0] * other.data[0] +
        this.data[1] * other.data[4] +
        this.data[2] * other.data[8] +
        this.data[3] * other.data[12],
      this.data[0] * other.data[1] +
        this.data[1] * other.data[5] +
        this.data[2] * other.data[9] +
        this.data[3] * other.data[13],
      this.data[0] * other.data[2] +
        this.data[1] * other.data[6] +
        this.data[2] * other.data[10] +
        this.data[3] * other.data[14],
      this.data[0] * other.data[3] +
        this.data[1] * other.data[7] +
        this.data[2] * other.data[11] +
        this.data[3] * other.data[15],
      this.data[4] * other.data[0] +
        this.data[5] * other.data[4] +
        this.data[6] * other.data[8] +
        this.data[7] * other.data[12],
      this.data[4] * other.data[1] +
        this.data[5] * other.data[5] +
        this.data[6] * other.data[9] +
        this.data[7] * other.data[13],
      this.data[4] * other.data[2] +
        this.data[5] * other.data[6] +
        this.data[6] * other.data[10] +
        this.data[7] * other.data[14],
      this.data[4] * other.data[3] +
        this.data[5] * other.data[7] +
        this.data[6] * other.data[11] +
        this.data[7] * other.data[15],
      this.data[8] * other.data[0] +
        this.data[9] * other.data[4] +
        this.data[10] * other.data[8] +
        this.data[11] * other.data[12],
      this.data[8] * other.data[1] +
        this.data[9] * other.data[5] +
        this.data[10] * other.data[9] +
        this.data[11] * other.data[13],
      this.data[8] * other.data[2] +
        this.data[9] * other.data[6] +
        this.data[10] * other.data[10] +
        this.data[11] * other.data[14],
      this.data[8] * other.data[3] +
        this.data[9] * other.data[7] +
        this.data[10] * other.data[11] +
        this.data[11] * other.data[15],
      this.data[12] * other.data[0] +
        this.data[13] * other.data[4] +
        this.data[14] * other.data[8] +
        this.data[15] * other.data[12],
      this.data[12] * other.data[1] +
        this.data[13] * other.data[5] +
        this.data[14] * other.data[9] +
        this.data[15] * other.data[13],
      this.data[12] * other.data[2] +
        this.data[13] * other.data[6] +
        this.data[14] * other.data[10] +
        this.data[15] * other.data[14],
      this.data[12] * other.data[3] +
        this.data[13] * other.data[7] +
        this.data[14] * other.data[11] +
        this.data[15] * other.data[15],
    ]);
  }
}
