import { invariant } from "../invariant";
import { Vec2 } from "../math/Vec2";
import { packShelves } from "../math/packShelves";
import { Glyph } from "./getGlyphQuads";
import { ATLAS_GAP } from "./atlasConsts";

export type Atlas = {
  width: number;
  height: number;
  positions: Vec2[];
  sizes: Vec2[];
};

/**
 * Takes array of glyph sizing quads and packs them into a single texture.
 */
export function prepareAtlas(glyphs: Glyph[], scale: number): Atlas {
  const transform = (x: number): number => Math.ceil(x * scale);

  const sizes = glyphs.map(
    (g) =>
      new Vec2(
        transform(g.width) + ATLAS_GAP * 2,
        transform(g.height) + ATLAS_GAP * 2
      )
  );

  const packing = packShelves(sizes);

  invariant(
    packing.positions.length === glyphs.length,
    `Packing produced different number of positions than expected.`
  );

  return {
    width: packing.width,
    height: packing.height,
    positions: packing.positions,
    sizes,
  };
}

/**
 * Comes from public/spacing.json.
 */
export type FontAtlasMetadata = {
  unitsPerEm: number;
  capHeight: number;
  ascender: number;
  columns: string[];
};

/**
 * Used to validate received metadata from the server.
 */
export function validateMetadata(
  metadata: unknown
): asserts metadata is FontAtlasMetadata {
  invariant(typeof metadata === "object", "Metadata must be an object.");
  invariant(metadata !== null, "Metadata must not be null.");

  invariant(
    "unitsPerEm" in metadata && typeof metadata.unitsPerEm === "number",
    "Metadata must have unitsPerEm."
  );
  invariant(
    "capHeight" in metadata && typeof metadata.capHeight === "number",
    "Metadata must have capHeight."
  );
  invariant(
    "ascender" in metadata && typeof metadata.ascender === "number",
    "Metadata must have ascender."
  );
  invariant(
    "columns" in metadata && Array.isArray(metadata.columns),
    "Metadata must have columns."
  );
}
