import { describe, expect, it } from "vitest";
import { layout } from "./layout";
import { Vec2 } from "../math/Vec2";
import { paint } from "./paint";
import type { Renderer } from "./Renderer";
import type { Vec4 } from "../math/Vec4";
import * as fixtures from "../fixtures";
import { compose } from "./compose";
import { EventManager } from "../EventManager";
import type { TextAlign } from "../types";
import { UserEventType } from "../types";
import { getByTestId } from "./getByTestId";

describe("paint", () => {
  it("handles scroll", () => {
    const eventManager = new EventManager();
    const ui = new MockRenderer();

    const root = fixtures.displayAndOverflow();

    layout(root, null, new Vec2(1000, 1000));

    compose(ui, root);

    function scroll(delta: Vec2, where: Vec2) {
      eventManager.dispatchEvent({
        delta: delta,
        position: where,
        type: UserEventType.MouseScroll,
      });

      eventManager.deliverEvents(root);
      compose(ui, root);
      paint(ui, root);
    }

    scroll(new Vec2(0, 100), new Vec2(10, 10));
    expect(getByTestId(root, "D-tooTall")?._state.scrollY).toBe(10);

    scroll(new Vec2(100, 0), new Vec2(10, 10));
    expect(getByTestId(root, "D-tooTall")?._state.scrollY).toBe(10);
    expect(getByTestId(root, "D-tooTall")?._state.scrollX).toBe(10);

    scroll(new Vec2(0, 100), new Vec2(240, 150));
    expect(getByTestId(root, "D-overflow")?._state.scrollY).toBe(70);
  });
});

class MockRenderer implements Renderer {
  rectangle(
    _color: Vec4,
    _position: Vec2,
    _size: Vec2,
    _corners: Vec4,
    _borderWidth: Vec4,
    _borderColor: Vec4,
    _clipStart: Vec2,
    _clipSize: Vec2,
    _clipCorners: Vec4,
  ): void {}
  render(_commandEncoder: GPUCommandEncoder): void {}
  text(
    _text: string,
    _position: Vec2,
    _fontName: string,
    _fontSize: number,
    _color: Vec4,
    _textAlignment: TextAlign,
    _clipStart: Vec2,
    _clipSize: Vec2,
    _options?: { lineHeight?: number | undefined; maxWidth?: number | undefined } | undefined,
  ): void {}
}
