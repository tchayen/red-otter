import { invariant } from "../invariant";
import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { Glyph } from "./getGlyphQuads";
import { FontAtlasMetadata, validateMetadata } from "./prepareAtlas";
import { ATLAS_FONT_SIZE, ATLAS_GAP } from "./atlasConsts";

export class Font {
  private metadata: FontAtlasMetadata | null = null;
  private glyphs = new Map<number, Glyph>();
  private UVs = new Map<number, Vec4>();
  private fontAtlasImage: HTMLImageElement | null = null;

  constructor(
    private spacingMetadataJsonURL: string,
    private spacingBinaryURL: string,
    private UVBinaryURL: string,
    private fontAtlasTextureURL: string
  ) {}

  private async loadFontImageAsync(): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const start = performance.now();
      const image = new Image();
      image.onload = () => {
        console.debug(
          `Loaded texture ${this.fontAtlasTextureURL} in ${(
            performance.now() - start
          ).toFixed(2)}ms.`
        );

        resolve(image);
      };
      image.src = this.fontAtlasTextureURL;
    });
  }

  load(): Promise<void> {
    const start = performance.now();

    return Promise.all([
      fetch(this.spacingMetadataJsonURL).then((response) => response.json()),
      fetch(this.spacingBinaryURL).then((response) => response.arrayBuffer()),
      fetch(this.UVBinaryURL).then((response) => response.arrayBuffer()),
      this.loadFontImageAsync(),
    ]).then(([metadata, spacing, uv, fontImage]) => {
      validateMetadata(metadata);
      this.metadata = metadata;

      this.fontAtlasImage = fontImage;

      const spacingData = new Int16Array(spacing);
      const uvData = new Float32Array(uv);
      const offsets = new Map(metadata.columns.map((c, i) => [c, i]));

      const idOffset = offsets.get("id");
      const xOffset = offsets.get("x");
      const yOffset = offsets.get("y");
      const widthOffset = offsets.get("width");
      const heightOffset = offsets.get("height");
      const lsbOffset = offsets.get("lsb");
      const rsbOffset = offsets.get("rsb");

      invariant(idOffset !== undefined, "Missing id column.");
      invariant(xOffset !== undefined, "Missing x column.");
      invariant(yOffset !== undefined, "Missing y column.");
      invariant(widthOffset !== undefined, "Missing width column.");
      invariant(heightOffset !== undefined, "Missing height column.");
      invariant(lsbOffset !== undefined, "Missing lsb column.");
      invariant(rsbOffset !== undefined, "Missing rsb column.");

      const rowSize = metadata.columns.length;
      for (let i = 0; i < spacingData.length / rowSize; i++) {
        const code = spacingData[i * rowSize + idOffset];
        this.glyphs.set(code, {
          id: code,
          character: String.fromCharCode(code),
          x: spacingData[i * rowSize + xOffset],
          y: spacingData[i * rowSize + yOffset],
          width: spacingData[i * rowSize + widthOffset],
          height: spacingData[i * rowSize + heightOffset],
          lsb: spacingData[i * rowSize + lsbOffset],
          rsb: spacingData[i * rowSize + rsbOffset],
        });

        this.UVs.set(
          code,
          new Vec4(
            uvData[i * 4 + 0],
            uvData[i * 4 + 1],
            uvData[i * 4 + 2],
            uvData[i * 4 + 3]
          )
        );
      }

      console.debug(
        `Loaded glyph binary data in ${(performance.now() - start).toFixed(
          2
        )}ms.`
      );
    });
  }

  getTextLayout(
    text: string,
    fontSize: number
  ): {
    boundingRectangle: { width: number; height: number };
    positions: Vec2[];
    sizes: Vec2[];
  } {
    if (text.length === 0) {
      return {
        positions: [],
        sizes: [],
        boundingRectangle: { width: 0, height: 0 },
      };
    }

    invariant(this.metadata, "Font metadata not loaded yet.");

    const positions: Vec2[] = [];
    const sizes: Vec2[] = [];

    let positionX = 0;
    const scale = (1 / this.metadata.unitsPerEm) * fontSize;
    const padding = (ATLAS_GAP * fontSize) / ATLAS_FONT_SIZE;

    for (let i = 0; i < text.length; i++) {
      const glyph = this.glyphs.get(text[i].charCodeAt(0));
      invariant(glyph, `Glyph not found for character ${text[i]}`);

      const { y, width, height, lsb, rsb } = glyph;

      // I used to add `x` to position, but it introduces offsets that actually
      // look bad. For example `j` has a big negative x offset, so it overlaps
      // with the previous letter. Without `x` spacing between letters seems much more even.

      positions.push(
        new Vec2(
          positionX + (i !== 0 ? lsb : 0) * scale - padding,
          (this.metadata.capHeight - y - height) * scale - padding
        )
      );

      // 2 * padding is to account for padding from both sides of the glyph.
      sizes.push(
        new Vec2(width * scale + padding * 2, height * scale + padding * 2)
      );

      positionX += ((i !== 0 ? lsb : 0) + width + rsb) * scale;
    }

    // Skip the last padding.
    const width =
      positions[positions.length - 1].x + sizes[sizes.length - 1].x - padding;

    return {
      positions,
      sizes,
      boundingRectangle: {
        width,
        height: (this.metadata.capHeight * fontSize) / this.metadata.unitsPerEm,
      },
    };
  }

  getGlyphs(): Map<number, Glyph> {
    return this.glyphs;
  }

  getUV(code: number): Vec4 | null {
    return this.UVs.get(code) || null;
  }

  getMetadata(): FontAtlasMetadata | null {
    return this.metadata;
  }

  getFontImage(): HTMLImageElement | null {
    return this.fontAtlasImage;
  }
}
