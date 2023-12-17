import { BaseEditor } from "../components/BaseEditor";

export function Example1() {
  return (
    <>
      <BaseEditor
        files={{
          "/index.ts": { code: starterCode },
          "/red-otter.js": { code: "" },
        }}
      />
    </>
  );
}

const starterCode = `import { invariant, renderFontAtlas, Vec2, Vec4, parseTTF, prepareLookups, WebGPURenderer } from "./dist";

document.body.style.margin = "0";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const parent = canvas.parentElement;
invariant(parent, "No parent element found.");
const WIDTH = parent.clientWidth;
const HEIGHT = parent.clientHeight;


const settings = {
  sampleCount: 4,
  windowHeight: HEIGHT,
  windowWidth: WIDTH,
};

canvas.width = WIDTH;
canvas.height = HEIGHT;
canvas.setAttribute("style", "width: 100%; height: 100%;");

async function run() {
  const interTTF = await fetch("https://tchayen.com/assets/Inter.ttf").then((response) => response.arrayBuffer());

  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const entry = navigator.gpu;
  console.log(invariant);
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

  const lookups = prepareLookups([{ buffer: interTTF, name: "Inter", ttf: parseTTF(interTTF) }], {
    alphabet,
    fontSize: 150,
  });

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

  renderer.rectangle(
    new Vec4(1, 0, 1, 1),
    new Vec2(50, 50),
    new Vec2(100, 100),
    new Vec4(10, 10, 10, 10),
    new Vec4(0, 0, 0, 0),
    new Vec4(0, 0, 0, 0),
    new Vec2(0, 0),
    new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
    new Vec4(0, 0, 0, 0),
  );

  const commandEncoder = device.createCommandEncoder();
  renderer.render(commandEncoder);
  device.queue.submit([commandEncoder.finish()]);
}

run();
`;
