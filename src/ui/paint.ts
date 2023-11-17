import { Text } from "../Text";
import { View } from "../View";
import { DEFAULT_FONT_SIZE, DEFAULT_LINE_HEIGHT_MULTIPLIER } from "../consts";
import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { parseColor } from "../utils/parseColor";
import { Renderer } from "./Renderer";

// TODO: probably construct an array and sort by z-index.
export function paint(ui: Renderer, root: View): void {
  _paint(
    ui,
    root,
    new Vec2(0, 0),
    new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
    new Vec2(0, 0)
  );
}

export function _paint(
  ui: Renderer,
  root: View | Text,
  clipStart: Vec2,
  clipSize: Vec2,
  scrollOffset: Vec2
): void {
  if (root._style.display === "none") {
    return;
  }

  paintNode(ui, root, clipStart, clipSize, scrollOffset);

  let c = root.firstChild;
  while (c) {
    const childClipStart =
      root._style.overflow === "scroll" || root._style.overflow === "hidden"
        ? new Vec2(root._state.metrics.x, root._state.metrics.y)
        : clipStart;
    const childClipSize =
      root._style.overflow === "scroll" || root._style.overflow === "hidden"
        ? new Vec2(root._state.metrics.width, root._state.metrics.height)
        : clipSize;

    _paint(ui, c, childClipStart, childClipSize, scrollOffset.add(root._state.scrollOffset));
    c = c.next;
  }
}

/**
 * `clipStart` and `clipSize` determine part of the screen (in screen space coordinates) that can
 * be renderered to for this node.
 */
function paintNode(
  ui: Renderer,
  node: View | Text,
  clipStart: Vec2,
  clipSize: Vec2,
  cumulativeScroll: Vec2
): void {
  const position = new Vec2(node._state.metrics.x, node._state.metrics.y).subtract(
    cumulativeScroll
  );
  if (node instanceof Text) {
    ui.text(
      node.text,
      position,
      node._style.fontName,
      node._style.fontSize ?? DEFAULT_FONT_SIZE,
      parseColor(node._style.color),
      node._style.textAlign ?? "left",
      {
        lineHeight:
          node._style.lineHeight ??
          DEFAULT_LINE_HEIGHT_MULTIPLIER * (node._style.fontSize ?? DEFAULT_FONT_SIZE),
        maxWidth: node._state.textWidthLimit,
      }
    );
  } else {
    let size = new Vec2(node._state.metrics.width, node._state.metrics.height);

    const scrolls = node._style.overflow === "scroll";
    if (scrolls) {
      size = size.subtract(new Vec2(10, 0));
    }

    // Actual rendering.
    ui.rectangle(
      parseColor(node._style.backgroundColor),
      position,
      size,
      new Vec4(0, 0, 0, 0),
      clipStart,
      clipSize,
      new Vec4(0, 0, 0, 0)
    );

    // Scrollbar.
    if (scrolls) {
      ui.rectangle(
        parseColor("#ff00ff"),
        position.add(new Vec2(size.x - 10, 0)),
        new Vec2(10, size.y),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );

      const scrollTrackSize =
        (node._state.metrics.height / node._state.scrollableContentSize.y) * size.y;
      const scrollTrackPosition =
        (node._state.scrollOffset.y / node._state.scrollableContentSize.y) * size.y;

      ui.rectangle(
        parseColor("#00ffff"),
        position.add(new Vec2(size.x - 10, scrollTrackPosition)),
        new Vec2(10, scrollTrackSize),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
  }
}
