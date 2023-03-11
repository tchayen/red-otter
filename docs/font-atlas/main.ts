import { TTF, FontAtlas } from "../../packages/red-otter";

// TODO: why ~ is not present in the font?
// const punctuationAndSymbols = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}€";
// const numbers = "0123456789";
// const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// const lowercase = "abcdefghijklmnopqrstuvwxyz";
// const dashes = "‐‑‒–—―";
// const quotes = "‘’‚‛“”„‟";
// const alphabet = `${punctuationAndSymbols}${numbers}${uppercase}${lowercase}${dashes}${quotes}`;

/**
 * Used in font-atlas/index.html for displaying font atlas.
 */
(async (): Promise<void> => {
  const start = performance.now();

  const fontFace = new FontFace("Inter", 'url("/inter-hinted-3-19.ttf")');
  await fontFace.load();
  // @ts-expect-error Property 'add' does not exist on type 'FontFaceSet'.ts(2339)
  document.fonts.add(fontFace);

  const font = await fetch("/inter-hinted-3-19.ttf");
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

  console.log(
    `Font atlas generated in ${(performance.now() - start).toFixed(2)}ms.`
  );
})();
