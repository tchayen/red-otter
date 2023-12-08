"use client";
import { useEffect, useRef } from "react";
import { invariant } from "../../../src/utils/invariant";
import { ScrollableRenderer } from "../../../src/renderer/WebGPURenderer";
import { prepareLookups } from "../../../src/font/prepareLookups";
import { renderFontAtlas } from "../../../src/font/renderFontAtlas";
import { parseTTF } from "../../../src/font/parseTTF";
import { Vec4 } from "../../../src/math/Vec4";
import { Vec2 } from "../../../src/math/Vec2";

export function Example1() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    startExample(ref.current);
  }, []);

  return <canvas ref={ref} className="aspect-video w-full bg-black" />;
}

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

  const renderer = new ScrollableRenderer(
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
