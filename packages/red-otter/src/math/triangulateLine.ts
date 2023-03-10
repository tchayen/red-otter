import { invariant } from "../invariant";
import { Vec2 } from "./Vec2";

export function triangulateLine(points: Vec2[], thickness: number): Vec2[] {
  invariant(points.length >= 2, "Line must have at least 2 points.");
  invariant(thickness > 0, "Thickness must be positive.");

  const triangles = [];

  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const n1 = new Vec2(dy, -dx).normalize().scale(thickness / 2);
    const n2 = new Vec2(-dy, dx).normalize().scale(thickness / 2);

    triangles.push(
      points[i + 1].add(n2),
      points[i].add(n2),
      points[i].add(n1),
      points[i].add(n1),
      points[i + 1].add(n1),
      points[i + 1].add(n2)
    );
  }

  return triangles;
}
