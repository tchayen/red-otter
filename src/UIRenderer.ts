// import { invariant } from "./utils/invariant";
// import { Vec2 } from "./math/Vec2";
// import { Vec4 } from "./math/Vec4";
// import { Lookups } from "./font/types";
// import { Shape, shapeText } from "./font/shapeText";
// import { Settings } from "./consts";
// import { createTextureFromImageBitmap } from "./createTextureFromBitmap";

// /*
//  * First number is the size of Rectangle struct (with padding).
//  * Second is in this case maximum number of allowed elements (can easily go into
//  * high thousands).
//  */
// const RECTANGLE_BUFFER_SIZE = 16 * 1024;
// const TEXT_BUFFER_SIZE = 16 * 100_000;

// enum DrawingMode {
//   Rectangles,
//   Text,
//   None,
// }

// export class UIRenderer {
//   private drawingMode = DrawingMode.None;
//   private drawingIndices: number[] = [];

//   private rectangleData: Float32Array = new Float32Array(RECTANGLE_BUFFER_SIZE);
//   private rectangleCount = 0;

//   private glyphData: Float32Array = new Float32Array(TEXT_BUFFER_SIZE);
//   private glyphCount = 0;

//   private readonly vertexBuffer: GPUBuffer;
//   private readonly rectangleBuffer: GPUBuffer;
//   private readonly textBuffer: GPUBuffer;

//   private readonly textBindGroupLayout: GPUBindGroupLayout;

//   private readonly rectangleBindGroup: GPUBindGroup;
//   private readonly textBindGroup: GPUBindGroup;

//   private readonly rectanglePipeline: GPURenderPipeline;
//   private readonly textPipeline: GPURenderPipeline;

//   private readonly sampler: GPUSampler;

//   constructor(
//     private readonly device: GPUDevice,
//     private readonly context: GPUCanvasContext,
//     private readonly colorTextureView: GPUTextureView,
//     private readonly settings: Settings,
//     public readonly fontLookups: Lookups,
//     fontAtlasTexture: ImageBitmap
//   ) {
//     const rectangleShader = /* wgsl */ `
//       struct VertexInput {
//         @location(0) position: vec2f,
//         @builtin(instance_index) instance: u32
//       };

//       struct VertexOutput {
//         @builtin(position) position: vec4f,
//         @location(1) @interpolate(flat) instance: u32,
//         @location(2) @interpolate(linear) vertex: vec2f,
//       };

//       struct Rectangle {
//         color: vec4f,
//         position: vec2f,
//         _unused: f32,
//         sigma: f32,
//         corners: vec4f,
//         size: vec2f,
//         window: vec2f,
//       };

//       struct UniformStorage {
//         rectangles: array<Rectangle>,
//       };

//       @group(0) @binding(0) var<storage> data: UniformStorage;

//       @vertex
//       fn vertexMain(input: VertexInput) -> VertexOutput {
//         var output: VertexOutput;
//         let r = data.rectangles[input.instance];
//         let vertex = mix(
//           r.position.xy,
//           r.position.xy + r.size,
//           input.position
//         );

//         output.position = vec4f(vertex / r.window * 2 - 1, 0, 1);
//         output.position.y = -output.position.y;
//         output.vertex = vertex;
//         output.instance = input.instance;
//         return output;
//       }

//       @fragment
//       fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
//         return data.rectangles[input.instance].color;
//       }
//     `;

//     const textShader = /* wgsl */ `
//       struct VertexInput {
//         @location(0) position: vec2f,
//         @builtin(instance_index) instance: u32
//       };

//       struct VertexOutput {
//         @builtin(position) position: vec4f,
//         @location(1) @interpolate(flat) instance: u32,
//         @location(2) @interpolate(linear) vertex: vec2f,
//         @location(3) @interpolate(linear) uv: vec2f,
//       };

//       struct Glyph {
//         position: vec2f,
//         _unused: f32,
//         fontSize: f32,
//         color: vec4f,
//         size: vec2f,
//         uv: vec2f,
//         uvSize: vec2f,
//         window: vec2f,
//       };

