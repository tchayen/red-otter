import { toURLSafe, invariant } from "../utils";
import { Context, Font } from "../../packages/red-otter";
import { fixtures } from "./examples";

async function mainAsync(): Promise<void> {
  const inter = new Font(
    "/spacing.json",
    "/spacing.dat",
    "/uv.dat",
    "/font-atlas.png"
  );
  await inter.load();

  for (const { callback, title } of fixtures) {
    const canvas = document.getElementById(`${toURLSafe(title)}-canvas`);
    invariant(canvas instanceof HTMLCanvasElement, "Canvas not found.");

    const context = new Context(canvas, inter);
    context.clear();
    context.setProjection(
      0,
      0,
      context.getCanvas().clientWidth,
      context.getCanvas().clientHeight
    );
    const layout = callback(context, inter);
    layout.render();
    context.flush();
  }
}

mainAsync();
