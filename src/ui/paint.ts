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
    new Vec2(0, 0),
    false,
    false
  );
}

export function _paint(
  ui: Renderer,
  node: View | Text,
  clipStart: Vec2,
  clipSize: Vec2,
  scrollOffset: Vec2,
  hasParentHorizontalScroll: boolean,
  hasParentVerticalScroll: boolean
): void {
  if (node._style.display === Display.None) {
    return;
  }

  paintNode(
    ui,
    node,
    clipStart,
    clipSize,
    scrollOffset,
    hasParentHorizontalScroll,
    hasParentVerticalScroll
  );

  const hasHorizontalScroll = node._style.overflowX === Overflow.Scroll;
  const hasVerticalScroll = node._style.overflowY === Overflow.Scroll;

  const nextScrollOffset = scrollOffset.add(new Vec2(node._state.scrollX, node._state.scrollY));

  const shouldClip =
    hasHorizontalScroll || hasVerticalScroll || node._style.overflow === Overflow.Hidden;

  const childClipStart = shouldClip
    ? new Vec2(Math.max(node._state.x, clipStart.x), Math.max(node._state.y, clipStart.y))
    : clipStart.subtract(scrollOffset);
  // const scrollBarDifference = new Vec2(
  //   hasHorizontalScroll ? CROSS_AXIS_SIZE : 0,
  //   hasVerticalScroll ? CROSS_AXIS_SIZE : 0
  // );
  const scrollBarDifference = new Vec2(0, 0);
  const childClipSize = shouldClip
    ? new Vec2(
        Math.min(node._state.clientWidth - scrollBarDifference.x, clipSize.x),
        Math.min(node._state.clientHeight - scrollBarDifference.y, clipSize.y)
      )
    : clipSize;

  let c = node.firstChild;
  while (c) {
    _paint(
      ui,
      c,
      childClipStart,
      childClipSize,
      nextScrollOffset,
      hasHorizontalScroll,
      hasVerticalScroll
    );
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
  cumulativeScroll: Vec2,
  hasParentHorizontalScroll: boolean,
  hasParentVerticalScroll: boolean
): void {
  const position = new Vec2(node._state.x, node._state.y).subtract(cumulativeScroll);
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
    const size = new Vec2(node._state.clientWidth, node._state.clientHeight);

    const hasHorizontalScroll = node._style.overflowX === Overflow.Scroll;
    const hasVerticalScroll = node._style.overflowY === Overflow.Scroll;

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
        position.add(new Vec2(size.x, size.y)),
        new Vec2(CROSS_AXIS_SIZE, CROSS_AXIS_SIZE),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
    if (hasHorizontalScroll) {
      const scrollbarSize = hasVerticalScroll ? size.y : size.y + CROSS_AXIS_SIZE;

      ui.rectangle(
        parseColor(SCROLLBAR_COLOR),
        position.add(new Vec2(size.x, 0)),
        new Vec2(CROSS_AXIS_SIZE, scrollbarSize),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );

      const scrollTrackSize = (node._state.clientHeight / node._state.scrollHeight) * scrollbarSize;
      const scrollTrackPosition = (node._state.scrollY / node._state.scrollHeight) * scrollbarSize;

      ui.rectangle(
        parseColor(SCROLLBAR_TRACK_COLOR),
        position.add(new Vec2(size.x, scrollTrackPosition)),
        new Vec2(CROSS_AXIS_SIZE, scrollTrackSize),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
    if (hasVerticalScroll) {
      const scrollbarSize = hasHorizontalScroll ? size.x : size.x + CROSS_AXIS_SIZE;

      ui.rectangle(
        parseColor(SCROLLBAR_COLOR),
        position.add(new Vec2(0, size.y)),
        new Vec2(scrollbarSize, CROSS_AXIS_SIZE),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );

      const scrollTrackSize = (node._state.clientWidth / node._state.scrollWidth) * scrollbarSize;
      const scrollTrackPosition = (node._state.scrollX / node._state.scrollWidth) * scrollbarSize;

      ui.rectangle(
        parseColor(SCROLLBAR_TRACK_COLOR),
        position.add(new Vec2(scrollTrackPosition, size.y)),
        new Vec2(scrollTrackSize, CROSS_AXIS_SIZE),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
  }
}
