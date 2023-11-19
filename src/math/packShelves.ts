import { invariant } from "../utils/invariant";
import { Vec2 } from "./Vec2";

export type Packing = {
  height: number;
  positions: Vec2[];
  width: number;
};

/**
 * Takes sizes of rectangles and packs them into a single texture. Width and
 * height will be the next power of two.
 */
export function packShelves(sizes: Vec2[]): Packing {
  let area = 0;
  let maxWidth = 0;

  const rectangles = sizes.map((rectangle, i) => ({
    height: rectangle.y,
    id: i,
    width: rectangle.x,
    x: 0,
    y: 0,
  }));

  for (const box of rectangles) {
    area += box.width * box.height;
    maxWidth = Math.max(maxWidth, box.width);
  }

  rectangles.sort((a, b) => b.height - a.height);

  // Aim for a squarish resulting container. Slightly adjusted for sub-100%
  // space utilization.
  const startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth);

  const regions = [{ height: Number.POSITIVE_INFINITY, width: startWidth, x: 0, y: 0 }];

  let width = 0;
  let height = 0;

  for (const box of rectangles) {
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i];
      invariant(region, "Region is missing.");
      if (box.width > region.width || box.height > region.height) {
        continue;
      }

      box.x = region.x;
      box.y = region.y;
      height = Math.max(height, box.y + box.height);
      width = Math.max(width, box.x + box.width);

      if (box.width === region.width && box.height === region.height) {
        const last = regions.pop();
        invariant(last, "Regions array should not be empty.");

        if (i < regions.length) {
          regions[i] = last;
        }
      } else if (box.height === region.height) {
        region.x += box.width;
        region.width -= box.width;
      } else if (box.width === region.width) {
        region.y += box.height;
        region.height -= box.height;
      } else {
        regions.push({
          height: box.height,
          width: region.width - box.width,
          x: region.x + box.width,
          y: region.y,
        });

        region.y += box.height;
        region.height -= box.height;
      }
      break;
    }
  }

  const size = Math.max(ceilPow2(width), ceilPow2(height));
  rectangles.sort((a, b) => a.id - b.id);

  return {
    height: size,
    positions: rectangles.map((rectangle) => new Vec2(rectangle.x, rectangle.y)),
    width: size,
  };
}

function ceilPow2(x: number): number {
  let value = x;
  value -= 1;
  value |= value >> 1;
  value |= value >> 2;
  value |= value >> 4;
  value |= value >> 8;
  value |= value >> 16;
  value += 1;
  return value;
}
