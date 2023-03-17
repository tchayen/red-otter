import { toURLSafe, invariant } from "../utils";
import { Context, Font } from "red-otter";
import { fixtures } from "./examples";

import "./main.css";
import "./github-dark.css";

async function mainAsync(): Promise<void> {
  const isMobile = window.innerWidth < 768;

  try {
    const font = new Font({
      spacingMetadataJsonURL: "/spacing.json",
      spacingBinaryURL: "/spacing.dat",
      UVBinaryURL: "/uv.dat",
      fontAtlasTextureURL: "/font-atlas.png",
    });
    await font.load();

    for (const { callback, title } of fixtures) {
      const callbackName = toURLSafe(title);
      const canvas = document.getElementById(`${callbackName}-canvas`);
      invariant(canvas instanceof HTMLCanvasElement, "Canvas not found.");

      const button = document.getElementById(`${callbackName}-button`);
      invariant(button instanceof HTMLButtonElement, "Button not found.");

      const run = () => {
        const context = new Context(canvas, font);
        context.clear();

        const start = performance.now();
        const layout = callback(context, font);
        layout.render();
        const end = performance.now();
        context.flush();

        console.debug(`Rendered ${title} in ${(end - start).toFixed(2)}ms.`);

        button.remove();
      };

      if (isMobile) {
        button.addEventListener("click", run);
      } else {
        run();
      }
    }
  } catch (error) {
    console.error(error);
  }
}

mainAsync();
