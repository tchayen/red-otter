import { describe, expect, it } from "vitest";
import { Vec2 } from "./Vec2";
import { triangulatePolygon } from "./triangulatePolygon";

describe("triangulatePolygon", () => {
  it("works", () => {
    const data = [
      new Vec2(0, 80),
      new Vec2(100, 0),
      new Vec2(190, 85),
      new Vec2(270, 35),
      new Vec2(345, 140),
      new Vec2(255, 130),
      new Vec2(215, 210),
      new Vec2(140, 70),
      new Vec2(45, 95),
      new Vec2(50, 185),
    ];
    const triangles = triangulatePolygon(data);
    expect(triangles).toHaveLength(24);
    expect(triangles[0].equals(new Vec2(50, 185))).toBeTruthy();
    expect(triangles[1].equals(new Vec2(45, 95))).toBeTruthy();
  });
});
