import { describe, expect, it } from "vitest";
import { Vec2 } from "./Vec2";
import { packShelves } from "./packShelves";

describe("packShelves", () => {
  it("should work", () => {
    const rectangles = [
      new Vec2(10, 10),
      new Vec2(40, 40),
      new Vec2(15, 15),
      new Vec2(15, 15),
      new Vec2(50, 50),
    ];
    const packing = packShelves(rectangles);

    expect(packing.width).toBe(128);
    expect(packing.height).toBe(128);

    expect(packing.positions[0]?.x).toBe(40);
    expect(packing.positions[0]?.y).toBe(65);
    expect(packing.positions[3]?.x).toBe(55);
    expect(packing.positions[3]?.y).toBe(50);
  });
});
