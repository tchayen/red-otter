import type { Vec2 } from "../math/Vec2";
import type { Vec4 } from "../math/Vec4";
import type { TextAlign } from "../layout/styling";

export interface Renderer {
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
  ): void;

  render(commandEncoder: GPUCommandEncoder): void;

  text(
    text: string,
    position: Vec2,
    fontName: string,
    fontSize: number,
    color: Vec4,
    textAlignment: TextAlign,
    clipStart: Vec2,
    clipSize: Vec2,
    options?: { lineHeight?: number; maxWidth?: number },
  ): void;
}
