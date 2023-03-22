import { FontAtlas, TTF } from "../../../src";

async function run(): Promise<void> {
  const start = performance.now();

  const fontFace = new FontFace("Inter", 'url("/inter.ttf")');
  await fontFace.load();
  document.fonts.add(fontFace);

  const font = await fetch("/inter.ttf");
  const buffer = await font.arrayBuffer();

  const ttf = new TTF(buffer);
  if (!ttf.ok) {
    throw new Error("Failed to parse font file.");
  }

  const atlas = new FontAtlas(ttf);
  const { canvas, spacing } = atlas.render();

  const div = document.getElementById("app");
  if (!div) {
    throw new Error("Could not find #app element.");
  }

  const span = document.createElement("span");
  span.setAttribute("style", "display: none");
  span.innerText = JSON.stringify(spacing);

  div.appendChild(canvas);
  div.appendChild(span);

  console.debug(
    `Font atlas generated in ${(performance.now() - start).toFixed(2)}ms.`
  );
}

run();
