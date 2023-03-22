import { invariant } from "../invariant";
import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { FontAtlasMetadata, Glyph, Spacing } from "./FontAtlas";
import { ATLAS_FONT_SIZE, ATLAS_GAP } from "./atlasConsts";

/**
 * Class that holds font spacing data and font atlas image. For loading font
 * file see `FontAtlas`.
 */
export class Font {
  ok = false;

  private metadata: FontAtlasMetadata | null = null;
  private fontAtlasImage: HTMLImageElement | null = null;
  private readonly glyphs = new Map<number, Glyph>();
  private readonly UVs = new Map<number, Vec4>();
  private readonly files: {
    spacingMetadataJsonURL?: string;
    spacingBinaryURL: string;
    fontAtlasTextureURL: string;
    UVBinaryURL: string;
  } | null = null;

  /**
   * Initialize font by providing URLs to font files or by providing spacing
   * data and font atlas image, which are all already loaded.
   */
  constructor(
    files:
      | {
          spacingMetadataJsonURL: string;
          spacingBinaryURL: string;
          fontAtlasTextureURL: string;
          UVBinaryURL: string;
        }
      | {
          spacingMetadata: FontAtlasMetadata;
          spacingBinaryURL: string;
          fontAtlasTextureURL: string;
          UVBinaryURL: string;
        }
  );
  /**
   * Initialize font by providing URLs to font files or by providing spacing
   * data and font atlas image, which are all already loaded.
   */
  constructor(spacing: Spacing, fontImage: HTMLImageElement);
  constructor(
    options:
      | Spacing
      | {
          spacingMetadataJsonURL: string;
          spacingBinaryURL: string;
          fontAtlasTextureURL: string;
          UVBinaryURL: string;
        }
      | {
          spacingMetadata: FontAtlasMetadata;
          spacingBinaryURL: string;
          fontAtlasTextureURL: string;
          UVBinaryURL: string;
        },

    fontImage?: HTMLImageElement
  ) {
    if ("spacingMetadataJsonURL" in options) {
      this.files = options;
    } else if ("spacingMetadata" in options) {
      this.files = options;
      const metadata = options.spacingMetadata;
      validateMetadata(metadata);
      this.metadata = metadata;
    } else {
      const spacing = options;
      const { glyphs, uvs, ...metadata } = spacing;
      this.metadata = metadata;

      invariant(fontImage, "Missing font image.");
      this.fontAtlasImage = fontImage;

      const offsets = new Map(spacing.columns.map((c, i) => [c, i]));
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

      const rowSize = spacing.columns.length;
      for (let i = 0; i < glyphs.length / rowSize; i++) {
        const code = glyphs[i * rowSize + idOffset];
        this.glyphs.set(code, {
          id: code,
          character: String.fromCharCode(code),
          x: glyphs[i * rowSize + xOffset],
          y: glyphs[i * rowSize + yOffset],
          width: glyphs[i * rowSize + widthOffset],
          height: glyphs[i * rowSize + heightOffset],
          lsb: glyphs[i * rowSize + lsbOffset],
          rsb: glyphs[i * rowSize + rsbOffset],
        });

        this.UVs.set(
          code,
          new Vec4(
            uvs[i * 4 + 0],
            uvs[i * 4 + 1],
            uvs[i * 4 + 2],
            uvs[i * 4 + 3]
          )
        );
      }

      this.ok = true;
    }
  }

  /**
   * Load font data from provided URLs. Not needed if font was initialized with
   * preloaded data.
   */
  async load(): Promise<void> {
    const start = performance.now();
    invariant(this.files, "Missing files.");

    const [metadata, spacing, uv, fontImage] = await Promise.all([
      this.files.spacingMetadataJsonURL
        ? fetch(this.files.spacingMetadataJsonURL).then(async (response) => {
            console.debug(`Got spacingMetadataJsonURL`);
            return response.json();
          })
        : undefined,
      fetch(this.files.spacingBinaryURL).then(async (response) => {
        console.debug(`Got spacingBinaryURL`);
        return response.arrayBuffer();
      }),
      fetch(this.files.UVBinaryURL).then(async (response) => {
        console.debug(`Got UVBinaryURL`);
        return response.arrayBuffer();
      }),
      this.loadFontImageAsync(),
    ]);

    if (!this.metadata) {
      validateMetadata(metadata);
      this.metadata = metadata;
    }
    this.fontAtlasImage = fontImage;

    const spacingData = new Int16Array(spacing);
    const uvData = new Float32Array(uv);

    const offsets = new Map(this.metadata.columns.map((c, i) => [c, i]));
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

    const rowSize = this.metadata.columns.length;
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
      `Loaded glyph binary data in ${(performance.now() - start).toFixed(2)}ms.`
    );

    this.ok = true;
  }

  /**
   * Calculates shape information for a given text string and font size.
   */
  getTextShape(
    text: string,
    fontSize: number
  ): {
    boundingRectangle: { width: number; height: number };
    positions: Vec2[];
    sizes: Vec2[];
  } {
    invariant(this.ok, "Font is not yet loaded.");

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
    const height =
      (this.metadata.capHeight * fontSize) / this.metadata.unitsPerEm;

    return {
      positions,
      sizes,
      boundingRectangle: {
        width: Math.ceil(width),
        height: Math.ceil(height),
      },
    };
  }

  /**
   * Returns a map of all glyphs in the font.
   */
  getGlyphs(): Map<number, Glyph> {
    invariant(this.ok, "Font is not yet loaded.");
    return this.glyphs;
  }

  /**
   * Returns texture coordinates for a given character code.
   */
  getUV(code: number): Vec4 | null {
    invariant(this.ok, "Font is not yet loaded.");
    return this.UVs.get(code) || null;
  }

  /**
   * Returns metadata for the font.
   */
  getMetadata(): FontAtlasMetadata | null {
    invariant(this.ok, "Font is not yet loaded.");
    return this.metadata;
  }

  /**
   * Returns the font image.
   */
  getFontImage(): HTMLImageElement | null {
    invariant(this.ok, "Font is not yet loaded.");
    return this.fontAtlasImage;
  }

  private async loadFontImageAsync(): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const start = performance.now();
      const image = new Image();

      image.onload = (): void => {
        invariant(this.files, "Missing files.");
        console.debug(
          `Loaded texture ${this.files.fontAtlasTextureURL} in ${(
            performance.now() - start
          ).toFixed(2)}ms.`
        );

        resolve(image);
      };

      invariant(this.files, "Missing files.");
      image.crossOrigin = "anonymous";
      image.src = this.files.fontAtlasTextureURL;
    });
  }
}

/**
 * Used to validate received metadata from the server.
 */
function validateMetadata(
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
