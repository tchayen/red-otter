import { BaseEditor } from "../components/BaseEditor";

export function ExampleText() {
  return (
    <>
      <BaseEditor
        files={{
          "/index.ts": { code: starterCode },
        }}
      />
    </>
  );
}

const starterCode = /* typescript */ `import {
  AlignSelf,
  Button,
  compose,
  FlexDirection,
  Input,
  invariant,
  JustifyContent,
  layout,
  Overflow,
  paint,
  parseTTF,
  prepareLookups,
  renderFontAtlas,
  Text,
  WebGPURenderer,
  Vec2,
  View,
} from "./dist/index";
import type {
  ViewStyleProps,
  TextStyleProps,
} from "./dist/index";

const colors = {
  gray: [
    "#111111",
    "#191919",
    "#222222",
    "#2A2A2A",
    "#313131",
    "#3A3A3A",
    "#484848",
    "#606060",
    "#6E6E6E",
    "#7B7B7B",
    "#B4B4B4",
    "#EEEEEE",
  ],
} as const;

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
  rectangleBufferSize: 16 * 4096,
  textBufferSize: 16 * 100_000,
};

canvas.width = WIDTH * window.devicePixelRatio;
canvas.height = HEIGHT * window.devicePixelRatio;
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

  const root = new View({
    style: {
      backgroundColor: "#000",
      height: "100%",
      overflow: Overflow.Scroll,
      width: "100%",
    },
    testID: "root",
  });

  const text = new Text("Hello World", {
    lookups,
    style: {
      color: "#fff",
      fontName: "Inter",
      fontSize: 24,
    },
  });
  root.add(text);

  function render() {
    const commandEncoder = device.createCommandEncoder();
    layout(root, lookups, new Vec2(window.innerWidth, window.innerHeight));
    compose(renderer, root);
    paint(renderer, root);
    renderer.render(commandEncoder);
    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(render);
  }

  render();
}

run();
`;
