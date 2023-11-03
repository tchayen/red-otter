import { EventManager } from "./EventManager";
import { UIRenderer } from "./UIRenderer";
import { View } from "./View";
import { applyZIndex } from "./applyZIndex";
import { settings } from "./consts";
import { drawLayoutTree } from "./drawLayoutTree";
import { parseTTF } from "./font/parseTTF";
import { prepareLookups } from "./font/prepareLookups";
import { renderFontAtlas } from "./font/renderFontAtlas";
import { retainedModeGui } from "./retainedModeGui";
import { UserEvent } from "./types";
import { invariant } from "./utils/invariant";

const alphabet =
  "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890 ,.:•-–()[]{}!?@#$%^&*+=/\\|<>`~’'\";_";
const [interTTF, interBoldTTF] = await Promise.all(
  ["/Inter.ttf", "/Inter-SemiBold.ttf"].map(async (url) =>
    fetch(url).then(async (response) => response.arrayBuffer())
  )
);

document.body.setAttribute("style", "margin: 0");

const canvas = document.createElement("canvas");
canvas.width = settings.windowWidth * window.devicePixelRatio;
canvas.height = settings.windowHeight * window.devicePixelRatio;
canvas.setAttribute(
  "style",
  `width: ${settings.windowWidth}px; height: ${settings.windowHeight}px; display: flex;`
);
document.body.append(canvas);
const entry = navigator.gpu;
invariant(entry, "WebGPU is not supported in this browser.");

const context = canvas.getContext("webgpu");
invariant(context, "WebGPU is not supported in this browser.");

const adapter = await entry.requestAdapter();
invariant(adapter, "No GPU found on this system.");

const device = await adapter.requestDevice();

context.configure({
  alphaMode: "opaque",
  device: device,
  format: navigator.gpu.getPreferredCanvasFormat(),
});

const lookups = prepareLookups(
  [
    { buffer: interTTF, name: "Inter", ttf: parseTTF(interTTF) },
    { buffer: interBoldTTF, name: "InterBold", ttf: parseTTF(interBoldTTF) },
  ],
  { alphabet, fontSize: 150 }
);

const fontAtlas = await renderFontAtlas(lookups, { useSDF: true });

const colorTexture = device.createTexture({
  format: "bgra8unorm",
  label: "color",
  sampleCount: settings.sampleCount,
  size: { height: canvas.height, width: canvas.width },
  usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
});
const colorTextureView = colorTexture.createView({ label: "color" });

const ui = new UIRenderer(
  device,
  context,
  colorTextureView,
  settings,
  lookups,
  fontAtlas
);

const events = new EventManager();
const tree = retainedModeGui(ui);
const node = applyZIndex(tree);

function render(): void {
  invariant(context, "WebGPU is not supported in this browser.");

  const commandEncoder = device.createCommandEncoder();

  let event = events.pop();
  while (event) {
    dispatchEvent(tree, event);
    event = events.pop();
  }

  drawLayoutTree(ui, node);
  ui.render(commandEncoder);

  device.queue.submit([commandEncoder.finish()]);

  requestAnimationFrame(render);
}

render();

function dispatchEvent(view: View, event: UserEvent): boolean {
  // First, check children (going reverse for depth).
  if (view.firstChild) {
    for (
      let child = view.lastChild;
      child !== null;
      child = child.prev ?? null
    ) {
      if (dispatchEvent(child as View, event)) {
        return true;
      }
    }
  }

  // If none of the children were hit, check the current node.
  if (hitTest(view, event)) {
    view.handleEvent(event);
    return true;
  }

  return false; // Event was not handled by this branch.
}

function hitTest(view: View, event: UserEvent): boolean {
  return (
    event.x >= view.value.x &&
    event.x <= view.value.x + view.value.width &&
    event.y >= view.value.y &&
    event.y <= view.value.y + view.value.height
  );
}
