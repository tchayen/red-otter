import { invariant } from "../utils/invariant";
import type { Vec2 } from "../math/Vec2";
import type { Vec4 } from "../math/Vec4";
import type { Lookups } from "../font/types";
import type { Shape } from "../font/shapeText";
import { shapeText } from "../font/shapeText";
import type { Settings } from "../consts";
import { createTextureFromImageBitmap } from "../utils/createTextureFromBitmap";
import type { Renderer } from "./Renderer";
import { defaultTextStyleProps, type TextAlign } from "../layout/styling";

const enum DrawingMode {
  Rectangles,
  Text,
  None,
}

export class WebGPURenderer implements Renderer {
  private drawingMode = DrawingMode.None;
  private drawingIndices: Array<number> = [];

  private rectangleData: Float32Array;
  private rectangleCount = 0;

  private glyphData: Float32Array;
  private glyphCount = 0;

  private readonly vertexBuffer: GPUBuffer;
  private readonly rectangleBuffer: GPUBuffer;
  private readonly textBuffer: GPUBuffer;

  private readonly textBindGroupLayout: GPUBindGroupLayout;

  private readonly rectangleBindGroup: GPUBindGroup;
  private readonly textBindGroup: GPUBindGroup;

  private readonly rectanglePipeline: GPURenderPipeline;
  private readonly textPipeline: GPURenderPipeline;

  private readonly sampler: GPUSampler;

