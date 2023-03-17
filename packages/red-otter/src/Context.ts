import { invariant } from "./invariant";
import { Vec2 } from "./math/Vec2";
import { Vec4 } from "./math/Vec4";
import { Mat4 } from "./math/Mat4";
import { triangulateLine } from "./math/triangulateLine";
import { triangulatePolygon } from "./math/triangulatePolygon";
import { Font } from "./fonts/Font";
import { parseColor } from "./parseColor";

const DEBUG_TEXT_RENDERING_SHOW_CAPSIZE = false;
const DEBUG_TEXT_RENDERING_SHOW_GLYPHS = false;

const vertex = `#version 300 es
layout (location = 0) in vec2 a_position;
layout (location = 1) in vec2 a_uv;
layout (location = 2) in vec4 a_color;

uniform mat4 u_matrix;

out vec2 uv;
out vec4 color;

void main() {
  uv = a_uv;
  color = a_color;
  gl_Position = u_matrix * vec4(a_position, 0, 1);
}`;

const fragment = `#version 300 es
precision mediump float;

in vec2 uv;
in vec4 color;

out vec4 frag_color;

uniform sampler2D u_texture;

float buffer = 0.5;

float contour(float width, float distance) {
  return smoothstep(buffer - width, buffer + width, distance);
}

void main() {
  if (uv.x != -1.0 && uv.y != -1.0) {
    float distance = texture(u_texture, uv).a;

    // 4 currrently means 1/4 of a pixel. This was eyeballed.
    float width = fwidth(distance) / 4.0;

    float alpha = contour(width, distance);

    float d_scale = 0.353; // sqrt(2) / 4
    vec2 d_uv = d_scale * (dFdx(uv) + dFdy(uv));
    vec4 box = vec4(uv - d_uv, uv + d_uv);

    float a_sum = contour(width, texture(u_texture, box.xy).a)
               + contour(width, texture(u_texture, box.zw).a)
               + contour(width, texture(u_texture, box.xw).a)
               + contour(width, texture(u_texture, box.zy).a);

    // Extra points have weight 0.5, main point 1, total 3.
    alpha = (alpha + 0.5 * a_sum) / 3.0;


    // Show font.
    frag_color = vec4(color.xyz, alpha);

    // Show distance.
    // frag_color = texture(u_texture, uv);

    // Show UV.
    // frag_color = vec4(1, 0, 0, 0.5);
  } else {
    frag_color = color;
  }
}`;

const NO_TEXTURE = new Vec2(-1, -1);

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  invariant(shader, "Shader creation failed.");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);

  return null;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  invariant(program, "Program creation failed.");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);

  return null;
}

export interface IContext {
  /**
   * Get canvas element.
   */
  getCanvas(): HTMLCanvasElement;

  /**
   * Draw line connecting given list of points.
   */
  line(points: Vec2[], thickness: number, color: Vec4): void;

  /**
   * Triangulates and draws given polygon.
   * TODO: only takes CW/CCW. Make sure which. Flip direction if needed.
   */
  polygon(points: Vec2[], color: Vec4): void;

  /**
   * Draw given list of triangles.
   */
  triangles(points: Vec2[], color: Vec4): void;

  /**
   * Draw rectangle.
   */
  rectangle(position: Vec2, size: Vec2, color: Vec4): void;

  /**
   * Clears the screen.
   */
  clear(): void;

  /**
   * Sets projection matrix to orthographic with given dimensions.
   * Y axis is flipped - point `(0, 0)` is in the top left.
   */
  setProjection(x: number, y: number, width: number, height: number): void;

  /**
   * Writes text on the screen.
   */
  text(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string
  ): void;

  /**
   * Renders to screen and resets buffers.
   */
  flush(): void;

  /**
   * Load texture to GPU memory.
   */
  loadTexture(image: HTMLImageElement): WebGLTexture;
}

/**
 * Context is a low level drawing API, resembling Canvas API from browsers.
 * Used by layout engine to draw elements. This is a reference implementation
 * that should work well in most cases.
 */
export class Context implements IContext {
  public readonly gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;

  private positions: Vec2[] = [];
  private uvs: Vec2[] = [];
  private colors: Vec4[] = [];

  private fontAtlasTexture: WebGLTexture | null = null;

  private vao: WebGLVertexArrayObject | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private uvBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;