//       struct UniformStorage {
//         glyphs: array<Glyph>,
//       };

//       @group(0) @binding(0) var<storage> text: UniformStorage;
//       @group(0) @binding(1) var fontAtlasSampler: sampler;
//       @group(0) @binding(2) var fontAtlas: texture_2d<f32>;

//       @vertex
//       fn vertexMain(input: VertexInput) -> VertexOutput {
//         var output: VertexOutput;
//         let g = text.glyphs[input.instance];
//         let vertex = mix(g.position.xy, g.position.xy + g.size, input.position);

//         output.position = vec4f(vertex / g.window * 2 - 1, 0, 1);
//         output.position.y = -output.position.y;
//         output.vertex = vertex;
//         output.uv = mix(g.uv, g.uv + g.uvSize, input.position);
//         output.instance = input.instance;
//         return output;
//       }

//       @fragment
//       fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
//         let g = text.glyphs[input.instance];
//         let distance = textureSample(fontAtlas, fontAtlasSampler, input.uv).a;

//         var width = mix(0.45, 0.12, clamp(g.fontSize, 0, 40) / 40.0);
//         width /= ${window.devicePixelRatio};

//         // I switched the texture to use 0.75 cutoff like in tiny SDF, but I don't really see any improvement.
//         const buffer = 0.75;
//         let alpha = g.color.a * smoothstep(buffer - width, buffer + width, distance);

//         return vec4f(g.color.rgb, alpha);
//       }
//     `;

//     const rectangleModule = device.createShaderModule({
//       code: rectangleShader,
//     });
//     const textModule = device.createShaderModule({ code: textShader });

//     this.vertexBuffer = device.createBuffer({
//       label: "vertex",
//       // Just two triangles.
//       size: 2 * 2 * 3 * Float32Array.BYTES_PER_ELEMENT,
//       usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//     });

//     this.rectangleBuffer = device.createBuffer({
//       label: "rectangle",
//       size: RECTANGLE_BUFFER_SIZE * Float32Array.BYTES_PER_ELEMENT,
//       usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
//     });

//     this.textBuffer = device.createBuffer({
//       label: "text",
//       size: TEXT_BUFFER_SIZE * Float32Array.BYTES_PER_ELEMENT,
//       usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
//     });

//     const rectangleBindGroupLayout = device.createBindGroupLayout({
//       entries: [
//         {
//           binding: 0,
//           buffer: { type: "read-only-storage" },
//           visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
//         },
//       ],
//       label: "rectangle bind group layout",
//     });

//     this.textBindGroupLayout = device.createBindGroupLayout({
//       entries: [
//         {
//           binding: 0,
//           buffer: { type: "read-only-storage" },
//           visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
//         },
//         {
//           binding: 1,
//           sampler: {},
//           visibility: GPUShaderStage.FRAGMENT,
//         },
//         {
//           binding: 2,
//           texture: {},
//           visibility: GPUShaderStage.FRAGMENT,
//         },
//       ],
//       label: "text bind group layout",
//     });

//     this.sampler = device.createSampler({
//       addressModeU: "clamp-to-edge",
//       addressModeV: "clamp-to-edge",
//       magFilter: "linear",
//       minFilter: "linear",
//       mipmapFilter: "linear",
//     });

//     const atlasTexture = createTextureFromImageBitmap(device, fontAtlasTexture);

//     this.textBindGroup = this.device.createBindGroup({
//       entries: [
//         {
//           binding: 0,
//           resource: { buffer: this.textBuffer },
//         },
//         {
//           binding: 1,
//           resource: this.sampler,
//         },
//         {
//           binding: 2,
//           resource: atlasTexture.createView(),
//         },
//       ],
//       label: "text",
//       layout: this.textBindGroupLayout,
//     });

