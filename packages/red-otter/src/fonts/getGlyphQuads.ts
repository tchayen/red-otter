import { invariant } from "../invariant";
import { TTF } from "./parseTTF";

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
 * Takes optional alphabet (otherwise uses full font) string and returns an
 * array of glyph information.
 */
export function getGlyphQuads(ttf: TTF, alphabet?: string): Glyph[] {
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
