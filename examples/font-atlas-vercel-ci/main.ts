import { Font, Context, Vec4, Vec2 } from "../../src";

async function run(): Promise<void> {
  const start = performance.now();

  const font = new Font({
    spacingMetadataJsonURL: "/spacing.json",
    spacingBinaryURL: "/spacing.dat",
    fontAtlasTextureURL: "/font-atlas.png",
    UVBinaryURL: "/uv.dat",
  });
  await font.load();

  console.debug(`Loaded font client-side in ${performance.now() - start}ms.`);

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  canvas.setAttribute("style", `width: ${800}px; height: ${600}px;`);

  const div = document.getElementById("app");
  if (!div) {
    throw new Error("Missing #app div.");
  }

  div.appendChild(canvas);

  const context = new Context(canvas, font);
  context.clear();
  context.text("Hello World!", new Vec2(100, 100), 32, new Vec4(1, 1, 1, 1));
  context.flush();
}

run();