//     const rectanglePipelineLayout = device.createPipelineLayout({
//       bindGroupLayouts: [rectangleBindGroupLayout],
//       label: "rectangle pipeline layout",
//     });

//     const textPipelineLayout = device.createPipelineLayout({
//       bindGroupLayouts: [this.textBindGroupLayout],
//       label: "text pipeline layout",
//     });

//     this.rectangleBindGroup = device.createBindGroup({
//       entries: [
//         {
//           binding: 0,
//           resource: { buffer: this.rectangleBuffer },
//         },
//       ],
//       label: "rectangles",
//       layout: rectangleBindGroupLayout,
//     });

//     this.rectanglePipeline = device.createRenderPipeline({
//       fragment: {
//         entryPoint: "fragmentMain",
//         module: rectangleModule,
//         targets: [
//           {
//             blend: {
//               alpha: {
//                 dstFactor: "one-minus-src-alpha",
//                 srcFactor: "src-alpha",
//               },
//               color: {
//                 dstFactor: "one-minus-src-alpha",
//                 srcFactor: "src-alpha",
//               },
//             },
//             format: navigator.gpu.getPreferredCanvasFormat(),
//           },
//         ],
//       },
//       label: "blurred rectangles",
//       layout: rectanglePipelineLayout,
//       multisample: { count: this.settings.sampleCount },
//       vertex: {
//         buffers: [
//           {
//             arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
//             attributes: [
//               {
//                 format: "float32x2",
//                 offset: 0,
//                 shaderLocation: 0,
//               },
//             ],
//           },
//         ],
//         entryPoint: "vertexMain",
//         module: rectangleModule,
//       },
//     });

//     this.textPipeline = device.createRenderPipeline({
//       fragment: {
//         entryPoint: "fragmentMain",
//         module: textModule,
//         targets: [
//           {
//             blend: {
//               alpha: {
//                 dstFactor: "one-minus-src-alpha",
//                 srcFactor: "src-alpha",
//               },
//               color: {
//                 dstFactor: "one-minus-src-alpha",
//                 srcFactor: "src-alpha",
//               },
//             },
//             format: navigator.gpu.getPreferredCanvasFormat(),
//           },
//         ],
//       },
//       label: "text",
//       layout: textPipelineLayout,
//       multisample: { count: this.settings.sampleCount },
//       vertex: {
//         buffers: [
//           {
//             arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
//             attributes: [
//               {
//                 format: "float32x2",
//                 offset: 0,
//                 shaderLocation: 0,
//               },
//             ],
//           },
//         ],
//         entryPoint: "vertexMain",
//         module: textModule,
//       },
//     });

//     // Just regular full-screen quad consisting of two triangles.
//     const vertices = [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1];
//     device.queue.writeBuffer(this.vertexBuffer, 0, new Float32Array(vertices));
//   }

//   rectangle(color: Vec4, position: Vec2, size: Vec2, corners: Vec4, sigma: number): void {
//     if (color.w < 0.01) {
//       return;
//     }

//     if (this.drawingMode !== DrawingMode.Rectangles) {
//       this.drawingIndices.push(this.rectangleCount, this.glyphCount);
//     }

//     const struct = 16;
//     this.rectangleData[this.rectangleCount * struct + 0] = color.x;
//     this.rectangleData[this.rectangleCount * struct + 1] = color.y;
//     this.rectangleData[this.rectangleCount * struct + 2] = color.z;
//     this.rectangleData[this.rectangleCount * struct + 3] = color.w;
//     this.rectangleData[this.rectangleCount * struct + 4] = position.x;
//     this.rectangleData[this.rectangleCount * struct + 5] = position.y;
//     this.rectangleData[this.rectangleCount * struct + 6] = 0;
//     this.rectangleData[this.rectangleCount * struct + 7] = sigma;
//     this.rectangleData[this.rectangleCount * struct + 8] = corners.x;
//     this.rectangleData[this.rectangleCount * struct + 9] = corners.y;
//     this.rectangleData[this.rectangleCount * struct + 10] = corners.z;
//     this.rectangleData[this.rectangleCount * struct + 11] = corners.w;
//     this.rectangleData[this.rectangleCount * struct + 12] = size.x;
//     this.rectangleData[this.rectangleCount * struct + 13] = size.y;
//     this.rectangleData[this.rectangleCount * struct + 14] = this.settings.windowWidth;
//     this.rectangleData[this.rectangleCount * struct + 15] = this.settings.windowHeight;

