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

    expect(result.data).toEqual([1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]);
  });

  it("should correctly multiply two matrices", () => {
    const m1 = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const m2 = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    const result = m1.multiply(m2);

    expect(result.data).toEqual([
      90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542, 600,
    ]);
  });

  it("should return a correctly oriented camera matrix", () => {
    const cameraPosition = new Vec3(1, 2, 3);
    const target = new Vec3(0, 0, 0);
    const up = new Vec3(0, 1, 0);

    const result = Mat4.lookAt(cameraPosition, target, up);

    const expected = new Mat4([
      0.948_683_298_050_513_9, -0.169_030_850_945_703_33, 0.267_261_241_912_424_4, 0, 0,
      0.845_154_254_728_516_7, 0.534_522_483_824_848_8, 0, -0.316_227_766_016_837_94,
      -0.507_092_552_837_11, 0.801_783_725_737_273_2, 0, -1.110_223_024_625_156_5e-16,
      -2.220_446_049_250_313e-16, -3.741_657_386_773_941_3, 1,
    ]);

    expect(result.data).toEqual(expected.data);
  });
});
