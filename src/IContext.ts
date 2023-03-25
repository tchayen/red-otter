import { Font } from "./fonts/Font";
import { Vec2 } from "./math/Vec2";
import { Vec4 } from "./math/Vec4";

export interface IContext {
  /**
   * Get canvas element.
   */
  getCanvas(): HTMLCanvasElement;

  /**
   * Get font.
   */
  getFont(): Font;

  /**
   * Draw line connecting given list of points.
   */
  line(points: Vec2[], thickness: number, color: Vec4): void;

  /**
   * Triangulates and draws given polygon. Assumes that polygon is convex.
   * Vertices must be in clockwise order.
   */
  polygon(points: Vec2[], color: Vec4): void;

  /**
   * Draw given list of triangles.
   */
  triangles(points: Vec2[], color: Vec4): void;

  /**
   * Draw rectangle. Border radius is optional and needs to be specified for
   * each corner, in order: top-left, top-right, bottom-right, bottom-left.
   * Border width is specified for each edge, in order: top, right, bottom,
   * left.
   *
   * Color and border color are normalized RGBA vectors, ie.
   * `new Vec4(1, 0, 0, 1)` is red.
   */
  rectangle(
    position: Vec2,
    size: Vec2,
    color: Vec4,
    borderRadius?: Vec4,
    borderWidth?: Vec4,
    borderColor?: Vec4
  ): void;

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
   *
   * Optionally accepts `trimStart` and `trimEnd`, which represent top left and
   * bottom right corners of the text bounding box. Text will be trimmed to fit
   * inside the box.
   */
  text(
    text: string,
    position: Vec2,
    fontSize: number,
    color: Vec4,
    trimStart?: Vec2,
    trimEnd?: Vec2
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
