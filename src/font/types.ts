import type { Vec2 } from "../math/Vec2";
import type { Vec4 } from "../math/Vec4";
import type { TTF } from "./parseTTF";

export type Glyph = {
  character: string;
  height: number;
  /**
   * Unicode code point. Do not confuse with TTF glyph index.
   */
  id: number;
  /**
   * Left side bearing.
   */
  lsb: number;
  /**
   * Right side bearing.
   */
  rsb: number;
  width: number;
  x: number;
  y: number;
};

export type KerningFunction = (leftGlyph: number, rightGlyph: number) => number;

export type Lookups = {
  atlas: {
    fontSize: number;
    height: number;
    positions: Array<Vec2>;
    sizes: Array<Vec2>;
    width: number;
  };
  fonts: Array<{
    ascender: number;
    buffer: ArrayBuffer;
    capHeight: number;
    glyphs: Map<number, Glyph>;
    kern: KerningFunction;
    name: string;
    ttf: TTF;
    unitsPerEm: number;
  }>;
  uvs: Map<string, Vec4>;
};
