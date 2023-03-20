import { Vec2 } from "./math/Vec2";
import { Vec4 } from "./math/Vec4";

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
   * Triangulates and draws given polygon. Assumes that polygon is convex.
   * Vertices must be in clockwise order.
   */
  polygon(points: Vec2[], color: Vec4): void;

  /**
   * Draw given list of triangles.
   */
  triangles(points: Vec2[], color: Vec4): void;

  /**
   * Draw rectangle.
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
