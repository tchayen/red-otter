import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";

export interface Renderer {
  rectangle(
    color: Vec4,
    position: Vec2,
    size: Vec2,
    corners: Vec4,
    clipStart: Vec2,
    clipSize: Vec2,
    clipCorners: Vec4
  ): void;

  render(commandEncoder: GPUCommandEncoder): void;

  text(
    text: string,
    position: Vec2,
    fontName: string,
    fontSize: number,
    color: Vec4,
    textAlignment: "left" | "center" | "right",
    options?: {
      lineHeight?: number;
      maxWidth?: number;
      trimEnd?: Vec2;
      trimStart?: Vec2;
    }
  ): void;
}