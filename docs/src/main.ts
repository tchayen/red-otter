import { toURLSafe, invariant } from "../utils";
import { Font } from "../../src";
import { fixtures } from "./examples";

import "./main.css";
import "./github-dark.css";

const rendered = new Set<string>();

function checkVisible(element: HTMLElement): boolean {
  const rectangle = element.getBoundingClientRect();
  const viewHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight
  );
  return !(rectangle.bottom < 0 || rectangle.top - viewHeight >= 0);
}

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

      const run = async (): Promise<void> => {
        Promise.resolve(await callback(canvas, font));
        console.debug(`Rendered ${title}.`);
      };

      if (isMobile) {
        button?.addEventListener("click", () => {
          run();
          button.remove();
        });
      } else {
        window.addEventListener("scroll", () => {
          if (checkVisible(canvas) && !rendered.has(callbackName)) {
            run();
            rendered.add(callbackName);

            if (button) {
              button.remove();
            }
          }
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
}

mainAsync();
