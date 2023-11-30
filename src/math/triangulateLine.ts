import { invariant } from "../utils/invariant";
import { Vec2 } from "./Vec2";

export function triangulateLine(points: Vec2[], thickness: number): Vec2[] {
  invariant(points.length >= 2, "Line must have at least 2 points.");
  invariant(thickness > 0, "Thickness must be positive.");

  const triangles = [];

  for (let i = 0; i < points.length - 1; i++) {
    const point = points[i];
    const nextPoint = points[i + 1];
    invariant(point, "Point is missing.");
    invariant(nextPoint, "Next point is missing.");

    const dx = nextPoint.x - point.x;
    const dy = nextPoint.y - point.y;
    const n1 = new Vec2(dy, -dx).normalize().scale(thickness / 2);
    const n2 = new Vec2(-dy, dx).normalize().scale(thickness / 2);

    triangles.push(
      nextPoint.add(n2),
      point.add(n2),
      point.add(n1),
      point.add(n1),
      nextPoint.add(n1),
      nextPoint.add(n2),
    );
  }

  return triangles;
}
