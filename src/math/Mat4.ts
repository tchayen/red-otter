// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Vec3 } from "./Vec3";
import { Vec4 } from "./Vec4";

export class Mat4 {
  constructor(public readonly data: Array<number>) {}

  static identity(): Mat4 {
    // prettier-ignore
    return new Mat4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  static scale(x: number, y: number, z: number): Mat4 {
    // prettier-ignore
    return new Mat4([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ]);
  }

  static translate(x: number, y: number, z: number): Mat4 {
    // prettier-ignore
    return new Mat4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]);
  }

  static xRotation(angle: number): Mat4 {
    // prettier-ignore
    return new Mat4([
      1, 0, 0, 0,
      0, Math.cos(angle), Math.sin(angle), 0,
      0, -Math.sin(angle), Math.cos(angle), 0,
      0, 0, 0, 1,
    ]);
  }

  static yRotation(angle: number): Mat4 {
    // prettier-ignore
    return new Mat4([
      Math.cos(angle), 0, -Math.sin(angle), 0,
      0, 1, 0, 0,
      Math.sin(angle), 0, Math.cos(angle), 0,
      0, 0, 0, 1,
    ]);
  }

  static zRotation(angle: number): Mat4 {
    // prettier-ignore
    return new Mat4([
      Math.cos(angle), -Math.sin(angle), 0, 0,
      Math.sin(angle), Math.cos(angle), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  static rotate(x: number, y: number, z: number): Mat4 {
    return this.xRotation(x).multiply(this.yRotation(y)).multiply(this.zRotation(z));
  }

  static rotateFromQuat(q: Vec4): Mat4 {
    const x = q.x;
    const y = q.y;
    const z = q.z;
    const w = q.w;

    const x2 = x * x;
    const y2 = y * y;
    const z2 = z * z;

    const xy = x * y;
    const xz = x * z;
    const yz = y * z;
    const wx = w * x;
    const wy = w * y;
    const wz = w * z;

    // prettier-ignore
    return new Mat4([
      1 - 2 * (y2 + z2), 2 * (xy - wz), 2 * (xz + wy), 0,
      2 * (xy + wz), 1 - 2 * (x2 + z2), 2 * (yz - wx), 0,
      2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (x2 + y2), 0,
      0, 0, 0, 1
    ])
  }

  static orthographic(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
  ): Mat4 {
    // prettier-ignore
    return new Mat4([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, -2 / (far - near), 0,
      -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1,
    ]);
  }

  /**
   * `fov` is in radians.
   */
  static perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1.0 / (near - far);

    // prettier-ignore
    return new Mat4([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0,
    ]);
  }

  static lookAt(position, target, up) {
    // Camera's backward vector.
    const zAxis = position.subtract(target).normalize();
    // Camera's right vector.
    const xAxis = up.cross(zAxis).normalize();
    // Camera's up vector.
    const yAxis = zAxis.cross(xAxis).normalize();

    // Calculate the negative translation
    const posX = -xAxis.dot(position);
    const posY = -yAxis.dot(position);
    const posZ = -zAxis.dot(position);

    // prettier-ignore
    return new Mat4([
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      posX, posY, posZ, 1,
    ]);
  }

  translate(offset: Vec3): Mat4 {
    return Mat4.translate(offset.x, offset.y, offset.z).multiply(this);
  }

  rotate(angle: Vec3): Mat4 {
    return Mat4.rotate(angle.x, angle.y, angle.z).multiply(this);
  }

  scale(scale: Vec3): Mat4 {
    return Mat4.scale(scale.x, scale.y, scale.z).multiply(this);
  }

  transpose(): Mat4 {
    return new Mat4([
      this.data[0],
      this.data[4],
      this.data[8],
      this.data[12],
      this.data[1],
      this.data[5],
      this.data[9],
      this.data[13],
      this.data[2],
      this.data[6],
      this.data[10],
      this.data[14],
      this.data[3],
      this.data[7],
      this.data[11],
      this.data[15],
    ]);
  }

  multiplyVec4(vec: Vec4): Vec4 {
    return new Vec4(
      this.data[0] * vec.x + this.data[1] * vec.y + this.data[2] * vec.z + this.data[3] * vec.w,
      this.data[4] * vec.x + this.data[5] * vec.y + this.data[6] * vec.z + this.data[7] * vec.w,
      this.data[8] * vec.x + this.data[9] * vec.y + this.data[10] * vec.z + this.data[11] * vec.w,
      this.data[12] * vec.x + this.data[13] * vec.y + this.data[14] * vec.z + this.data[15] * vec.w,
    );
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

  invert(): Mat4 {
    const m00 = this.data[0];
    const m01 = this.data[1];
    const m02 = this.data[2];
    const m03 = this.data[3];
    const m10 = this.data[4];
    const m11 = this.data[5];
    const m12 = this.data[6];
    const m13 = this.data[7];
    const m20 = this.data[8];
    const m21 = this.data[9];
    const m22 = this.data[10];
    const m23 = this.data[11];
    const m30 = this.data[12];
    const m31 = this.data[13];
    const m32 = this.data[14];
    const m33 = this.data[15];

    const tmp_0 = m22 * m33;
    const tmp_1 = m32 * m23;
    const tmp_2 = m12 * m33;
    const tmp_3 = m32 * m13;
    const tmp_4 = m12 * m23;
    const tmp_5 = m22 * m13;
    const tmp_6 = m02 * m33;
    const tmp_7 = m32 * m03;
    const tmp_8 = m02 * m23;
    const tmp_9 = m22 * m03;
    const tmp_10 = m02 * m13;
    const tmp_11 = m12 * m03;
    const tmp_12 = m20 * m31;
    const tmp_13 = m30 * m21;
    const tmp_14 = m10 * m31;
    const tmp_15 = m30 * m11;
    const tmp_16 = m10 * m21;
    const tmp_17 = m20 * m11;
    const tmp_18 = m00 * m31;
    const tmp_19 = m30 * m01;
    const tmp_20 = m00 * m21;
    const tmp_21 = m20 * m01;
    const tmp_22 = m00 * m11;
    const tmp_23 = m10 * m01;

    const t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    const t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    const t2 =
      tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    const t3 =
      tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    const d = 1 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return new Mat4([
      d * t0,
      d * t1,
      d * t2,
      d * t3,

      d * (tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30 - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * (tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30 - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * (tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30 - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * (tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20 - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d *
        (tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d *
        (tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d *
        (tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d *
        (tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d *
        (tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d *
        (tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d *
        (tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d *
        (tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
    ]);
  }
}
