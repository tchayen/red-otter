import { EventManager } from "./EventManager";
import { UIRenderer } from "./UIRenderer";
import { applyZIndex } from "./applyZIndex";
import { settings } from "./consts";
import { draw } from "./ui/draw";
import { parseTTF } from "./font/parseTTF";
import { prepareLookups } from "./font/prepareLookups";
import { renderFontAtlas } from "./font/renderFontAtlas";
import { ui } from "./ui";
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
  `width: ${settings.windowWidth}px; height: ${settings.windowHeight}px; display: flex; position: fixed`
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

const renderer = new UIRenderer(device, context, colorTextureView, settings, lookups, fontAtlas);

export const events = new EventManager();
const root = ui(renderer);
const node = applyZIndex(root);

function render(): void {
  invariant(context, "WebGPU is not supported in this browser.");

  const commandEncoder = device.createCommandEncoder();

  events.deliverEvents();

  draw(renderer, node);
  renderer.render(commandEncoder);
  device.queue.submit([commandEncoder.finish()]);

  requestAnimationFrame(render);
}

render();
