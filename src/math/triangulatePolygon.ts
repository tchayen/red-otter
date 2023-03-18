import { invariant } from "../invariant";
import { Vec2 } from "./Vec2";

type RingNode = {
  position: Vec2;
  prev: RingNode;
  next: RingNode;
};

function earCut(ear: RingNode): Vec2[] {
  const triangles = [];

  let next = ear.next;
  let prev = ear.prev;
  let stop = ear;

  while (prev !== next) {
    prev = ear.prev;
    next = ear.next;
    if (isEar(ear)) {
      triangles.push(ear.position, prev.position, next.position);
      removeNode(ear);
      // Skipping next vertex is a handy trick to achieve less so called 'sliver triangles'.
      ear = next.next;
      stop = next.next;
      continue;
    }

    ear = next;

    invariant(ear !== stop, "Triangulation failed.");
  }
  return triangles;
}

/**
 * Triangulates a polygon. TODO: add if it's clockwise or counter-clockwise.
 */
export function triangulatePolygon(polygon: Vec2[]): Vec2[] {
  invariant(polygon.length >= 3, "Polygon must have at least 3 points.");
  const node = createRing(polygon);
  invariant(node, "Failed to triangulate polygon.");
  return earCut(node);
}

function insertNode(position: Vec2, last?: RingNode): RingNode {
  const p = { position } as RingNode;

  if (!last) {
    p.prev = p;
    p.next = p;
  } else {
    p.next = last.next;
    p.prev = last;
    last.next.prev = p;
    last.next = p;
  }
  return p;
}

function removeNode(p: RingNode): void {
  p.next.prev = p.prev;
  p.prev.next = p.next;
}

export function createRing(data: Vec2[]): RingNode | null {
  let last;
  for (const v of data) {
    last = insertNode(v, last);
  }
  return filterPoints(last);
}

function filterPoints(start?: RingNode, end?: RingNode): RingNode | null {
  if (!start) {
    return null;
  }
  if (!end) {
    end = start;
  }

  let p = start;
  let again;
  do {
    again = false;

    if (
      p.position.equals(p.next.position) ||
      area(p.prev.position, p.position, p.next.position) === 0
    ) {
      removeNode(p);
      p = end = p.prev;

      if (p === p.next) {
        break;
      }

      again = true;
    } else {
      p = p.next;
    }
  } while (again || p !== end);
  return end;
}

function area(a: Vec2, b: Vec2, c: Vec2): number {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function isEar(ear: RingNode): boolean {
  const a = ear.prev;
  const b = ear;
  const c = ear.next;

  if (area(a.position, b.position, c.position) >= 0) {
    return false;
  }

  let p = ear.next.next;
  while (p !== ear.prev) {
    const inTriangle = isPointInPolygon(p.position, [
      a.position,
      b.position,
      c.position,
    ]);

    if (inTriangle && area(p.prev.position, p.position, p.next.position) >= 0) {
      return false;
    }
    p = p.next;
  }
  return true;
}

function isPointInPolygon(point: Vec2, points: Vec2[]): boolean {
  let i = 0;
  let j = points.length - 1;
  let oddNodes = false;

  while (i < points.length) {
    // Check if the point is between the y coordinates of the two points of the edge.
    if (
      (points[i].y < point.y && points[j].y >= point.y) ||
      (points[j].y < point.y && points[i].y >= point.y)
    ) {
      // Calculate the x coordinate of the point based on the slope of the edge and the y coordinate of the point
      if (
        points[i].x +
          ((point.y - points[i].y) / (points[j].y - points[i].y)) *
            (points[j].x - points[i].x) <
        point.x
      ) {
        oddNodes = !oddNodes;
      }
    }

    j = i;
    i += 1;
  }

  return oddNodes;
}
