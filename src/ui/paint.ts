import { Text } from "../Text";
import type { View } from "../View";
import { DEFAULT_FONT_SIZE, DEFAULT_LINE_HEIGHT_MULTIPLIER } from "../consts";
import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { Display, Overflow } from "../types";
import { parseColor } from "../utils/parseColor";
import type { Renderer } from "./Renderer";
import {
  CROSS_AXIS_SIZE,
  SCROLLBAR_COLOR,
  SCROLLBAR_CORNER_COLOR,
  SCROLLBAR_TRACK_COLOR,
} from "./consts";

// TODO: probably construct an array and sort by z-index.
export function paint(ui: Renderer, node: View | Text) {
  if (node._style.display === Display.None) {
    return;
  }

  paintNode(ui, node, node._state.clipStart, node._state.clipSize);

  let c = node.firstChild;
  while (c) {
    paint(ui, c);
    c = c.next;
  }
}

/**
 * `clipStart` and `clipSize` determine part of the screen (in screen space coordinates) that can
 * be renderered to for this node. They need to be adjusted for the node's position, scroll offset
 * and size.
 */
function paintNode(ui: Renderer, node: View | Text, clipStart: Vec2, clipSize: Vec2): void {
  const position = new Vec2(node._state.x, node._state.y).subtract(
    new Vec2(node._state.totalScrollX, node._state.totalScrollY)
  );
  if (node instanceof Text) {
    ui.text(
      node.text,
      position,
      node._style.fontName,
      node._style.fontSize ?? DEFAULT_FONT_SIZE,
      parseColor(node._style.color),
      node._style.textAlign ?? "left",
      clipStart,
      clipSize,
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
      new Vec4(
        node._style.borderTopLeftRadius,
        node._style.borderTopRightRadius,
        node._style.borderBottomRightRadius,
        node._style.borderBottomLeftRadius
      ),
      new Vec4(
        node._style.borderBottomWidth,
        node._style.borderRightWidth,
        node._style.borderTopWidth,
        node._style.borderLeftWidth
      ),
      parseColor(node._style.borderColor),
      clipStart,
      clipSize,
      new Vec4(0, 0, 0, 0)
    );

    const scrollbarRadius = CROSS_AXIS_SIZE / 2;
    // Scrollbar.

    // if (node.props.testID === "body") {
    //   console.log("paintNode", node._state);
    // }
    if (hasVerticalScroll && hasHorizontalScroll) {
      ui.rectangle(
        parseColor(SCROLLBAR_CORNER_COLOR),
        position.add(new Vec2(size.x, size.y)),
        new Vec2(CROSS_AXIS_SIZE, CROSS_AXIS_SIZE),
        new Vec4(0, 0, 0, 0),
        new Vec4(0, 0, 0, 0),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
    if (hasVerticalScroll) {
      const scrollbarSize = size.y;

      ui.rectangle(
        parseColor(SCROLLBAR_COLOR),
        position.add(new Vec2(size.x, 0)),
        new Vec2(CROSS_AXIS_SIZE, scrollbarSize),
        new Vec4(0, 0, 0, 0),
        new Vec4(0, 0, 0, 0),
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
        new Vec4(scrollbarRadius, scrollbarRadius, scrollbarRadius, scrollbarRadius),
        new Vec4(0, 0, 0, 0),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
    if (hasHorizontalScroll) {
      const scrollbarSize = size.x;

      ui.rectangle(
        parseColor(SCROLLBAR_COLOR),
        position.add(new Vec2(0, size.y)),
        new Vec2(scrollbarSize, CROSS_AXIS_SIZE),
        new Vec4(0, 0, 0, 0),
        new Vec4(0, 0, 0, 0),
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
        new Vec4(scrollbarRadius, scrollbarRadius, scrollbarRadius, scrollbarRadius),
        new Vec4(0, 0, 0, 0),
        new Vec4(0, 0, 0, 0),
        clipStart,
        clipSize,
        new Vec4(0, 0, 0, 0)
      );
    }
  }
}
