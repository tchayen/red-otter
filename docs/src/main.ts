import { toURLSafe, invariant } from "../utils";
import { Context, Font } from "../../packages/red-otter";
import { fixtures } from "./examples";

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
      context.setProjection(
        0,
        0,
        context.getCanvas().clientWidth,
        context.getCanvas().clientHeight
      );
      const layout = callback(context, font);
      layout.render();
      context.flush();
    }
  } catch (error) {
    console.error(error);
  }
}

mainAsync();