//     this.rectangleCount += 1;
//     this.drawingMode = DrawingMode.Rectangles;
//   }

//   text(
//     text: string,
//     position: Vec2,
//     fontName: string,
//     fontSize: number,
//     color: Vec4,
//     textAlignment: "left" | "center" | "right",
//     options?: {
//       lineHeight?: number;
//       maxWidth?: number;
//       trimEnd?: Vec2;
//       trimStart?: Vec2;
//     }
//   ): void {
//     if (this.drawingMode !== DrawingMode.Text) {
//       this.drawingIndices.push(this.rectangleCount, this.glyphCount);
//     }

//     let shape: Shape;
//     try {
//       shape = shapeText({
//         fontName,
//         fontSize,
//         lineHeight: options?.lineHeight,
//         lookups: this.fontLookups,
//         maxWidth: options?.maxWidth,
//         text,
//         textAlignment,
//       });
//     } catch (error) {
//       console.error(
//         `Failed while shaping the word "${text.slice(0, 50)}${text.length > 50 ? "…" : ""}".`
//       );
//       console.error(error);
//       return;
//     }

//     for (let i = 0; i < shape.positions.length; i++) {
//       // Skip spaces and newlines.
//       if ([32, 10].includes(text[i].charCodeAt(0))) {
//         continue;
//       }

//       let shapePosition = shape.positions[i].add(position);
//       let size = shape.sizes[i];

//       let uv =
//         this.fontLookups.uvs.get(`${fontName}-${text[i].charCodeAt(0)}`) ??
//         this.fontLookups.uvs.get(`${fontName}-${"□".charCodeAt(0)}`)!;
//       invariant(uv, "UV does not exist.");

//       if (options?.trimStart) {
//         const diffX = options.trimStart.x - shapePosition.x;
//         const diffY = options.trimStart.y - shapePosition.y;

//         if (shapePosition.x + size.x < options.trimStart.x) {
//           size = new Vec2(0, 0);
//         }

//         if (shapePosition.y + size.y < options.trimStart.y) {
//           size = new Vec2(0, 0);
//         }

//         if (diffX > 0) {
//           const uvDiffX = (diffX / size.x) * uv.z;
//           uv = new Vec4(uv.x + uvDiffX, uv.y, uv.z - uvDiffX, uv.w);
//           size = new Vec2(size.x - diffX, size.y);
//           shapePosition = new Vec2(options.trimStart.x, shapePosition.y);
//         }

//         if (diffY > 0) {
//           const uvDiffY = (diffY / size.y) * uv.w;
//           uv = new Vec4(uv.x, uv.y + uvDiffY, uv.z, uv.w - uvDiffY);
//           size = new Vec2(size.x, size.y - diffY);
//           shapePosition = new Vec2(shapePosition.x, options.trimStart.y);
//         }
//       }

//       if (options?.trimEnd) {
//         const diffX = shapePosition.x + size.x - options.trimEnd.x;
//         const diffY = shapePosition.y + size.y - options.trimEnd.y;

//         if (shapePosition.x > options.trimEnd.x) {
//           size = new Vec2(0, 0);
//         }

//         if (shapePosition.y > options.trimEnd.y) {
//           size = new Vec2(0, 0);
//         }

//         if (diffX > 0) {
//           const uvDiffX = (diffX / size.x) * uv.z;
//           uv = new Vec4(uv.x, uv.y, uv.z - uvDiffX, uv.w);
//           size = new Vec2(size.x - diffX, size.y);
//         }

