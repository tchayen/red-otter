import { invariant } from "../invariant";
import { packShelves } from "../math/packShelves";
import { Vec2 } from "../math/Vec2";
import { ATLAS_FONT_SIZE, ATLAS_GAP, ATLAS_RADIUS } from "./atlasConsts";
import { toSDF } from "./SDF";
import { TTF } from "./TTF";

const DEBUG_FONT_ATLAS_PRINT_GLYPHS_AS_JSON = false;
const DEBUG_FONT_ATLAS_SHOW_GLYPH_BACKGROUNDS = false;

export type FontAtlasMetadata = {
  unitsPerEm: number;
  capHeight: number;
  ascender: number;
  columns: string[];
};

export type Spacing = FontAtlasMetadata & {
  glyphs: number[];
  uvs: number[];
};

type Atlas = {
  width: number;
  height: number;
  positions: Vec2[];
  sizes: Vec2[];
};

export type Glyph = {
  id: number;
  character: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lsb: number;
  rsb: number;
};

/**
 * Takes array of glyph sizing quads and calculates tight packing of them into
 * a texture atlas.
 */
export class FontAtlas {
  readonly atlas: Atlas;
  readonly glyphs: Glyph[];
  readonly scale: number;

  /**
   * Alphabet is the subset of characters that will be included in the atlas.
   * If not specified, all characters in the font will be included.
   */
  constructor(public readonly ttf: TTF, alphabet?: string) {
    this.scale = (1 / ttf.head.unitsPerEm) * ATLAS_FONT_SIZE;
    this.glyphs = calculateGlyphQuads(ttf, alphabet);

    const transform = (x: number): number => Math.ceil(x * this.scale);
    const sizes = this.glyphs.map(
      (g) =>
        new Vec2(
          transform(g.width) + ATLAS_GAP * 2,
          transform(g.height) + ATLAS_GAP * 2
        )
    );
    const packing = packShelves(sizes);
    invariant(
      packing.positions.length === this.glyphs.length,
      `Packing produced different number of positions than expected.`
    );

    this.atlas = {
      width: packing.width,
      height: packing.height,
      positions: packing.positions,
      sizes,
    };
  }

  /**
   * Returns a canvas with the font atlas rendered on it.
   */
  render(): { canvas: HTMLCanvasElement; spacing: Spacing } {
    // Set up canvas.
    const canvas = document.createElement("canvas");
    canvas.width = this.atlas.width * window.devicePixelRatio;
    canvas.height = this.atlas.height * window.devicePixelRatio;
    canvas.setAttribute(
      "style",
      `width: ${this.atlas.width}px; height: ${this.atlas.height}px;`
    );

    // Get 2D context.
    const context = canvas.getContext("2d");
    invariant(context, "Could not get 2D context.");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = `${ATLAS_FONT_SIZE}px Inter`;

    // Render glyphs.
    const uvs: { position: Vec2; size: Vec2 }[] = [];

    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      const position = this.atlas.positions[i];
      const size = this.atlas.sizes[i];

      const x = position.x;
      const y = position.y;
      const w = size.x;
      const h = size.y;

      if (DEBUG_FONT_ATLAS_SHOW_GLYPH_BACKGROUNDS) {
        context.fillStyle = "rgba(255, 0, 255, 0.3)";
        context.fillRect(x, y, w, h);
      }

      uvs.push({
        position: new Vec2(x / this.atlas.width, y / this.atlas.height),
        size: new Vec2(w / this.atlas.width, h / this.atlas.height),
      });

      context.fillStyle = "rgba(255, 255, 255, 1)";
      context.fillText(
        String.fromCharCode(glyph.id),
        // Additionally offset by glyph (X, Y).
        x - glyph.x * this.scale + ATLAS_GAP,
        y + size.y + glyph.y * this.scale - ATLAS_GAP
      );
    }

    // Apply SDF.
    const imageData = context.getImageData(
      0,
      0,
      this.atlas.width,
      this.atlas.height
    );
    const sdfData = toSDF(
      imageData,
      this.atlas.width,
      this.atlas.height,
      ATLAS_RADIUS
    );
    context.putImageData(sdfData, 0, 0);

    // Calculate spacing data.
    const spacing = {
      unitsPerEm: this.ttf.head.unitsPerEm,
      capHeight: this.ttf.hhea.ascender + this.ttf.hhea.descender,
      ascender: this.ttf.hhea.ascender,
      columns: ["id", "x", "y", "width", "height", "lsb", "rsb"],
      glyphs: this.glyphs.flatMap((g) => [
        g.id,
        g.x,
        g.y,
        g.width,
        g.height,
        g.lsb,
        g.rsb,
      ]),
      uvs: uvs.flatMap((uv) => [
        uv.position.x,
        uv.position.y,
        uv.size.x,
        uv.size.y,
      ]),
    };

    // Print whole file as JSON (as opposed to binary).
    if (DEBUG_FONT_ATLAS_PRINT_GLYPHS_AS_JSON) {
      const mapped = this.glyphs.map((g) => ({
        id: g.id,
        x: g.x,
        y: g.y,
        width: g.width,
        height: g.height,
        lsb: g.lsb,
        rsb: g.rsb,
      }));

      const spacingJson = JSON.stringify(mapped, null, 2);
      console.debug(spacingJson);
    }

    return { spacing, canvas };
  }
}

function calculateGlyphQuads(ttf: TTF, alphabet?: string): Glyph[] {
  const charCodes = alphabet
    ? alphabet.split("").map((c) => c.charCodeAt(0))
    : [...ttf.cmap.glyphIndexMap.keys()];

  return charCodes.map((code) => {
    invariant(ttf, "TTF is missing.");

    const index = ttf.cmap.glyphIndexMap.get(code);

    invariant(
      index,
      `Couldn't find index for character '${String.fromCharCode(
        code
      )}' in glyphIndexMap.`
    );
    invariant(
      index < ttf.glyf.length,
      "Index is out of bounds for glyf table."
    );

    const lastMetric = ttf.hmtx.hMetrics.at(-1);
    invariant(
      lastMetric,
      "The last advance is missing, which means that hmtx table is probably empty."
    );

    const hmtx =
      index < ttf.hhea.numberOfHMetrics
        ? ttf.hmtx.hMetrics[index]
        : {
            leftSideBearing:
              ttf.hmtx.leftSideBearings[index - ttf.hhea.numberOfHMetrics],
            advanceWidth: lastMetric.advanceWidth,
          };
    const glyf = ttf.glyf[index];

    const glyph: Glyph = {
      id: code,
      character: String.fromCharCode(code),
      x: glyf.xMin,
      y: glyf.yMin,
      width: glyf.xMax - glyf.xMin,
      height: glyf.yMax - glyf.yMin,
      lsb: hmtx.leftSideBearing,
      rsb: hmtx.advanceWidth - hmtx.leftSideBearing - (glyf.xMax - glyf.xMin),
    };

    return glyph;
  });
}
