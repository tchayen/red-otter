import { Text } from "../Text";
import { View } from "../View";
import { DEFAULT_FONT_SIZE, DEFAULT_LINE_HEIGHT_MULTIPLIER } from "../consts";
import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { Display, Overflow } from "../types";
import { parseColor } from "../utils/parseColor";
import { Renderer } from "./Renderer";
import {
  CROSS_AXIS_SIZE,
  SCROLLBAR_COLOR,
  SCROLLBAR_CORNER_COLOR,
  SCROLLBAR_TRACK_COLOR,
} from "./consts";

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
  node: View | Text,
  clipStart: Vec2,
  clipSize: Vec2,
  scrollOffset: Vec2
): void {
  if (node._style.display === Display.None) {
    return;
  }

  paintNode(ui, node, clipStart, clipSize, scrollOffset);

  const nextScrollOffset = scrollOffset.add(node._state.scrollOffset);

  const shouldClip =
    node._style.overflowX === Overflow.Scroll ||
    node._style.overflowY === Overflow.Scroll ||
    node._style.overflow === Overflow.Hidden;
  const availableHorizontal =
    node._style.overflowX === Overflow.Scroll
      ? node._state.metrics.width - CROSS_AXIS_SIZE
      : node._state.metrics.width;
  const availableVertical =
    node._style.overflowY === Overflow.Scroll
      ? node._state.metrics.height - CROSS_AXIS_SIZE
      : node._state.metrics.height;
  const childClipStart = shouldClip
    ? new Vec2(
        Math.max(node._state.metrics.x, clipStart.x),
        Math.max(node._state.metrics.y, clipStart.y)
      )
    : clipStart.subtract(scrollOffset);
  let childClipSize = shouldClip
    ? new Vec2(Math.min(availableHorizontal, clipSize.x), Math.min(availableVertical, clipSize.y))
    : clipSize;
  const scrollBarDifference = new Vec2(
    node._style.overflowX === Overflow.Scroll ? CROSS_AXIS_SIZE : 0,
    node._style.overflowY === Overflow.Scroll ? CROSS_AXIS_SIZE : 0
  );
  childClipSize = childClipSize.subtract(scrollBarDifference);

  let c = node.firstChild;
  while (c) {
    _paint(ui, c, childClipStart, childClipSize, nextScrollOffset);
    c = c.next;
  }
}

/**
 * `clipStart` and `clipSize` determine part of the screen (in screen space coordinates) that can
 * be renderered to for this node. They need to be adjusted for the node's position, scroll offset
 * and size.
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

    if (node._style.overflowX === Overflow.Scroll) {
      size = size.subtract(new Vec2(CROSS_AXIS_SIZE, 0));
    }
    if (node._style.overflowY === Overflow.Scroll) {
      size = size.subtract(new Vec2(0, CROSS_AXIS_SIZE));
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
    if (node._style.overflow === Overflow.Scroll) {
      ui.rectangle(
        parseColor(SCROLLBAR_CORNER_COLOR),
        position.add(new Vec2(size.x - CROSS_AXIS_SIZE, size.y - CROSS_AXIS_SIZE)),
        new Vec2(CROSS_AXIS_SIZE, CROSS_AXIS_SIZE),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
    if (node._style.overflowX === Overflow.Scroll) {
      const scrollbarSize =
        node._style.overflowY === Overflow.Scroll ? size.y - CROSS_AXIS_SIZE : size.y;

      ui.rectangle(
        parseColor(SCROLLBAR_COLOR),
        position.add(new Vec2(size.x - CROSS_AXIS_SIZE, 0)),
        new Vec2(CROSS_AXIS_SIZE, scrollbarSize),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );

      const scrollTrackSize =
        (node._state.metrics.height / node._state.scrollSize.y) * scrollbarSize;
      const scrollTrackPosition =
        (node._state.scrollOffset.y / node._state.scrollSize.y) * scrollbarSize;

      ui.rectangle(
        parseColor(SCROLLBAR_TRACK_COLOR),
        position.add(new Vec2(size.x - CROSS_AXIS_SIZE, scrollTrackPosition)),
        new Vec2(CROSS_AXIS_SIZE, scrollTrackSize),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
    if (node._style.overflowY === Overflow.Scroll) {
      const scrollbarSize =
        node._style.overflowX === Overflow.Scroll ? size.x - CROSS_AXIS_SIZE : size.x;

      ui.rectangle(
        parseColor(SCROLLBAR_COLOR),
        position.add(new Vec2(0, size.y - CROSS_AXIS_SIZE)),
        new Vec2(scrollbarSize, CROSS_AXIS_SIZE),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );

      const scrollTrackSize =
        (node._state.metrics.width / node._state.scrollSize.x) * scrollbarSize;
      const scrollTrackPosition =
        (node._state.scrollOffset.x / node._state.scrollSize.x) * scrollbarSize;

      ui.rectangle(
        parseColor(SCROLLBAR_TRACK_COLOR),
        position.add(new Vec2(scrollTrackPosition, size.y - CROSS_AXIS_SIZE)),
        new Vec2(scrollTrackSize, CROSS_AXIS_SIZE),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
  }
}
