import { describe, it, vi } from "vitest";
import { View } from "../View";
import { layout } from "./layout";
import { Vec2 } from "../math/Vec2";
import { paint } from "./paint";
import { Renderer } from "./Renderer";
import { Vec4 } from "../math/Vec4";
import { Overflow } from "../types";

describe("paint", () => {
  it("handles scroll", () => {
    const root = new View({
      style: { backgroundColor: "#000", height: 300, overflow: Overflow.Scroll, width: 300 },
    });
    const tooTall = new View({ style: { backgroundColor: "#ff0000", height: 600, width: 200 } });
    root.add(tooTall);

    layout(root, null, new Vec2(300, 300));

    root._state.scrollX = 0;
    root._state.scrollY = 100;

    const ui = new MockRenderer();
    const rectangle = vi.spyOn(ui, "rectangle");

    paint(ui, root);

    // expect(rectangle).toHaveBeenCalledWith(
    //   new Vec4(1, 0, 0, 1),
    //   new Vec2(0, -100),
    //   new Vec2(200, 600),
    //   new Vec4(0, 0, 0, 0),
    //   new Vec2(0, 0),
    //   new Vec2(300, 300),
    //   new Vec4(0, 0, 0, 0)
    // );
  });
});

class MockRenderer implements Renderer {
  rectangle(
    _color: Vec4,
    _position: Vec2,
    _size: Vec2,
    _corners: Vec4,
    _clipStart: Vec2,
    _clipSize: Vec2,
    _clipCorners: Vec4
  ): void {}
  render(_commandEncoder: GPUCommandEncoder): void {}
  text(
    _text: string,
    _position: Vec2,
    _fontName: string,
    _fontSize: number,
    _color: Vec4,
    _textAlignment: "left" | "right" | "center",
    _options?:
      | {
          lineHeight?: number | undefined;
          maxWidth?: number | undefined;
          trimEnd?: Vec2 | undefined;
          trimStart?: Vec2 | undefined;
        }
      | undefined
  ): void {}
}