  private projection: { x: number; y: number; width: number; height: number } =
    {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

  /**
   * Creates new context.
   */
  constructor(canvas: HTMLCanvasElement, private font: Font) {
    const context = canvas.getContext("webgl2");
    invariant(context, "WebGL2 context creation failed.");
    this.gl = context;

    const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
    invariant(vertexShader, "Vertex shader creation failed.");
    const fragmentShader = createShader(
      context,
      context.FRAGMENT_SHADER,
      fragment
    );
    invariant(fragmentShader, "Fragment shader creation failed.");

    const program = createProgram(context, vertexShader, fragmentShader);
    invariant(program, "Program creation failed.");
    this.program = program;

    const fontAtlasImage = font.getFontImage();
    invariant(fontAtlasImage, "Font atlas image is missing.");
    this.fontAtlasTexture = this.loadTexture(fontAtlasImage);

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.vao = this.gl.createVertexArray();
    this.positionBuffer = this.gl.createBuffer();
    this.uvBuffer = this.gl.createBuffer();
    this.colorBuffer = this.gl.createBuffer();
    this.setProjection(0, 0, canvas.clientWidth, canvas.clientHeight);
  }

  getCanvas(): HTMLCanvasElement {
    return this.gl.canvas as HTMLCanvasElement;
  }

  /**
   * Checks if whole mesh will not be visible on the screen.
   */
  isOutsideOfTheScreen(vertices: Vec2[]): boolean {
    return false; // For now turned off as it doesn't seem to work well with the roads.

    return vertices.every((v) => {
      return (
        v.x < this.projection.x ||
        v.x > this.projection.width ||
        v.y < this.projection.y ||
        v.y > this.projection.height
      );
    });
  }

  line(points: Vec2[], thickness: number, color: Vec4): void {
    invariant(points.length >= 2, "Line must have at least 2 points.");

    const vertices = triangulateLine(points, thickness);

    if (this.isOutsideOfTheScreen(vertices)) {
      return;
    }

    this.positions.push(...vertices.reverse());
    this.uvs.push(...vertices.map(() => NO_TEXTURE));
    this.colors.push(...vertices.map(() => color));
  }

  polygon(points: Vec2[], color: Vec4): void {
    invariant(points.length >= 3, "Polygon must have at least 3 points.");

    const vertices = points.length === 3 ? points : triangulatePolygon(points);
    invariant(vertices.length % 3 === 0, "Triangles must have 3 points.");

    if (this.isOutsideOfTheScreen(vertices)) {
      return;
    }

    this.positions.push(...vertices);
    this.uvs.push(...vertices.map(() => NO_TEXTURE));
    this.colors.push(...vertices.map(() => color));
  }

  triangles(points: Vec2[], color: Vec4): void {
    invariant(points.length >= 3, "Triangles must have at least 3 points.");
    invariant(points.length % 3 === 0, "Points array must be divisive by 3.");

    if (this.isOutsideOfTheScreen(points)) {
      return;
    }

    this.positions.push(...points);
    this.uvs.push(...points.map(() => NO_TEXTURE));
    this.colors.push(...points.map(() => color));
  }

  rectangle(position: Vec2, size: Vec2, color: Vec4): void {
    const vertices = [
      new Vec2(position.x, position.y),
      new Vec2(position.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y),

      new Vec2(position.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y),
    ];

    if (this.isOutsideOfTheScreen(vertices)) {
      return;
    }

    this.positions.push(...vertices);
    this.uvs.push(...vertices.map(() => NO_TEXTURE));
    this.colors.push(...vertices.map(() => color));
  }

  clear(): void {
    invariant(this.gl, "WebGL context does not exist.");

    // https://www.khronos.org/webgl/wiki/HandlingHighDPI
    const canvas = this.getCanvas();
    const scale = window.devicePixelRatio;

    if (canvas.style.width !== `${canvas.clientWidth}px`) {
      canvas.style.width = `${canvas.clientWidth}px`;
    }

    if (canvas.style.height !== `${canvas.clientHeight}px`) {
      canvas.style.height = `${canvas.clientHeight}px`;
    }

    if (canvas.width !== canvas.clientWidth * scale) {
      canvas.width = canvas.clientWidth * scale;
    }

    if (canvas.height !== canvas.clientHeight * scale) {
      canvas.height = canvas.clientHeight * scale;
    }

    this.gl.clearColor(0, 0, 0, 1);
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  setProjection(x: number, y: number, width: number, height: number): void {
    invariant(this.program, "Program does not exist.");
    invariant(this.gl, "WebGL context does not exist.");
    invariant(width >= 0, "Width must be positive.");
    invariant(height >= 0, "Height must be positive.");

    this.projection = { x, y, width, height };

    const matrixLocation = this.gl.getUniformLocation(this.program, "u_matrix");
    const orthographic = Mat4.orthographic(0, width, height, 0, 0, 1);
    const translate = Mat4.translate(x, y, 0);
    const flipped = orthographic
      .multiply(translate)
      .multiply(Mat4.scale(1, 1, 1));

    this.gl.useProgram(this.program);
    this.gl.uniformMatrix4fv(
      matrixLocation,
      false,
      new Float32Array(flipped.data)
    );
  }

  text(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string
  ): void {
    const metadata = this.font.getMetadata();

    invariant(
      typeof color === "string",
      `Color must be a string. Found: ${JSON.stringify(color)}.`
    );
    const parsedColor = parseColor(color);

    invariant(this.program, "Program does not exist.");
    invariant(this.fontAtlasTexture, "Font atlas texture does not exist.");
    invariant(metadata, "Font metadata does not exist.");

    const layout = this.font.getTextLayout(text, fontSize);

    if (DEBUG_TEXT_RENDERING_SHOW_CAPSIZE) {
      this.rectangle(
        new Vec2(x, y),
        new Vec2(
          layout.boundingRectangle.width,
          layout.boundingRectangle.height
        ),
        new Vec4(1, 0, 1, 0.3)
      );
    }

    const textUVs = text.split("").map((c) => this.font.getUV(c.charCodeAt(0)));

    for (let i = 0; i < layout.positions.length; i++) {
      const position = layout.positions[i].add(new Vec2(x, y));
      const size = layout.sizes[i];

      const vertices = [
        new Vec2(position.x, position.y),
        new Vec2(position.x, position.y + size.y),
        new Vec2(position.x + size.x, position.y),

        new Vec2(position.x, position.y + size.y),
        new Vec2(position.x + size.x, position.y + size.y),
        new Vec2(position.x + size.x, position.y),
      ];

      if (DEBUG_TEXT_RENDERING_SHOW_GLYPHS) {
        this.rectangle(
          new Vec2(position.x, position.y),
          size,
          new Vec4(0, 1, 0, 0.3)
        );
      }

      const uv = textUVs[i];
      invariant(uv, "UV does not exist.");

      const uvs = [
        new Vec2(uv.x, uv.y),
        new Vec2(uv.x, uv.y + uv.w),
        new Vec2(uv.x + uv.z, uv.y),

        new Vec2(uv.x, uv.y + uv.w),
        new Vec2(uv.x + uv.z, uv.y + uv.w),
        new Vec2(uv.x + uv.z, uv.y),
      ];

      this.positions.push(...vertices);
      this.uvs.push(...uvs);
      this.colors.push(...vertices.map(() => parsedColor));
    }
  }

  flush(): void {
    invariant(this.program, "Program does not exist.");
    invariant(this.gl, "WebGL context does not exist.");
    invariant(
      this.positions.length === this.colors.length,
      "Buffers are not equal in size."
    );
    invariant(
      this.positions.length % 3 === 0,
      "Buffers are not divisible by 3."
    );
    invariant(
      this.positions.length === this.uvs.length &&
        this.uvs.length === this.colors.length,
      "Buffers are not equal in size."
    );

    if (this.positions.length === 0) {
      return;
    }

    const positionData = new Float32Array(
      this.positions.map((v) => [v.x, v.y]).flat()
    );
    const uvData = new Float32Array(this.uvs.map((v) => [v.x, v.y]).flat());
    const colorData = new Float32Array(
      this.colors.map((v) => [v.x, v.y, v.z, v.w]).flat()
    );

    invariant(this.vao, "VAO is missing");
    this.gl.bindVertexArray(this.vao);

    const POSITION_SIZE = 2;
    const UV_SIZE = 2;
    const COLOR_SIZE = 4;

    // TODO: revisit possibility of using one buffer with stride.

    // Set up position buffer.

    invariant(this.positionBuffer, "Position VBO is missing.");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positionData, this.gl.STATIC_DRAW);

    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, POSITION_SIZE, this.gl.FLOAT, false, 0, 0);

    // Set up uv buffer.

    invariant(this.uvBuffer, "UV VBO is missing.");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, uvData, this.gl.STATIC_DRAW);

    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(1, UV_SIZE, this.gl.FLOAT, false, 0, 0);

