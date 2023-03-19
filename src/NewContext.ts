import { invariant } from "./invariant";
import { Vec2 } from "./math/Vec2";
import { Vec4 } from "./math/Vec4";
import { Mat4 } from "./math/Mat4";
import { triangulateLine } from "./math/triangulateLine";
import { triangulatePolygon } from "./math/triangulatePolygon";
import { Font } from "./fonts/Font";
import { parseColor } from "./parseColor";
import { IContext } from "Context";
import { createProgram, createShader } from "./WebGLUtils";

const DEBUG_TEXT_RENDERING_SHOW_CAPSIZE = false;
const DEBUG_TEXT_RENDERING_SHOW_GLYPHS = false;

const vertex = `#version 300 es
layout (location = 0) in vec2 a_position;
layout (location = 1) in vec2 a_uv;
layout (location = 2) in vec4 a_color;
layout (location = 3) in vec2 a_corner;
layout (location = 4) in vec2 a_rectangle_size;
layout (location = 5) in vec4 a_border_radius;

uniform mat4 u_matrix;

out vec2 uv;
out vec4 color;
out vec2 corner;
out vec2 rectangle_size;
out vec4 border_radius;

void main() {
  uv = a_uv;
  color = a_color;
  corner = a_corner;
  rectangle_size = a_rectangle_size;
  border_radius = a_border_radius;

  gl_Position = u_matrix * vec4(a_position, 0, 1);
}`;

const fragment = `#version 300 es
precision mediump float;

in vec2 uv;
in vec4 color;
in vec2 corner;
in vec2 rectangle_size;
in vec4 border_radius;

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
    vec2 center = rectangle_size / 2.0;
    vec2 p = gl_FragCoord.xy - corner - center;
    vec2 size = rectangle_size / 2.0;
    float radius = border_radius.x;

    // Distance from the current pixel to the closest point on the edge of the rounded rectangle.
    vec2 q = abs(p) - (size - vec2(radius));

    float sdf = length(max(vec2(0.0), -q)) + min(max(q.x, q.y), 0.0) - length(max(q, vec2(0.0))) + radius;
    float alpha = 1.0 - smoothstep(0.0, -0.1, sdf);

    frag_color = vec4(color.rgb, alpha * color.a);
  }
}`;

const NO_DATA_VEC2 = new Vec2(-1, -1);
const NO_DATA_VEC4 = new Vec4(-1, -1, -1, -1);

/**
 * Context is a low level drawing API, resembling Canvas API from browsers.
 * Used by layout engine to draw elements. This is a reference implementation
 * that should work well in most cases.
 */
export class NewContext implements IContext {
  public readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram | null = null;

  private positions: Vec2[] = [];
  private uvs: Vec2[] = [];
  private colors: Vec4[] = [];
  private upperLeftCorners: Vec2[] = [];
  private rectangleSizes: Vec2[] = [];
  private borderRadii: Vec4[] = [];

  private readonly fontAtlasTexture: WebGLTexture | null = null;

  private readonly vao: WebGLVertexArrayObject | null = null;
  private readonly positionBuffer: WebGLBuffer | null = null;
  private readonly uvBuffer: WebGLBuffer | null = null;
  private readonly colorBuffer: WebGLBuffer | null = null;
  private readonly upperLeftCornerBuffer: WebGLBuffer | null = null;
  private readonly rectangleSizeBuffer: WebGLBuffer | null = null;
  private readonly borderRadiusBuffer: WebGLBuffer | null = null;

  /**
   * Creates new context.
   */
  constructor(canvas: HTMLCanvasElement, private readonly font: Font) {
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
    this.upperLeftCornerBuffer = this.gl.createBuffer();
    this.rectangleSizeBuffer = this.gl.createBuffer();
    this.borderRadiusBuffer = this.gl.createBuffer();
    this.setProjection(0, 0, canvas.clientWidth, canvas.clientHeight);
  }

  getCanvas(): HTMLCanvasElement {
    return this.gl.canvas as HTMLCanvasElement;
  }

  line(points: Vec2[], thickness: number, color: Vec4): void {
    invariant(points.length >= 2, "Line must have at least 2 points.");

    const vertices = triangulateLine(points, thickness);

    this.positions.push(...vertices.reverse());
    this.uvs.push(...vertices.map(() => NO_DATA_VEC2));
    this.colors.push(...vertices.map(() => color));
    this.upperLeftCorners.push(...vertices.map(() => NO_DATA_VEC2));
    this.rectangleSizes.push(...vertices.map(() => NO_DATA_VEC2));
    this.borderRadii.push(...vertices.map(() => NO_DATA_VEC4));
  }

