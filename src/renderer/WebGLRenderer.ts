import { invariant } from "../utils/invariant";
import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { Mat4 } from "../math/Mat4";
import { triangulateLine } from "../math/triangulateLine";
import { triangulatePolygon } from "../math/triangulatePolygon";
import type { Renderer } from "./Renderer";
import type { Lookups } from "../font/types";
import { shapeText } from "..";
import type { Shape } from "../font/shapeText";
import type { TextAlign } from "../layout/styling";
import { defaultTextStyleProps } from "../layout/styling";
import { MISSING_GLYPH } from "../font/calculateGlyphQuads";

const vertex = `#version 300 es
layout (location = 0) in vec2 a_position;
layout (location = 1) in vec2 a_uv;
layout (location = 2) in vec4 a_color;
layout (location = 3) in vec2 a_corner;
layout (location = 4) in vec2 a_rectangle_size;
layout (location = 5) in vec4 a_border_radius;
layout (location = 6) in vec4 a_border_width;
layout (location = 7) in vec4 a_border_color;

uniform mat4 u_matrix;

out vec2 uv;
out vec4 color;
out vec2 corner;
out vec2 rectangle_size;
out vec4 border_radius;
out vec4 border_width;
out vec4 border_color;

void main() {
  uv = a_uv;
  color = a_color;
  corner = a_corner;
  rectangle_size = a_rectangle_size;
  border_radius = a_border_radius;
  border_width = a_border_width;
  border_color = a_border_color;

  gl_Position = u_matrix * vec4(a_position, 0, 1);
}`;

const fragment = `#version 300 es
precision mediump float;

in vec2 uv;
in vec4 color;
in vec2 corner;
in vec2 rectangle_size;
in vec4 border_radius;
in vec4 border_width;
in vec4 border_color;

out vec4 frag_color;

uniform sampler2D u_texture;

float buffer = 0.5;

float contour(float width, float distance) {
  return smoothstep(buffer - width, buffer + width, distance);
}

float distanceFromRectangle(vec2 p, float radius, vec2 border) {
  // Distance from the current pixel to the closest point on the edge of the rounded rectangle.
  vec2 q = abs(p - border) - (rectangle_size / 2.0) + vec2(radius);
  return length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - radius;
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
  } else if (rectangle_size.x < 0.0) {
    frag_color = color;
  } else {
    vec2 center = rectangle_size / 2.0;
    vec2 p = gl_FragCoord.xy - corner - center;

    // Pick border radius for the current corner.
    float radius = border_radius.w;
    if (p.x > 0.0 && p.y > 0.0) {
      radius = border_radius.y;
    } else if (p.x < 0.0 && p.y > 0.0) {
      radius = border_radius.x;
    } else if (p.x < 0.0 && p.y < 0.0) {
      radius = border_radius.z;
    }

    vec2 border = vec2(0, 0);
    if (p.y > 0.0) {
      border.y -= border_width.x;
    } else {
      border.y += border_width.z;
    }

    if (p.x > 0.0) {
      border.x -= border_width.y;
    } else {
      border.x += border_width.w;
    }

    float border_correction = 0.0;
    if (p.x < 0.0 && p.y < 0.0) {
      border_correction = min(border_width.x, border_width.y);
    } else if (p.x > 0.0 && p.y < 0.0) {
      border_correction = min(border_width.z, border_width.y);
    } else if (p.x < 0.0 && p.y > 0.0) {
      border_correction = min(border_width.x, border_width.w);
    } else if (p.x > 0.0 && p.y > 0.0) {
      border_correction = min(border_width.z, border_width.w);
    }

    float outer_distance = distanceFromRectangle(p, radius, vec2(0.0));
    float inner_distance = distanceFromRectangle(p, radius - border_correction, border);

    frag_color = color;
    if (length(border) > 0.0) {
      frag_color = mix(color, border_color, smoothstep(-0.5, 0.5, inner_distance));
    }

    frag_color.a *= 1.0 - smoothstep(-0.5, 0.5, outer_distance);
  }
}`;