//         if (diffY > 0) {
//           const uvDiffY = (diffY / size.y) * uv.w;
//           uv = new Vec4(uv.x, uv.y, uv.z, uv.w - uvDiffY);
//           size = new Vec2(size.x, size.y - diffY);
//         }
//       }

//       const struct = 16;
//       this.glyphData[this.glyphCount * struct + 0] = shapePosition.x;
//       this.glyphData[this.glyphCount * struct + 1] = shapePosition.y;
//       this.glyphData[this.glyphCount * struct + 2] = 0;
//       this.glyphData[this.glyphCount * struct + 3] = fontSize;
//       this.glyphData[this.glyphCount * struct + 4] = color.x;
//       this.glyphData[this.glyphCount * struct + 5] = color.y;
//       this.glyphData[this.glyphCount * struct + 6] = color.z;
//       this.glyphData[this.glyphCount * struct + 7] = color.w;
//       this.glyphData[this.glyphCount * struct + 8] = size.x;
//       this.glyphData[this.glyphCount * struct + 9] = size.y;
//       this.glyphData[this.glyphCount * struct + 10] = uv.x;
//       this.glyphData[this.glyphCount * struct + 11] = uv.y;
//       this.glyphData[this.glyphCount * struct + 12] = uv.z;
//       this.glyphData[this.glyphCount * struct + 13] = uv.w;
//       this.glyphData[this.glyphCount * struct + 14] = this.settings.windowWidth;
//       this.glyphData[this.glyphCount * struct + 15] = this.settings.windowHeight;

//       this.glyphCount += 1;
//     }

//     this.drawingMode = DrawingMode.Text;
//   }

//   render(commandEncoder: GPUCommandEncoder): void {
//     invariant(this.context, "Context does not exist.");

//     commandEncoder.insertDebugMarker("UI");

//     const renderPass = commandEncoder.beginRenderPass({
//       colorAttachments: [
//         {
//           /*
//            * clearValue: { r: 1, g: 1, b: 1, a: 1 },
//            * loadOp: "clear",
//            */
//           loadOp: "load",

//           resolveTarget: this.context
//             .getCurrentTexture()
//             .createView({ label: "antialiased resolve target" }),

//           storeOp: "store",
//           view: this.colorTextureView,
//         },
//       ],
//     });

//     this.device.queue.writeBuffer(this.rectangleBuffer, 0, this.rectangleData);
//     this.device.queue.writeBuffer(this.textBuffer, 0, this.glyphData);

//     renderPass.setViewport(
//       0,
//       0,
//       this.settings.windowWidth * window.devicePixelRatio,
//       this.settings.windowHeight * window.devicePixelRatio,
//       0,
//       1
//     );
//     renderPass.setVertexBuffer(0, this.vertexBuffer);

//     for (let k = 0; k < this.drawingIndices.length - 1; k += 2) {
//       const r = this.drawingIndices[k];
//       const g = this.drawingIndices[k + 1];
//       const rectangles = (this.drawingIndices[k + 2] ?? this.rectangleCount) - r;
//       const glyphs = (this.drawingIndices[k + 3] ?? this.glyphCount) - g;

//       renderPass.setPipeline(this.rectanglePipeline);
//       renderPass.setBindGroup(0, this.rectangleBindGroup);
//       if (rectangles > 0) {
//         renderPass.draw(6, rectangles, 0, r);
//       }

//       renderPass.setPipeline(this.textPipeline);
//       renderPass.setBindGroup(0, this.textBindGroup);
//       if (glyphs > 0) {
//         renderPass.draw(6, glyphs, 0, g);
//       }
//     }

//     renderPass.end();

//     this.drawingIndices = [];

//     this.rectangleCount = 0;
//     this.glyphCount = 0;

//     this.drawingMode = DrawingMode.None;

//     this.rectangleData = new Float32Array(RECTANGLE_BUFFER_SIZE);
//     this.glyphData = new Float32Array(TEXT_BUFFER_SIZE);
//   }
// }
