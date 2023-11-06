import { invariant } from "../utils/invariant";
import { toSDF } from "./toSDF";
import { Lookups } from "./types";

const DEBUG_SKIP_SDF = false;
const DEBUG_FONT_ATLAS_SHOW_GLYPH_BACKGROUNDS = false;

/**
 * @param lookups see prepareLookups.ts.
 * @param options optional parameters like alphabet or whether SDF should be
 * used to render the atlas.
 * @returns an image bitmap of the font atlas.
 */
export async function renderFontAtlas(
  lookups: Lookups,
  options?: {
    alphabet?: string;
    useSDF?: boolean;
  }
): Promise<ImageBitmap> {
  const fontSize = lookups.atlas.fontSize;
  const atlasRadius = options?.useSDF ? fontSizeToGap(fontSize) : 0;
  const atlasGap = atlasRadius / 2;

  const canvas = document.createElement("canvas");
  canvas.width = lookups.atlas.width;
  canvas.height = lookups.atlas.height;

  const context = canvas.getContext("2d");
  invariant(context, "Could not get 2D context.");

  if (DEBUG_SKIP_SDF) {
    context.fillStyle = "rgba(0, 0, 0, 1)";
    context.fillRect(0, 0, lookups.atlas.width, lookups.atlas.height);
  }

  let start = 0;
  for (const font of lookups.fonts) {
    const scale = (1 / font.unitsPerEm) * fontSize;

    const fontName = `${font.name}-atlas`;
    const fontFace = new FontFace(fontName, font.buffer);
    await fontFace.load();
    document.fonts.add(fontFace);
    context.font = `${fontSize}px ${fontName}`;

    const glyphs = [...font.glyphs.values()];
    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i];
      const position = lookups.atlas.positions[start + i];
      const size = lookups.atlas.sizes[start + i];

      if (DEBUG_FONT_ATLAS_SHOW_GLYPH_BACKGROUNDS) {
        context.fillStyle = "rgba(255, 0, 255, 0.3)";
        context.fillRect(position.x, position.y, size.x, size.y);
      }

      context.fillStyle = "rgba(255, 255, 255, 1)";
      context.fillText(
        String.fromCharCode(glyph.id),
        // Additionally offset by glyph (X, Y).
        position.x - glyph.x * scale + atlasGap,
        position.y + size.y + glyph.y * scale - atlasGap
      );
    }
    start += glyphs.length;
  }

  if (!DEBUG_SKIP_SDF && options?.useSDF) {
    const imageData = context.getImageData(0, 0, lookups.atlas.width, lookups.atlas.height);
    const sdfData = toSDF(imageData, lookups.atlas.width, lookups.atlas.height, atlasRadius);
    context.putImageData(sdfData, 0, 0);
  }

  if (DEBUG_SKIP_SDF) {
    document.body.append(canvas);
  }

  const bitmap = await createImageBitmap(canvas);
  canvas.remove();

  return bitmap;
}

export function fontSizeToGap(fontSize: number): number {
  return Math.round(fontSize / 6);
}
