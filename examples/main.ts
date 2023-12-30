import { EventManager } from "../src/EventManager";
import { WebGPURenderer } from "../src/renderer/WebGPURenderer";
import { isWindowDefined, settings } from "../src/consts";
import { paint } from "../src/layout/paint";
import { parseTTF } from "../src/font/parseTTF";
import { prepareLookups } from "../src/font/prepareLookups";
import { renderFontAtlas } from "../src/font/renderFontAtlas";
import { ui } from "./ui";
import { invariant } from "../src/utils/invariant";
import { compose } from "../src/layout/compose";
import { UserEventType } from "../src/layout/eventTypes";

const eventManager = new EventManager();

async function initialize() {
  const alphabet =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890 ,.:•-–()[]{}!?@#$%^&*+=/\\|<>`~’'\";_▶";
  const [interTTF, interBoldTTF, comicNeueTTF, jetBrainsMonoTTF] = await Promise.all(
    ["/Inter.ttf", "/Inter-SemiBold.ttf", "/ComicNeue-Bold.ttf", "JetBrainsMono-Regular.ttf"].map(
      (url) => fetch(url).then((response) => response.arrayBuffer()),
    ),
  );
  invariant(interTTF, "Inter.ttf not found.");
  invariant(interBoldTTF, "Inter-SemiBold.ttf not found.");
  invariant(comicNeueTTF, "ComicNeue-Bold.ttf not found.");
  invariant(jetBrainsMonoTTF, "JetBrainsMono-Regular.ttf not found.");

  document.body.setAttribute("style", "margin: 0");

  const canvas = document.createElement("canvas");
  canvas.width = settings.windowWidth * window.devicePixelRatio;
  canvas.height = settings.windowHeight * window.devicePixelRatio;
  canvas.setAttribute(
    "style",
    `width: ${settings.windowWidth}px; height: ${settings.windowHeight}px; display: flex; position: fixed`,
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
      { buffer: comicNeueTTF, name: "ComicNeue", ttf: parseTTF(comicNeueTTF) },
      { buffer: jetBrainsMonoTTF, name: "JetBrainsMono", ttf: parseTTF(jetBrainsMonoTTF) },
    ],
    { alphabet, fontSize: 150 },
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

  const renderer = new WebGPURenderer(
    device,
    context,
    colorTextureView,
    settings,
    lookups,
    fontAtlas,
  );

  const root = ui(renderer);

  // Notify nodes that layout is ready.
  eventManager.dispatchEvent({ bubbles: false, capturable: false, type: UserEventType.Layout });
  eventManager.deliverEvents(root);

  function render(): void {
    invariant(context, "WebGPU is not supported in this browser.");

    const commandEncoder = device.createCommandEncoder();

    eventManager.deliverEvents(root);
    compose(renderer, root);
    paint(renderer, root);

    renderer.render(commandEncoder);
    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
  }

  render();
}

if (isWindowDefined) {
  await initialize();
}
