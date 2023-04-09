import { describe, it, expect } from "vitest";

import { Mat4 } from "./Mat4";
import { Vec3 } from "./Vec3";

describe("Mat4", () => {
  it("inverse is correct", () => {
    const m = new Mat4([2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2]);

    const i = m.invert();
    const multipled = m.multiply(i);
    const expected = Mat4.identity();

    expect(multipled).toEqual(expected);
  });

  it("should correctly transpose the matrix", () => {
    const m = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    const result = m.transpose();

    expect(result.data).toEqual([
      1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16,
    ]);
  });

  it("should correctly multiply two matrices", () => {
    const m1 = new Mat4([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
    const m2 = new Mat4([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);

    const result = m1.multiply(m2);

    expect(result.data).toEqual([
      90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542,
      600,
    ]);
  });

  it("should return a correctly oriented camera matrix", () => {
    const cameraPosition = new Vec3(1, 2, 3);
    const target = new Vec3(0, 0, 0);
    const up = new Vec3(0, 1, 0);

    const result = Mat4.lookAt(cameraPosition, target, up);

    const expected = new Mat4([
      0.9486832980505139, 0, -0.31622776601683794, 0, -0.16903085094570333,
      0.8451542547285167, -0.50709255283711, 0, 0.2672612419124244,
      0.5345224838248488, 0.8017837257372732, 0, 1, 2, 3, 1,
    ]);

    expect(result.data).toEqual(expected.data);
  });
});
