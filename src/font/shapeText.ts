import { Vec2 } from "../math/Vec2";
import { TextAlign } from "../layout/styling";
import { LRUCache } from "../utils/LRUCache";
import { invariant } from "../utils/invariant";
import { fontSizeToGap } from "./renderFontAtlas";
import type { Lookups } from "./types";

export const ENABLE_KERNING = true;

const cache = new LRUCache<string, Shape>(512);

export type Shape = {
  boundingRectangle: { height: number; width: number };
  positions: Array<Vec2>;
  sizes: Array<Vec2>;
};

/**
 * The most important function for getting text on the screen. Given a string and font data, finds
 * the positions and sizes of each character.
 *
 * @param lookups metadata of fonts.
 * @param fontName name of the font.
 * @param fontSize size of the font in pixels.
 * @param lineHeight height of a line in pixels.
 * @param text text to shape.
 * @param textAlign alignment of the text.
 * @param maxWidth maximum width of the text. If the text is longer than this, it will be wrapped. Defaults to `Number.POSITIVE_INFINITY`.
 * @param noWrap if true, the text will not be wrapped.
 * @returns a shape object that can be used to render the text.
 */
export function shapeText(
  lookups: Lookups,
  fontName: string,
  fontSize: number,
  lineHeight: number,
  text: string,
  textAlign: TextAlign,
  maxWidth?: number,
  noWrap?: boolean,
): Shape {
  if (noWrap) {
    maxWidth = Number.POSITIVE_INFINITY;
  }
  maxWidth ??= Number.POSITIVE_INFINITY;

  const cached = cache.get(
    JSON.stringify({ fontName, fontSize, lineHeight, maxWidth, text, textAlign }),
  );

  if (cached) {
    return cached;
  }

  const font = lookups.fonts.find((font) => font.name === fontName);
  invariant(font, `Could not find font ${fontName}.`);

  // Alocate text.length sized array.
  const positions: Array<Vec2> = new Array(text.length);
  const sizes: Array<Vec2> = new Array(text.length);

  let positionX = 0;
  let positionY = 0;
  const scale = (1 / font.unitsPerEm) * fontSize;

  // Atlas gap is the gap between glyphs in the atlas.
  const atlasGap = fontSizeToGap(lookups.atlas.fontSize);

  // Padding is the additional space around each glyph.
  const padding = (atlasGap * fontSize) / lookups.atlas.fontSize;

  let longestLineWidth = 0;
  // Index of last character of the last full word that was looped over.
  let lastIndex = 0;

  let j = 0;
  for (let i = 0; i < text.length; i++) {
    // Prevent infinite loops.
    j += 1;
    if (j > 1000) {
      throw new Error(`Infinite loop for text: ${text} with limit ${maxWidth}`);
    }

    const character = text[i]!.charCodeAt(0);
    const glyph = font.glyphs.get(character) ?? font.glyphs.get("□".charCodeAt(0))!;
    const { y, width, height, lsb, rsb } = glyph;
    let kerning = 0;
    if (i > 0 && ENABLE_KERNING) {
      kerning = font.kern(text[i - 1]!.charCodeAt(0), character);
    }
    const charWidth = (lsb + kerning + width + rsb) * scale;

    positions[i] = new Vec2(
      positionX + (lsb + kerning) * scale - padding,
      positionY + (font.capHeight - y - height) * scale - padding,
    );
    positionX += charWidth;
    sizes[i] = new Vec2(width * scale + padding * 2, height * scale + padding * 2);

    // If current word ran out of space, move i back to the last character of the last word and
    // restart positionX.
    if (positionX > maxWidth) {
      positionX = 0;
      positionY += lineHeight;
      i = lastIndex;
      lastIndex = i + 1;
    }

    if (text[i] !== " " && text[i + 1] === " ") {
      lastIndex = i;
    }
  }

  // Text alignment.
  if (text.length > 0) {
    const leftSpace = maxWidth
      ? maxWidth - longestLineWidth - positions.at(-1)!.x - sizes.at(-1)!.x + padding
      : 0;
    if (leftSpace > 0) {
      const offset =
        textAlign === TextAlign.Center
          ? leftSpace / 2
          : textAlign === TextAlign.Right
            ? leftSpace
            : 0;
      for (let i = 0; i < positions.length; i++) {
        const position = positions[i];
        invariant(position, `Could not find position.${text} ${i} ${JSON.stringify(positions)}`);
        positions[i] = new Vec2(position.x + offset, position.y);
      }
    }
  }

  if (longestLineWidth === 0) {
    longestLineWidth = positionX;
  }

  let width = longestLineWidth;
  if (width > 0) {
    width -= padding;
  }

  const capHeightInPixels = (font.capHeight * fontSize) / font.unitsPerEm;
  const height = positionY + capHeightInPixels;

  const shape = {
    // Round up to avoid layout gaps.
    boundingRectangle: {
      height: Math.ceil(height),
      width: Math.ceil(width),
    },
    positions,
    sizes,
  };

  cache.put(fontSize + text, shape);

  return shape;
}