const NO_DATA_VEC2 = new Vec2(-1, -1);
const NO_DATA_VEC4 = new Vec4(-1, -1, -1, -1);

export class WebGLRenderer implements Renderer {
  public readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram | null = null;

  /**
   * Buffer using strides.
   *
   * - **Position** - In pixels `[0, width], [0, height]`.
   * - **UV** - In range `[0, 1]`.
   * - **Color** - In range `[0, 1]`.
   * - **Corner** - Bottom left corner. `new Vec2(-1, -1)` for non-rectangles.
   * - **Rectangle** size - In pixels. `new Vec2(-1, -1)` for non-rectangles.
   * - **Radius** - In pixels. Top, right, bottom, left. `new Vec4(-1, -1, -1, -1)` for
   * non-rectangles. - **Border width** - In pixels. Top, right, bottom, left. `new Vec4(-1, -1,
   * -1, -1)` for non-rectangles. - **Border color** - In range `[0, 1]`.
   */
  private vertexAttributes: Array<number> = [];

  private readonly fontAtlasTexture: WebGLTexture | null = null;

  private readonly vao: WebGLVertexArrayObject | null = null;
  private readonly interleavedBuffer: WebGLBuffer | null = null;

  /**
   * Updated in `clear()`.
   */
  private contextHeight = 0;

