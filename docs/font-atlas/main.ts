import {
  parseTTF,
  TTF,
  prepareAtlas,
  getGlyphQuads,
  toSDF,
  ATLAS_FONT_SIZE,
  ATLAS_GAP,
  ATLAS_RADIUS,
} from "../../packages/red-otter";

const DEBUG_FONT_ATLAS_PRINT_GLYPHS_AS_JSON = false;
const DEBUG_FONT_ATLAS_SHOW_GLYPH_BACKGROUNDS = false;

// TODO: why ~ is not present in the font?
// const punctuationAndSymbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}€";
// const numbers = "0123456789";
// const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// const lowercase = "abcdefghijklmnopqrstuvwxyz";
// const dashes = "‐‑‒–—―";
// const quotes = "‘’‚‛“”„‟";
// const alphabet = `${punctuationAndSymbols}${numbers}${uppercase}${lowercase}${dashes}${quotes}`;

/**
 * Creates HTML canvas and appends it to the DOM.
 */
function setUpCanvas(width?: number, height?: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");

  if (width && height) {
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.setAttribute("style", `width: ${width}px; height: ${height}px;`);
  } else {
    canvas.setAttribute("style", `width: 100vw; height: 100vh;`);
  }

  const div = document.getElementById("app");
  invariant(div, "Could not find #app element.");

  div.appendChild(canvas);

  return canvas;
}

// Copied over from lib package.
export function invariant(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(message);
  }
}

/**
 * Loads and parses TTF font file.
 */
async function getFontAsync(): Promise<TTF> {
  const fontFace = new FontFace(
    "Inter",
    'url("https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19")'
  );
  await fontFace.load();
  // @ts-expect-error Property 'add' does not exist on type 'FontFaceSet'.ts(2339)
  document.fonts.add(fontFace);

  const font = await fetch("/inter-hinted-3-19.ttf");
  const buffer = await font.arrayBuffer();
  return parseTTF(buffer);
}

type Vec2 = { x: number; y: number };

/**
 * Used in font-atlas/index.html for displaying font atlas.
 */
(async (): Promise<void> => {
  const ttf = await getFontAsync();

  const scale = (1 / ttf.head.unitsPerEm) * ATLAS_FONT_SIZE;

  const glyphs = getGlyphQuads(ttf);
  const atlas = prepareAtlas(glyphs, scale);

  const canvas = setUpCanvas(atlas.width, atlas.height);
  const context = canvas.getContext("2d");
  invariant(context, "Could not get 2D context.");

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.font = `${ATLAS_FONT_SIZE}px Inter`;

  const uvs: { position: Vec2; size: Vec2 }[] = [];

  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
    const position = atlas.positions[i];
    const size = atlas.sizes[i];

    const x = position.x;
    const y = position.y;
    const w = size.x;
    const h = size.y;

    if (DEBUG_FONT_ATLAS_SHOW_GLYPH_BACKGROUNDS) {
      context.fillStyle = "rgba(255, 0, 255, 0.3)";
      context.fillRect(x, y, w, h);
    }

    uvs.push({
      position: { x: x / atlas.width, y: y / atlas.height },
      size: { x: w / atlas.width, y: h / atlas.height },
    });

    context.fillStyle = "rgba(255, 255, 255, 1)";
    context.fillText(
      String.fromCharCode(glyph.id),
      // Additionally offset by glyph (X, Y).
      x - glyph.x * scale + ATLAS_GAP,
      y + size.y + glyph.y * scale - ATLAS_GAP
    );
  }

  const imageData = context.getImageData(0, 0, atlas.width, atlas.height);

  const sdfData = toSDF(imageData, atlas.width, atlas.height, ATLAS_RADIUS);

  context.putImageData(sdfData, 0, 0);

  const spacingData = {
    unitsPerEm: ttf.head.unitsPerEm,
    capHeight: ttf.hhea.ascender + ttf.hhea.descender,
    ascender: ttf.hhea.ascender,
    columns: ["id", "x", "y", "width", "height", "lsb", "rsb"],
    glyphs: glyphs.flatMap((g) => [
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
    const mapped = glyphs.map((g) => ({
      id: g.id,
      x: g.x,
      y: g.y,
      width: g.width,
      height: g.height,
      lsb: g.lsb,
      rsb: g.rsb,
    }));

    const spacingJson = JSON.stringify(mapped, null, 2);
    console.log(spacingJson);
  }

  const div = document.getElementById("app");
  invariant(div, "Could not find #app element.");

  const span = document.createElement("span");
  span.setAttribute("style", "display: none");
  div.appendChild(span);
  span.innerText = JSON.stringify(spacingData);
})();
