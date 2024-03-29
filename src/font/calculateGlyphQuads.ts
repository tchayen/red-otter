import { invariant } from "../utils/invariant";
import type { TTF } from "./parseTTF";
import type { Glyph } from "./types";

export const MISSING_GLYPH = "?";
/**
 * Calculates glyph information for a given font file and optional alphabet.
 *
 * @param ttf parsed TTF file (see parseTTF.ts).
 * @param alphabet a string of characters to include in the atlas. If not provided, all characters of the font will be included.
 * @returns an array of glyph quads.
 */
export function calculateGlyphQuads(ttf: TTF, alphabet?: string): Array<Glyph> {
  const charCodes = alphabet
    ? // Ensure that the characters are unique.
      [...new Set(alphabet.split("").map((c) => c.charCodeAt(0)))]
    : Object.keys(ttf.cmap.glyphIndexMap).map(Number);

  if (!charCodes.some((code) => code === MISSING_GLYPH.charCodeAt(0))) {
    charCodes.push(MISSING_GLYPH.charCodeAt(0));
  }

  return charCodes.map((code) => {
    invariant(ttf, "TTF is missing.");

    const index =
      ttf.cmap.glyphIndexMap[code] ?? ttf.cmap.glyphIndexMap[MISSING_GLYPH.charCodeAt(0)]!;

    if (!ttf.cmap.glyphIndexMap[code]) {
      console.warn(
        `Couldn't find index for character '${String.fromCharCode(code)}' in glyphIndexMap.`,
      );
    }

    invariant(index < ttf.glyf.length, "Index is out of bounds for glyf table.");

    const lastMetric = ttf.hmtx.hMetrics.at(-1);
    invariant(
      lastMetric,
      "The last advance is missing, which means that hmtx table is probably empty.",
    );

    const hmtx =
      index < ttf.hhea.numberOfHMetrics
        ? ttf.hmtx.hMetrics[index]
        : {
            advanceWidth: lastMetric.advanceWidth,
            leftSideBearing: ttf.hmtx.leftSideBearings[index - ttf.hhea.numberOfHMetrics] ?? 0,
          };
    const glyf = ttf.glyf[index];
    invariant(glyf, "Glyph is missing.");
    invariant(hmtx, "HMTX is missing.");

    const glyph: Glyph = {
      character: String.fromCharCode(code),
      height: glyf.yMax - glyf.yMin,
      id: code,
      lsb: hmtx.leftSideBearing,
      rsb: hmtx.advanceWidth - hmtx.leftSideBearing - (glyf.xMax - glyf.xMin),
      width: glyf.xMax - glyf.xMin,
      x: glyf.xMin,
      y: glyf.yMin,
    };

    return glyph;
  });
}
