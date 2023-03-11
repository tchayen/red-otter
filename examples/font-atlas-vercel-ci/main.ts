import { Font, Context } from "red-otter";

async function run() {
  const start = performance.now();

  const font = new Font({
    spacingMetadataJsonURL: "/spacing.json",
    spacingBinaryURL: "/spacing.dat",
    fontAtlasTextureURL: "/font-atlas.png",
    UVBinaryURL: "/uv.dat",
  });
  await font.load();

  console.log(`Loaded font client-side in ${performance.now() - start}ms.`);

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
}

run();