  constructor(
    private readonly device: GPUDevice,
    private readonly context: GPUCanvasContext,
    private readonly colorTextureView: GPUTextureView,
    private readonly settings: Settings,
    public readonly fontLookups: Lookups,
    fontAtlasTexture: ImageBitmap,
  ) {
    this.rectangleData = new Float32Array(settings.rectangleBufferSize);
    this.glyphData = new Float32Array(settings.textBufferSize);

    const rectangleShader = /* wgsl */ `
      struct VertexInput {
        @location(0) position: vec2f,
        @builtin(instance_index) instance: u32
      };

      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(1) @interpolate(flat) instance: u32,
        @location(2) @interpolate(linear) vertex: vec2f,
      };

      struct Rectangle {
        color: vec4f,
        position: vec2f,
        size: vec2f,
        corners: vec4f,
        borderWidth: vec4f,
        borderColor: vec4f,
        clipStart: vec2f,
        clipSize: vec2f,
        clipCorners: vec4f,
        window: vec2f,
        _padding: vec2f
      };

      struct UniformStorage {
        rectangles: array<Rectangle>,
      };

      @group(0) @binding(0) var<storage> data: UniformStorage;

      @vertex
      fn vertexMain(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        let r = data.rectangles[input.instance];
        let vertex = mix(
          r.position.xy,
          r.position.xy + r.size,
          input.position
        );

        output.position = vec4f(vertex / r.window * 2 - 1, 0, 1);
        output.position.y = -output.position.y;
        output.vertex = vertex;
        output.instance = input.instance;
        return output;
      }

      fn rectangle(position: vec2f, size: vec2f, radius: f32, border: vec2f) -> f32 {
        let q = abs(position - border) - (size / 2.0) + vec2f(radius);
        return length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - radius;
      }

      @fragment
      fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
        let r = data.rectangles[input.instance];
        let inBounds =
          (input.position.x >= r.clipStart.x) &&
          (input.position.y >= r.clipStart.y) &&
          (input.position.x <= r.clipStart.x + r.clipSize.x) &&
          (input.position.y <= r.clipStart.y + r.clipSize.y);
        if (!inBounds) {
          discard;
          // return vec4f(1, 0, 0, 0.3);
        }

        let p = input.position.xy - r.position - r.size / 2.0;
        var radius = r.corners.w;
        if (p.x > 0.0 && p.y > 0.0) {
          radius = r.corners.y;
        } else if (p.x < 0.0 && p.y > 0.0) {
          radius = r.corners.x;
        } else if (p.x < 0.0 && p.y < 0.0) {
          radius = r.corners.z;
        }

        var border = vec2f(0, 0);
        if (p.y > 0.0) {
          border.y -= r.borderWidth.x;
        } else {
          border.y += r.borderWidth.z;
        }
        if (p.x > 0.0) {
          border.x -= r.borderWidth.y;
        } else {
          border.x += r.borderWidth.w;
        }

        var borderCorrection = 0.0;
        if (p.x < 0.0 && p.y < 0.0) {
          borderCorrection = min(r.borderWidth.x, r.borderWidth.y);
        } else if (p.x > 0.0 && p.y < 0.0) {
          borderCorrection = min(r.borderWidth.z, r.borderWidth.y);
        } else if (p.x < 0.0 && p.y > 0.0) {
          borderCorrection = min(r.borderWidth.x, r.borderWidth.w);
        } else if (p.x > 0.0 && p.y > 0.0) {
          borderCorrection = min(r.borderWidth.z, r.borderWidth.w);
        }

        let outerDistance = rectangle(p, r.size, radius, vec2(0.0));
        let innerDistance = rectangle(p, r.size, radius - borderCorrection, border);

        var color = r.color;
        if (length(border) > 0.0) {
          color = mix(color, r.borderColor, smoothstep(-0.5, 0.5, innerDistance));
        }
        color.a *= 1.0 - smoothstep(-0.5, 0.5, outerDistance);
        return color;
      }
    `;

    const textShader = /* wgsl */ `
      struct VertexInput {
        @location(0) position: vec2f,
        @builtin(instance_index) instance: u32
      };

      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(1) @interpolate(flat) instance: u32,
        @location(2) @interpolate(linear) vertex: vec2f,
        @location(3) @interpolate(linear) uv: vec2f,
      };

      struct Glyph {
        position: vec2f,
        _unused: f32,
        fontSize: f32,
        color: vec4f,
        size: vec2f,
        uv: vec2f,
        uvSize: vec2f,
        clipStart: vec2f,
        clipSize: vec2f,
        window: vec2f,
      };

      struct UniformStorage {
        glyphs: array<Glyph>,
      };

      @group(0) @binding(0) var<storage> text: UniformStorage;
      @group(0) @binding(1) var fontAtlasSampler: sampler;
      @group(0) @binding(2) var fontAtlas: texture_2d<f32>;

      @vertex
      fn vertexMain(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        let g = text.glyphs[input.instance];
        let vertex = mix(g.position.xy, g.position.xy + g.size, input.position);

        output.position = vec4f(vertex / g.window * 2 - 1, 0, 1);
        output.position.y = -output.position.y;
        output.vertex = vertex;
        output.uv = mix(g.uv, g.uv + g.uvSize, input.position);
        output.instance = input.instance;
        return output;
      }

      @fragment
      fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
        let g = text.glyphs[input.instance];
        let distance = textureSample(fontAtlas, fontAtlasSampler, input.uv).a;

        let inBounds =
          (input.position.x >= g.clipStart.x) &&
          (input.position.y >= g.clipStart.y) &&
          (input.position.x <= g.clipStart.x + g.clipSize.x) &&
          (input.position.y <= g.clipStart.y + g.clipSize.y);
        if (!inBounds) {
          discard;
          // return vec4f(1, 0, 0, 0.3);
        }

        var width = mix(0.45, 0.12, clamp(g.fontSize, 0, 40) / 40.0);
        width /= ${window.devicePixelRatio};

        // I switched the texture to use 0.75 cutoff like in tiny SDF, but I don't really see any improvement.
        const buffer = 0.75;
        let alpha = g.color.a * smoothstep(buffer - width, buffer + width, distance);

        return vec4f(g.color.rgb, alpha);
      }
    `;

    const rectangleModule = device.createShaderModule({
      code: rectangleShader,
    });
    const textModule = device.createShaderModule({ code: textShader });

    this.vertexBuffer = device.createBuffer({
      label: "vertex",
      // Just two triangles.
      size: 2 * 2 * 3 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.rectangleBuffer = device.createBuffer({
      label: "rectangle",
      size: this.settings.rectangleBufferSize * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    this.textBuffer = device.createBuffer({
      label: "text",
      size: this.settings.textBufferSize * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    const rectangleBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          buffer: { type: "read-only-storage" },
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        },
      ],
      label: "rectangle bind group layout",
    });

    this.textBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          buffer: { type: "read-only-storage" },
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        },
        {
          binding: 1,
          sampler: {},
          visibility: GPUShaderStage.FRAGMENT,
        },
        {
          binding: 2,
          texture: {},
          visibility: GPUShaderStage.FRAGMENT,
        },
      ],
      label: "text bind group layout",
    });

    this.sampler = device.createSampler({
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
      magFilter: "linear",
      minFilter: "linear",
      mipmapFilter: "linear",
    });

    const atlasTexture = createTextureFromImageBitmap(device, fontAtlasTexture);

    this.textBindGroup = this.device.createBindGroup({
      entries: [
        {
          binding: 0,
          resource: { buffer: this.textBuffer },
        },
        {
          binding: 1,
          resource: this.sampler,
        },
        {
          binding: 2,
          resource: atlasTexture.createView(),
        },
      ],
      label: "text",
      layout: this.textBindGroupLayout,
    });

    const rectanglePipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [rectangleBindGroupLayout],
      label: "rectangle pipeline layout",
    });

    const textPipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [this.textBindGroupLayout],
      label: "text pipeline layout",
    });

    this.rectangleBindGroup = device.createBindGroup({
      entries: [
        {
          binding: 0,
          resource: { buffer: this.rectangleBuffer },
        },
      ],
      label: "rectangles",
      layout: rectangleBindGroupLayout,
    });

    this.rectanglePipeline = device.createRenderPipeline({
      fragment: {
        entryPoint: "fragmentMain",
        module: rectangleModule,
        targets: [
          {
            blend: {
              alpha: {
                dstFactor: "one-minus-src-alpha",
                srcFactor: "src-alpha",
              },
              color: {
                dstFactor: "one-minus-src-alpha",
                srcFactor: "src-alpha",
              },
            },
            format: navigator.gpu.getPreferredCanvasFormat(),
          },
        ],
      },
      label: "blurred rectangles",
      layout: rectanglePipelineLayout,
      multisample: { count: this.settings.sampleCount },
      vertex: {
        buffers: [
          {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                format: "float32x2",
                offset: 0,
                shaderLocation: 0,
              },
            ],
          },
        ],
        entryPoint: "vertexMain",
        module: rectangleModule,
      },
    });

    this.textPipeline = device.createRenderPipeline({
      fragment: {
        entryPoint: "fragmentMain",
        module: textModule,
        targets: [
          {
            blend: {
              alpha: {
                dstFactor: "one-minus-src-alpha",
                srcFactor: "src-alpha",
              },
              color: {
                dstFactor: "one-minus-src-alpha",
                srcFactor: "src-alpha",
              },
            },
            format: navigator.gpu.getPreferredCanvasFormat(),
          },
        ],
      },
      label: "text",
      layout: textPipelineLayout,
      multisample: { count: this.settings.sampleCount },
      vertex: {
        buffers: [
          {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                format: "float32x2",
                offset: 0,
                shaderLocation: 0,
              },
            ],
          },
        ],
        entryPoint: "vertexMain",
        module: textModule,
      },
    });

    // Just regular full-screen quad consisting of two triangles.
    const vertices = [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1];
    device.queue.writeBuffer(this.vertexBuffer, 0, new Float32Array(vertices));
  }

  rectangle(
    color: Vec4,
    position: Vec2,
    size: Vec2,
    corners: Vec4,
    borderWidth: Vec4,
    borderColor: Vec4,
    clipStart: Vec2,
    clipSize: Vec2,
    clipCorners: Vec4,
  ): void {
    if (color.w < 0.01) {
      return;
    }

    if (this.drawingMode !== DrawingMode.Rectangles) {
      this.drawingIndices.push(this.rectangleCount, this.glyphCount);
    }

    const scale = window.devicePixelRatio;

    const struct = 32;
    this.rectangleData[this.rectangleCount * struct + 0] = color.x;
    this.rectangleData[this.rectangleCount * struct + 1] = color.y;
    this.rectangleData[this.rectangleCount * struct + 2] = color.z;
    this.rectangleData[this.rectangleCount * struct + 3] = color.w;
    this.rectangleData[this.rectangleCount * struct + 4] = position.x * scale;
    this.rectangleData[this.rectangleCount * struct + 5] = position.y * scale;
    this.rectangleData[this.rectangleCount * struct + 6] = size.x * scale;
    this.rectangleData[this.rectangleCount * struct + 7] = size.y * scale;
    this.rectangleData[this.rectangleCount * struct + 8] = corners.x * scale;
    this.rectangleData[this.rectangleCount * struct + 9] = corners.y * scale;
    this.rectangleData[this.rectangleCount * struct + 10] = corners.z * scale;
    this.rectangleData[this.rectangleCount * struct + 11] = corners.w * scale;
    this.rectangleData[this.rectangleCount * struct + 12] = borderWidth.x * scale;
    this.rectangleData[this.rectangleCount * struct + 13] = borderWidth.y * scale;
    this.rectangleData[this.rectangleCount * struct + 14] = borderWidth.z * scale;
    this.rectangleData[this.rectangleCount * struct + 15] = borderWidth.w * scale;
    this.rectangleData[this.rectangleCount * struct + 16] = borderColor.x;
    this.rectangleData[this.rectangleCount * struct + 17] = borderColor.y;
    this.rectangleData[this.rectangleCount * struct + 18] = borderColor.z;
    this.rectangleData[this.rectangleCount * struct + 19] = borderColor.w;
    this.rectangleData[this.rectangleCount * struct + 20] = clipStart.x * scale;
    this.rectangleData[this.rectangleCount * struct + 21] = clipStart.y * scale;
    this.rectangleData[this.rectangleCount * struct + 22] = clipSize.x * scale;
    this.rectangleData[this.rectangleCount * struct + 23] = clipSize.y * scale;
    this.rectangleData[this.rectangleCount * struct + 24] = clipCorners.x * scale;
    this.rectangleData[this.rectangleCount * struct + 25] = clipCorners.y * scale;
    this.rectangleData[this.rectangleCount * struct + 26] = clipCorners.z * scale;
    this.rectangleData[this.rectangleCount * struct + 27] = clipCorners.w * scale;
    this.rectangleData[this.rectangleCount * struct + 28] = this.settings.windowWidth * scale;
    this.rectangleData[this.rectangleCount * struct + 29] = this.settings.windowHeight * scale;
    this.rectangleData[this.rectangleCount * struct + 30] = 0;
    this.rectangleData[this.rectangleCount * struct + 31] = 0;

    this.rectangleCount += 1;
    this.drawingMode = DrawingMode.Rectangles;
  }

  text(
    text: string,
    position: Vec2,
    fontName: string,
    fontSize: number,
    color: Vec4,
    textAlign: TextAlign,
    clipStart: Vec2,
    clipSize: Vec2,
    options?: {
      lineHeight?: number;
      maxWidth?: number;
      noWrap?: boolean;
    },
  ): void {
    if (this.drawingMode !== DrawingMode.Text) {
      this.drawingIndices.push(this.rectangleCount, this.glyphCount);
    }

    let shape: Shape;
    try {
      shape = shapeText(
        this.fontLookups,
        fontName,
        fontSize,
        options?.lineHeight ?? defaultTextStyleProps.lineHeight,
        text,
        textAlign,
        options?.maxWidth,
        options?.noWrap,
      );
    } catch (error) {
      console.error(
        `Failed while shaping the word "${text.slice(0, 50)}${text.length > 50 ? "…" : ""}".`,
      );
      console.error(error);
      return;
    }

    invariant(shape.positions.length === text.length, "Shape length does not match text length.");

    for (let i = 0; i < shape.positions.length; i++) {
      const size = shape.sizes[i];
      const character = text[i];
      invariant(size, "Size does not exist.");
      invariant(character, "Text does not exist.");

      // Skip spaces and newlines.
      if ([32, 10].includes(character.charCodeAt(0))) {
        continue;
      }

      const shapePosition = shape.positions[i]!.add(position);

      const uv =
        this.fontLookups.uvs.get(`${fontName}-${character.charCodeAt(0)}`) ??
        this.fontLookups.uvs.get(`${fontName}-${"□".charCodeAt(0)}`)!;
      invariant(uv, "UV does not exist.");

      const scale = window.devicePixelRatio;

      const struct = 20;
      this.glyphData[this.glyphCount * struct + 0] = shapePosition.x * scale;
      this.glyphData[this.glyphCount * struct + 1] = shapePosition.y * scale;
      this.glyphData[this.glyphCount * struct + 2] = 0;
      this.glyphData[this.glyphCount * struct + 3] = fontSize * scale;
      this.glyphData[this.glyphCount * struct + 4] = color.x;
      this.glyphData[this.glyphCount * struct + 5] = color.y;
      this.glyphData[this.glyphCount * struct + 6] = color.z;
      this.glyphData[this.glyphCount * struct + 7] = color.w;
      this.glyphData[this.glyphCount * struct + 8] = size.x * scale;
      this.glyphData[this.glyphCount * struct + 9] = size.y * scale;
      this.glyphData[this.glyphCount * struct + 10] = uv.x;
      this.glyphData[this.glyphCount * struct + 11] = uv.y;
      this.glyphData[this.glyphCount * struct + 12] = uv.z;
      this.glyphData[this.glyphCount * struct + 13] = uv.w;
      this.glyphData[this.glyphCount * struct + 14] = clipStart.x * scale;
      this.glyphData[this.glyphCount * struct + 15] = clipStart.y * scale;
      this.glyphData[this.glyphCount * struct + 16] = clipSize.x * scale;
      this.glyphData[this.glyphCount * struct + 17] = clipSize.y * scale;
      this.glyphData[this.glyphCount * struct + 18] = this.settings.windowWidth * scale;
      this.glyphData[this.glyphCount * struct + 19] = this.settings.windowHeight * scale;

      this.glyphCount += 1;
    }

    this.drawingMode = DrawingMode.Text;
  }

  render(commandEncoder: GPUCommandEncoder): void {
    invariant(this.context, "Context does not exist.");

    commandEncoder.insertDebugMarker("UI");

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          // TODO release: this should be changed to load and clearing should be done outside.
          // Otherwise UI will steal the whole screen.
          clearValue: { a: 1, b: 0, g: 0, r: 0 },
          loadOp: "clear",
          // loadOp: "load",
          resolveTarget: this.context
            .getCurrentTexture()
            .createView({ label: "antialiased resolve target" }),

          storeOp: "store",
          view: this.colorTextureView,
        },
      ],
    });

    this.device.queue.writeBuffer(this.rectangleBuffer, 0, this.rectangleData);
    this.device.queue.writeBuffer(this.textBuffer, 0, this.glyphData);

    renderPass.setViewport(
      0,
      0,
      this.settings.windowWidth * window.devicePixelRatio,
      this.settings.windowHeight * window.devicePixelRatio,
      0,
      1,
    );
    renderPass.setVertexBuffer(0, this.vertexBuffer);

    for (let k = 0; k < this.drawingIndices.length - 1; k += 2) {
      const r = this.drawingIndices[k];
      const g = this.drawingIndices[k + 1];
      const rectangles = (this.drawingIndices[k + 2] ?? this.rectangleCount) - (r ?? 0);
      const glyphs = (this.drawingIndices[k + 3] ?? this.glyphCount) - (g ?? 0);

      renderPass.setPipeline(this.rectanglePipeline);
      renderPass.setBindGroup(0, this.rectangleBindGroup);
      if (rectangles > 0) {
        renderPass.draw(6, rectangles, 0, r);
      }

      renderPass.setPipeline(this.textPipeline);
      renderPass.setBindGroup(0, this.textBindGroup);
      if (glyphs > 0) {
        renderPass.draw(6, glyphs, 0, g);
      }
    }

    renderPass.end();

    this.drawingIndices = [];

    this.rectangleCount = 0;
    this.glyphCount = 0;

    this.drawingMode = DrawingMode.None;

    this.rectangleData = new Float32Array(this.settings.rectangleBufferSize);
    this.glyphData = new Float32Array(this.settings.textBufferSize);
  }
}