  polygon(points: Vec2[], color: Vec4): void {
    invariant(points.length >= 3, "Polygon must have at least 3 points.");

    const vertices = points.length === 3 ? points : triangulatePolygon(points);
    invariant(vertices.length % 3 === 0, "Triangles must have 3 points.");

    this.positions.push(...vertices);
    this.uvs.push(...vertices.map(() => NO_DATA_VEC2));
    this.colors.push(...vertices.map(() => color));
    this.upperLeftCorners.push(...vertices.map(() => NO_DATA_VEC2));
    this.rectangleSizes.push(...vertices.map(() => NO_DATA_VEC2));
    this.borderRadii.push(...vertices.map(() => NO_DATA_VEC4));
  }

  triangles(points: Vec2[], color: Vec4): void {
    invariant(points.length >= 3, "Triangles must have at least 3 points.");
    invariant(points.length % 3 === 0, "Points array must be divisive by 3.");

    this.positions.push(...points);
    this.uvs.push(...points.map(() => NO_DATA_VEC2));
    this.colors.push(...points.map(() => color));
    this.upperLeftCorners.push(...points.map(() => NO_DATA_VEC2));
    this.rectangleSizes.push(...points.map(() => NO_DATA_VEC2));
    this.borderRadii.push(...points.map(() => NO_DATA_VEC4));
  }

  rectangle(
    position: Vec2,
    size: Vec2,
    color: Vec4,
    borderRadius?: Vec4
  ): void {
    const vertices = [
      new Vec2(position.x, position.y),
      new Vec2(position.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y),

      new Vec2(position.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y + size.y),
      new Vec2(position.x + size.x, position.y),
    ];

    this.positions.push(...vertices);
    this.uvs.push(...vertices.map(() => NO_DATA_VEC2));
    this.colors.push(...vertices.map(() => color));
    this.upperLeftCorners.push(
      ...vertices.map(
        () => new Vec2(vertices[0].x, 600 - vertices[0].y - size.y)
      )
    );
    this.rectangleSizes.push(...vertices.map(() => size));
    this.borderRadii.push(...vertices.map(() => borderRadius ?? NO_DATA_VEC4));
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
      this.upperLeftCorners.push(...vertices.map(() => NO_DATA_VEC2));
      this.rectangleSizes.push(...vertices.map(() => NO_DATA_VEC2));
      this.borderRadii.push(...vertices.map(() => NO_DATA_VEC4));
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
        this.uvs.length === this.colors.length &&
        this.colors.length === this.upperLeftCorners.length &&
        this.upperLeftCorners.length === this.rectangleSizes.length &&
        this.rectangleSizes.length === this.borderRadii.length,
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

    const upperLeftCornerData = new Float32Array(
      this.upperLeftCorners.map((v) => [v.x, v.y]).flat()
    );

    const rectangleSizeData = new Float32Array(
      this.rectangleSizes.map((v) => [v.x, v.y]).flat()
    );

    const borderRadiusData = new Float32Array(
      this.borderRadii.map((v) => [v.x, v.y, v.z, v.w]).flat()
    );

    invariant(this.vao, "VAO is missing");
    this.gl.bindVertexArray(this.vao);

    const POSITION_SIZE = 2;
    const UV_SIZE = 2;
    const COLOR_SIZE = 4;
    const UPPER_LEFT_CORNER_SIZE = 2;
    const RECTANGLE_SIZE = 2;
    const BORDER_RADIUS_SIZE = 4;

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

    // Set up upper left corner buffer.
    invariant(this.upperLeftCornerBuffer, "Upper left corner VBO is missing.");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.upperLeftCornerBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      upperLeftCornerData,
      this.gl.STATIC_DRAW
    );

    this.gl.enableVertexAttribArray(3);
    this.gl.vertexAttribPointer(
      3,
      UPPER_LEFT_CORNER_SIZE,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Set up rectangle buffer.
    invariant(this.rectangleSizeBuffer, "Rectangle VBO is missing.");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rectangleSizeBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      rectangleSizeData,
      this.gl.STATIC_DRAW
    );

    this.gl.enableVertexAttribArray(4);
    this.gl.vertexAttribPointer(4, RECTANGLE_SIZE, this.gl.FLOAT, false, 0, 0);

    // Set up border radius buffer.
    invariant(this.borderRadiusBuffer, "Border radius VBO is missing.");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.borderRadiusBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      borderRadiusData,
      this.gl.STATIC_DRAW
    );

    this.gl.enableVertexAttribArray(5);
    this.gl.vertexAttribPointer(
      5,
      BORDER_RADIUS_SIZE,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Render.
    invariant(this.program, "Program does not exist.");

    this.gl.useProgram(this.program);
    this.gl.bindVertexArray(this.vao);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.positions.length);

    this.positions = [];
    this.uvs = [];
    this.colors = [];
    this.upperLeftCorners = [];
    this.rectangleSizes = [];
    this.borderRadii = [];
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