  /**
   * Creates new context.
   */
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly context: WebGL2RenderingContext,
    private readonly fontLookups: Lookups,
    fontAtlasTexture: ImageBitmap,
  ) {
    this.gl = context;

    const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
    invariant(vertexShader, "Vertex shader creation failed.");
    const fragmentShader = createShader(context, context.FRAGMENT_SHADER, fragment);
    invariant(fragmentShader, "Fragment shader creation failed.");

    const program = createProgram(context, vertexShader, fragmentShader);
    invariant(program, "Program creation failed.");
    this.program = program;

    this.fontAtlasTexture = this.loadTexture(fontAtlasTexture);

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.vao = this.gl.createVertexArray();
    this.interleavedBuffer = this.gl.createBuffer();

    this.setProjection(0, 0, canvas.clientWidth, canvas.clientHeight);
  }

  line(points: Array<Vec2>, thickness: number, color: Vec4): void {
    invariant(points.length >= 2, "Line must have at least 2 points.");

    const vertices = triangulateLine(points, thickness);

    for (let i = vertices.length - 1; i >= 0; i--) {
      const vertex = vertices[i];
      invariant(vertex, "Vertex does not exist.");
      this.pushVertexData(
        vertex,
        NO_DATA_VEC2,
        color,
        NO_DATA_VEC2,
        NO_DATA_VEC2,
        NO_DATA_VEC4,
        NO_DATA_VEC4,
        NO_DATA_VEC4,
      );
    }
  }

  polygon(points: Array<Vec2>, color: Vec4): void {
    invariant(points.length >= 3, "Polygon must have at least 3 points.");

    const vertices = points.length === 3 ? points : triangulatePolygon(points);
    invariant(vertices.length % 3 === 0, "Triangles must have 3 points.");

    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      invariant(vertex, "Vertex does not exist.");
      this.pushVertexData(
        vertex,
        NO_DATA_VEC2,
        color,
        NO_DATA_VEC2,
        NO_DATA_VEC2,
        NO_DATA_VEC4,
        NO_DATA_VEC4,
        NO_DATA_VEC4,
      );
    }
  }

  triangles(points: Array<Vec2>, color: Vec4): void {
    invariant(points.length >= 3, "Triangles must have at least 3 points.");
    invariant(points.length % 3 === 0, "Points array must be divisive by 3.");

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      invariant(point, "Point does not exist.");
      this.pushVertexData(
        point,
        NO_DATA_VEC2,
        color,
        NO_DATA_VEC2,
        NO_DATA_VEC2,
        NO_DATA_VEC4,
        NO_DATA_VEC4,
        NO_DATA_VEC4,
      );
    }
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

    const scale = window.devicePixelRatio;

    const vertices = [
      new Vec2(position.x, position.y),
      new Vec2(position.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y),

      new Vec2(position.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y),
    ];

    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      invariant(vertex, "Vertex does not exist.");
      this.pushVertexData(
        vertex,
        NO_DATA_VEC2,
        color,
        new Vec2(vertices[0]!.x * scale, (this.contextHeight - vertices[0]!.y - size.y) * scale),
        new Vec2(size.x * scale, size.y * scale),
        new Vec4(corners.x * scale, corners.y * scale, corners.z * scale, corners.w * scale),
        new Vec4(
          borderWidth.x * scale,
          borderWidth.y * scale,
          borderWidth.z * scale,
          borderWidth.w * scale,
        ),
        borderColor,
      );
    }
  }

  clear(): void {
    invariant(this.gl, "WebGL context does not exist.");

    // https://www.khronos.org/webgl/wiki/HandlingHighDPI
    const scale = window.devicePixelRatio;

    if (this.canvas.style.width !== `${this.canvas.clientWidth}px`) {
      this.canvas.style.width = `${this.canvas.clientWidth}px`;
    }

    if (this.canvas.style.height !== `${this.canvas.clientHeight}px`) {
      this.canvas.style.height = `${this.canvas.clientHeight}px`;
    }

    if (this.canvas.width !== this.canvas.clientWidth * scale) {
      this.canvas.width = this.canvas.clientWidth * scale;
    }

    if (this.canvas.height !== this.canvas.clientHeight * scale) {
      this.canvas.height = this.canvas.clientHeight * scale;
    }

    this.contextHeight = this.canvas.clientHeight;

    this.gl.clearColor(0, 0, 0, 1);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  private setProjection(x: number, y: number, width: number, height: number): void {
    invariant(this.program, "Program does not exist.");
    invariant(this.gl, "WebGL context does not exist.");
    invariant(width >= 0, "Width must be positive.");
    invariant(height >= 0, "Height must be positive.");

    const matrixLocation = this.gl.getUniformLocation(this.program, "u_matrix");
    const orthographic = Mat4.orthographic(0, width, height, 0, 0, 1);
    const translate = Mat4.translate(x, y, 0);
    const flipped = orthographic.multiply(translate).multiply(Mat4.scale(1, 1, 1));

    this.gl.useProgram(this.program);
    this.gl.uniformMatrix4fv(matrixLocation, false, new Float32Array(flipped.data));
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
    invariant(this.program, "Program does not exist.");
    invariant(this.fontAtlasTexture, "Font atlas texture does not exist.");
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
        this.fontLookups.uvs.get(`${fontName}-${MISSING_GLYPH.charCodeAt(0)}`)!;
      invariant(uv, "UV does not exist.");

      const vertices = [
        new Vec2(shapePosition.x, shapePosition.y),
        new Vec2(shapePosition.x, shapePosition.y + size.y),
        new Vec2(shapePosition.x + size.x, shapePosition.y),

        new Vec2(shapePosition.x, shapePosition.y + size.y),
        new Vec2(shapePosition.x + size.x, shapePosition.y + size.y),
        new Vec2(shapePosition.x + size.x, shapePosition.y),
      ];

      const uvs = [
        new Vec2(uv.x, uv.y),
        new Vec2(uv.x, uv.y + uv.w),
        new Vec2(uv.x + uv.z, uv.y),

        new Vec2(uv.x, uv.y + uv.w),
        new Vec2(uv.x + uv.z, uv.y + uv.w),
        new Vec2(uv.x + uv.z, uv.y),
      ];

      for (let i = 0; i < vertices.length; i++) {
        const vertex = vertices[i];
        const uv = uvs[i];
        invariant(vertex, "Vertex does not exist.");
        invariant(uv, "UV does not exist.");
        this.pushVertexData(
          vertex,
          uv,
          color,
          NO_DATA_VEC2,
          NO_DATA_VEC2,
          NO_DATA_VEC4,
          NO_DATA_VEC4,
          NO_DATA_VEC4,
        );
      }
    }
  }

  render(): void {
    const VEC_2_SIZE = 2;
    const VEC_4_SIZE = 4;
    const FLOATS_PER_TRIANGLE_RENDERED = VEC_2_SIZE * 2 + VEC_4_SIZE * 5;
    const stride = FLOATS_PER_TRIANGLE_RENDERED * Float32Array.BYTES_PER_ELEMENT;

    invariant(this.program, "Program does not exist.");
    invariant(this.gl, "WebGL context does not exist.");
    invariant(
      this.vertexAttributes.length % FLOATS_PER_TRIANGLE_RENDERED === 0,
      "Buffer is not divisible by number of float parameters needed for each triangle.",
    );

    if (this.vertexAttributes.length === 0) {
      return;
    }

    invariant(this.vao, "VAO is missing");
    this.gl.bindVertexArray(this.vao);

    // Set up interleaved buffer.
    invariant(this.interleavedBuffer, "Interleaved VBO is missing.");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.interleavedBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(this.vertexAttributes),
      this.gl.STATIC_DRAW,
    );

    let offset = 0;

    offset = this.setAttribute(0, VEC_2_SIZE, false, stride, offset);
    offset = this.setAttribute(1, VEC_2_SIZE, false, stride, offset);
    offset = this.setAttribute(2, VEC_4_SIZE, false, stride, offset);
    offset = this.setAttribute(3, VEC_2_SIZE, false, stride, offset);
    offset = this.setAttribute(4, VEC_2_SIZE, false, stride, offset);
    offset = this.setAttribute(5, VEC_4_SIZE, false, stride, offset);
    offset = this.setAttribute(6, VEC_4_SIZE, false, stride, offset);
    this.setAttribute(7, VEC_4_SIZE, false, stride, offset);

    // Render.
    invariant(this.program, "Program does not exist.");

    this.gl.useProgram(this.program);
    this.gl.bindVertexArray(this.vao);

    const triangleCount = this.vertexAttributes.length / FLOATS_PER_TRIANGLE_RENDERED;

    this.gl.drawArrays(this.gl.TRIANGLES, 0, triangleCount);

    this.vertexAttributes = [];
  }

  private loadTexture(image: ImageBitmap): WebGLTexture {
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
      new Uint8Array([0, 0, 255, 255]),
    );

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image,
    );

    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    return texture;
  }

  private setAttribute(
    index: number,
    size: number,
    normalized: boolean,
    stride: number,
    offset: number,
  ): number {
    this.gl.enableVertexAttribArray(index);
    this.gl.vertexAttribPointer(index, size, this.gl.FLOAT, normalized, stride, offset);
    return offset + size * Float32Array.BYTES_PER_ELEMENT;
  }

  private pushVertexData(
    position: Vec2,
    uv: Vec2,
    color: Vec4,
    corner: Vec2,
    size: Vec2,
    radius: Vec4,
    borderWidth: Vec4,
    borderColor: Vec4,
  ): void {
    this.vertexAttributes.push(
      // Position
      position.x,
      position.y,
      // UV
      uv.x,
      uv.y,
      // Color
      color.x,
      color.y,
      color.z,
      color.w,
      // Corner
      corner.x,
      corner.y,
      // Rectangle size
      size.x,
      size.y,
      // Radius
      radius.x,
      radius.y,
      radius.z,
      radius.w,
      // Border width
      borderWidth.x,
      borderWidth.y,
      borderWidth.z,
      borderWidth.w,
      // Border color
      borderColor.x,
      borderColor.y,
      borderColor.z,
      borderColor.w,
    );
  }
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
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
  fragmentShader: WebGLShader,
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
