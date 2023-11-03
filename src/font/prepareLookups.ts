import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { packShelves } from "../math/packShelves";
import { calculateGlyphQuads } from "./calculateGlyphQuads";
import { generateKerningFunction } from "./generateKerningFunction";
import { TTF } from "./parseTTF";
import { fontSizeToGap } from "./renderFontAtlas";
import { Glyph, Lookups } from "./types";

/**
 * This is generally extension of the font parsing process.
 *
 * @param fontFiles an array of font files to parse.
 * @param options optional parameters.
 * @returns a set of lookups for the font atlas.
 */
export function prepareLookups(
  fontFiles: {
    buffer: ArrayBuffer;
    name: string;
    ttf: TTF;
  }[],
  options?: {
    alphabet?: string;
    fontSize?: number;
  }
): Lookups {
  const atlasFontSize = options?.fontSize ?? 96;
  const atlasGap = fontSizeToGap(atlasFontSize);

  const lookups: Lookups = {
    atlas: {
      fontSize: atlasFontSize,
      height: 0,
      positions: [],
      sizes: [],
      width: 0,
    },
    fonts: [],
    uvs: new Map<string, Vec4>(),
  };

  const sizes: Vec2[] = [];
  for (const { name, ttf, buffer } of fontFiles) {
    const scale = (1 / ttf.head.unitsPerEm) * atlasFontSize;
    const glyphs = calculateGlyphQuads(ttf, options?.alphabet);

    sizes.push(
      ...glyphs.map(
        (g) =>
          new Vec2(
            g.width * scale + atlasGap * 2,
            g.height * scale + atlasGap * 2
          )
      )
    );

    const glyphMap = new Map<number, Glyph>();
    for (const glyph of glyphs) {
      glyphMap.set(glyph.id, glyph);
    }

    lookups.fonts.push({
      ascender: ttf.hhea.ascender,
      buffer,
      capHeight: ttf.hhea.ascender + ttf.hhea.descender,
      glyphs: glyphMap,
      kern: generateKerningFunction(ttf),
      name,
      ttf,
      unitsPerEm: ttf.head.unitsPerEm,
    });
  }

  const packing = packShelves(sizes);

  lookups.atlas = {
    fontSize: atlasFontSize,
    height: packing.height,
    positions: packing.positions,
    sizes,
    width: packing.width,
  };

  let start = 0;
  for (const font of lookups.fonts) {
    const uvs: Vec4[] = [];
    const glyphs = [...font.glyphs.values()];

    for (let i = 0; i < glyphs.length; i++) {
      const position = lookups.atlas.positions[start + i];
      const size = lookups.atlas.sizes[start + i];

      uvs.push(
        new Vec4(
          position.x / lookups.atlas.width,
          position.y / lookups.atlas.height,
          size.x / lookups.atlas.width,
          size.y / lookups.atlas.height
        )
      );
    }
    start += glyphs.length;

    for (let i = 0; i < glyphs.length; i++) {
      lookups.uvs.set(`${font.name}-${glyphs[i].id}`, uvs[i]);
    }
  }

  return lookups;
}