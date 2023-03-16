import { toURLSafe, invariant } from "../utils";
import { Context, Font } from "red-otter";
import { fixtures } from "./examples";

import "./main.css";
import "./github-dark.css";

async function mainAsync(): Promise<void> {
  try {
    const font = new Font({
      spacingMetadataJsonURL: "/spacing.json",
      spacingBinaryURL: "/spacing.dat",
      UVBinaryURL: "/uv.dat",
      fontAtlasTextureURL: "/font-atlas.png",
    });
    await font.load();

    for (const { callback, title } of fixtures) {
      const canvas = document.getElementById(`${toURLSafe(title)}-canvas`);
      invariant(canvas instanceof HTMLCanvasElement, "Canvas not found.");

      const context = new Context(canvas, font);
      context.clear();

      const start = performance.now();
      const layout = callback(context, font);
      layout.render();
      const end = performance.now();
      context.flush();

      console.debug(`Rendered ${title} in ${(end - start).toFixed(2)}ms.`);
    }
  } catch (error) {
    console.error(error);
  }
}

mainAsync();
