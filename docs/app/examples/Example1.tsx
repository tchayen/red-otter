"use client";
import { useEffect, useRef } from "react";
import { invariant } from "../../../src/utils/invariant";
import { WebGPURenderer } from "../../../src/renderer/WebGPURenderer";
import { prepareLookups } from "../../../src/font/prepareLookups";
import { renderFontAtlas } from "../../../src/font/renderFontAtlas";
import { parseTTF } from "../../../src/font/parseTTF";
import { Vec4 } from "../../../src/math/Vec4";
import { Vec2 } from "../../../src/math/Vec2";
import { BaseEditor } from "../components/BaseEditor";

export function Example1() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    startExample(ref.current);
  }, []);

  return (
    <>
      <canvas ref={ref} className="aspect-video w-full bg-black" />
      <BaseEditor
        files={{
          "/Vec2.ts": { code: Vec2.toString(), hidden: true },
          "/Vec4.ts": { code: Vec4.toString(), hidden: true },
          "/WebGPURenderer.ts": { code: WebGPURenderer.toString(), hidden: true },
          "/index.ts": {
            code: starterCode,
          },
          "/invariant.ts": { code: invariant.toString(), hidden: true },
          "/parseTTF.ts": { code: parseTTF.toString(), hidden: true },
          "/prepareLookups.ts": { code: prepareLookups.toString(), hidden: true },
          "/renderFontAtlas.ts": { code: renderFontAtlas.toString(), hidden: true },
        }}
      />
    </>
  );
}

const starterCode = `import { WebGPURenderer } from "./WebGPURenderer";
import { prepareLookups } from "./prepareLookups";
import { renderFontAtlas } from "./renderFontAtlas";
import { parseTTF } from "./parseTTF";
import { Vec4 } from "./Vec4";
import { Vec2 } from "./Vec2";
import { invariant } from "./invariant";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const settings = {
  sampleCount: 4,
  windowHeight: canvas.clientHeight,
  windowWidth: canvas.clientWidth,
};

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
canvas.style = "width: 100%; height: 100%;";

async function run() {
  const interTTF = await fetch("/Inter.ttf").then((response) => response.arrayBuffer());

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

async function startExample(canvas: HTMLCanvasElement) {
  const settings = {
    sampleCount: 4,
    windowHeight: canvas.clientHeight,
    windowWidth: canvas.clientWidth,
  };

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const interTTF = await fetch("/Inter.ttf").then((response) => response.arrayBuffer());

  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