    // Set up color buffer.

    invariant(this.colorBuffer, "Color VBO is missing.");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colorData, this.gl.STATIC_DRAW);

    this.gl.enableVertexAttribArray(2);
    this.gl.vertexAttribPointer(2, COLOR_SIZE, this.gl.FLOAT, false, 0, 0);

    // Render.
    invariant(this.program, "Program does not exist.");

    this.gl.useProgram(this.program);
    this.gl.bindVertexArray(this.vao);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.positions.length);

    this.positions = [];
    this.uvs = [];
    this.colors = [];
  }

  debugDrawFontAtlas(): void {
    const position = new Vec2(0, 0);
    const size = new Vec2(300, 300);
    const color = new Vec4(1, 1, 1, 1);

    const vertices = [
      new Vec2(position.x, position.y),
      new Vec2(position.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y),

      new Vec2(position.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y),
    ];
    const uvs = [
      new Vec2(0, 0),
      new Vec2(0, 1),
      new Vec2(1, 0),

      new Vec2(0, 1),
      new Vec2(1, 1),
      new Vec2(1, 0),
    ];

    this.positions.push(...vertices);
    this.uvs.push(...uvs);
    this.colors.push(...vertices.map(() => color));
  }

  loadTexture(image: HTMLImageElement): WebGLTexture {
    const texture = this.gl.createTexture();
    invariant(texture, "Texture creation failed.");

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      1,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255])
    );

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );

    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    return texture;
  }
}
