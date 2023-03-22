import { toURLSafe } from "../utils";
import { Font } from "../../src";
import { invariant } from "../../src/invariant";
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

      const runButton = document.getElementById(`${callbackName}-button`);
      const copyButton = document.getElementById(`${callbackName}-copy`);

      runButton?.addEventListener("click", () => {
        run();
        runButton.remove();
      });

      copyButton?.addEventListener("click", () => {
        const code = document.getElementById(`${callbackName}-code`);
        const pre = code?.querySelector("pre");

        navigator.clipboard.writeText(pre?.innerText ?? "");
      });

      const run = async (): Promise<void> => {
        Promise.resolve(await callback(canvas, font));
        console.debug(`Rendered ${title}.`);
      };

      // I am observing iPhone crashes if too many canvases are created in short
      // interval. I experimented with some debouncing but even with 1s delays
      // scrolling the page is enough to crash the tab. So on-scroll-activation
      // will be enabled only for wider screens, which are presumably not
      // phones.
      if (!isMobile) {
        window.addEventListener("scroll", () => {
          if (checkVisible(canvas) && !rendered.has(callbackName)) {
            run();
            rendered.add(callbackName);

            if (runButton) {
              runButton.remove();
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
