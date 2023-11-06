import { Vec2 } from "../math/Vec2";
import { LRUCache } from "../utils/LRUCache";
import { invariant } from "../utils/invariant";
import { fontSizeToGap } from "./renderFontAtlas";
import { Lookups } from "./types";

export const ENABLE_KERNING = true;

const cache = new LRUCache<string, Shape>(512);

export type Shape = {
  boundingRectangle: { height: number; width: number };
  positions: Vec2[];
  sizes: Vec2[];
};

/*
 * TODO:
 * Maybe make lookups, text, fontSize and fontName back into regular arguments and only make
 * options for optional ones?
 */
type ShapeTextOptions = {
  fontName: string;
  fontSize: number;
  lineHeight?: number;
  lookups: Lookups;
  maxWidth?: number;
  text: string;
};

/**
 * @param options parameters for calculating the shape of the text.
 * @returns a shape object that can be used to render the text.
 */
export function shapeText(options: ShapeTextOptions): Shape {
  const { lookups, text, fontSize, fontName, lineHeight, maxWidth } = options;
  const cached = cache.get(JSON.stringify({ fontName, fontSize, lineHeight, maxWidth, text }));

  if (cached) {
    return cached;
  }

  const font = lookups.fonts.find((font) => font.name === fontName);
  invariant(font, `Could not find font ${fontName}.`);

  // Alocate text.length sized array.
  const positions: Vec2[] = new Array(text.length);
  const sizes: Vec2[] = new Array(text.length);

  let positionX = 0;
  let positionY = 0;
  const scale = (1 / font.unitsPerEm) * fontSize;
  const atlasGap = fontSizeToGap(lookups.atlas.fontSize);
  const padding = (atlasGap * fontSize) / lookups.atlas.fontSize;

  let wordStartIndex = 0;
  let longestLineWidth = 0;

  for (let i = 0; i < text.length; i++) {
    const character = text[i].charCodeAt(0);
    const glyph = font.glyphs.get(character) ?? font.glyphs.get("□".charCodeAt(0))!;

    const { y, width, height, lsb, rsb } = glyph;

    let kerning = 0;
    if (ENABLE_KERNING && text[i - 1] && text[i]) {
      kerning = font.kern(text[i - 1].charCodeAt(0), text[i].charCodeAt(0));
    }

    const nextPosition = new Vec2(
      positionX + (lsb + kerning) * scale - padding,
      positionY + (font.capHeight - y - height) * scale - padding
    );

    positions[i] = nextPosition;

    sizes[i] = new Vec2(width * scale + padding * 2, height * scale + padding * 2);

    positionX += (lsb + kerning + width + rsb) * scale;

    if (maxWidth && nextPosition.x + width * scale > maxWidth && text[i] === " ") {
      // Check backtracking is possible (i.e. the length of the word is less than maxWidth).
      const wordLength = positionX - positions[wordStartIndex].x;
      if (wordLength > maxWidth) {
        continue;
      }

      // We exceeded the maxWidth, backtrack. Move i back to the start of the current word.
      i = wordStartIndex - 1;

      positionY += lineHeight ?? 20;
      positionX = 0;
      longestLineWidth = Math.max(longestLineWidth, positions[i + 1].x);
    }

    if (text[i] === "\n") {
      positionY += lineHeight ?? 20;
      positionX = 0;
      longestLineWidth = Math.max(longestLineWidth, positions[i + 1]?.x);
    }

    if (text[i] === " " || text[i] === "\n") {
      // Update the start of the next word.
      wordStartIndex = i + 1;
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
    // Round up avoid layout gaps.
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
