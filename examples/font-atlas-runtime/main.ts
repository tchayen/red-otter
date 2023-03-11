import { TTF, FontAtlas, Font, Context } from "../../packages/red-otter";

async function loadFont() {
  const start = performance.now();
  // Add font to the document so we will use browser to rasterize the font.
  const fontFace = new FontFace("Inter", 'url("/inter.ttf")');
  await fontFace.load();
  document.fonts.add(fontFace);

  // Download font file for parsing.
  const file = await fetch("/inter.ttf");
  const buffer = await file.arrayBuffer();

  const ttf = new TTF(buffer);
  if (!ttf.ok) {
    throw new Error("Failed to parse font file.");
  }

  // Render font atlas.
  const atlas = new FontAtlas(ttf);
  const { canvas, spacing } = atlas.render();

  const image = new Image();
  image.src = canvas.toDataURL();

  const font = new Font(spacing, image);
  console.log(`Loaded font client-side in ${performance.now() - start}ms.`);
  return font;
}

loadFont().then((font) => {
  const canvas = document.createElement("canvas");
  canvas.width = 800 * window.devicePixelRatio;
  canvas.height = 600 * window.devicePixelRatio;
  canvas.setAttribute("style", `width: ${800}px; height: ${600}px;`);

  const div = document.getElementById("app");
  if (!div) {
    throw new Error("Missing #app div.");
  }

  div.appendChild(canvas);

  const context = new Context(canvas, font);

  context.clear();
  context.setProjection(
    0,
    0,
    context.getCanvas().clientWidth,
    context.getCanvas().clientHeight
  );

  context.text("Hello World!", 100, 100, 32, "#fff");

  context.flush();
});
