import { Text } from "./Text";
import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { Display, TextAlign, Whitespace, defaultTextStyleProps } from "./styling";
import { parseColor } from "../utils/parseColor";
import type { Renderer } from "../renderer/Renderer";
import {
  CROSS_AXIS_SIZE,
  SCROLLBAR_COLOR,
  SCROLLBAR_CORNER_COLOR,
  SCROLLBAR_TRACK_COLOR,
  SCROLLBAR_TRACK_HOVER_COLOR,
} from "../consts";
import type { Node } from "./Node";
import { BaseView } from "./BaseView";
import { View } from "./View";

/**
 * Takes a renderer and a root of a tree and commands the renderer to paint it. Used every frame.
 *
 * @param ui renderer instance that will get commands issued to it.
 * @param node root of the tree to paint.
 * @returns
 */
export function paint(ui: Renderer, node: Node) {
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
function paintNode(ui: Renderer, node: Node, clipStart: Vec2, clipSize: Vec2): void {
  const position = new Vec2(node._state.x, node._state.y).subtract(
    new Vec2(node._state.totalScrollX, node._state.totalScrollY),
  );
  if (node instanceof Text) {
    ui.text(
      node.text,
      position,
      node._style.fontName,
      node._style.fontSize ?? defaultTextStyleProps.fontSize,
      parseColor(node._style.color),
      node._style.textAlign ?? TextAlign.Left,
      clipStart,
      clipSize,
      {
        lineHeight: node._style.lineHeight ?? defaultTextStyleProps.lineHeight,
        maxWidth: node._state.textWidthLimit,
        noWrap: node._style.whitespace === Whitespace.NoWrap,
      },
    );
  } else if (node instanceof BaseView) {
    const size = new Vec2(node._state.clientWidth, node._state.clientHeight);

    // Actual rendering.
    ui.rectangle(
      parseColor(node._style.backgroundColor),
      position,
      size,
      new Vec4(
        node._style.borderBottomRightRadius,
        node._style.borderBottomLeftRadius,
        node._style.borderTopLeftRadius,
        node._style.borderTopRightRadius,
      ),
      new Vec4(
        node._style.borderBottomWidth,
        node._style.borderRightWidth,
        node._style.borderTopWidth,
        node._style.borderLeftWidth,
      ),
      parseColor(node._style.borderColor),
      clipStart,
      clipSize,
      new Vec4(0, 0, 0, 0),
    );

    if (node instanceof View) {
      const scrollbarRadius = CROSS_AXIS_SIZE / 2;
      // Scrollbar.
      if (node._state.hasVerticalScrollbar && node._state.hasHorizontalScrollbar) {
        ui.rectangle(
          parseColor(SCROLLBAR_CORNER_COLOR),
          position.add(new Vec2(size.x, size.y)),
          new Vec2(CROSS_AXIS_SIZE, CROSS_AXIS_SIZE),
          new Vec4(0, 0, 0, 0),
          new Vec4(0, 0, 0, 0),
          new Vec4(0, 0, 0, 0),
          clipStart,
          clipSize,
          new Vec4(0, 0, 0, 0),
        );
      }
      if (node._state.hasVerticalScrollbar) {
        const scrollbarSize = size.y;
        const scrollbarTrackColor =
          node._scrolling.yHovered || node._scrolling.yActive
            ? SCROLLBAR_TRACK_HOVER_COLOR
            : SCROLLBAR_TRACK_COLOR;

        ui.rectangle(
          parseColor(SCROLLBAR_COLOR),
          position.add(new Vec2(size.x, 0)),
          new Vec2(CROSS_AXIS_SIZE, scrollbarSize),
          new Vec4(0, 0, 0, 0),
          new Vec4(0, 0, 0, 0),
          new Vec4(0, 0, 0, 0),
          clipStart,
          clipSize,
          new Vec4(0, 0, 0, 0),
        );

        const scrollTrackSize =
          (node._state.clientHeight / node._state.scrollHeight) * scrollbarSize;
        const scrollTrackPosition =
          (node._state.scrollY / node._state.scrollHeight) * scrollbarSize;

        ui.rectangle(
          parseColor(scrollbarTrackColor),
          position.add(new Vec2(size.x, scrollTrackPosition)),
          new Vec2(CROSS_AXIS_SIZE, scrollTrackSize),
          new Vec4(scrollbarRadius, scrollbarRadius, scrollbarRadius, scrollbarRadius),
          new Vec4(0, 0, 0, 0),
          new Vec4(0, 0, 0, 0),
          clipStart,
          clipSize,
          new Vec4(0, 0, 0, 0),
        );
      }
      if (node._state.hasHorizontalScrollbar) {
        const scrollbarSize = size.x;
        const scrollbarTrackColor =
          node._scrolling.xHovered || node._scrolling.xActive
            ? SCROLLBAR_TRACK_HOVER_COLOR
            : SCROLLBAR_TRACK_COLOR;

        ui.rectangle(
          parseColor(SCROLLBAR_COLOR),
          position.add(new Vec2(0, size.y)),
          new Vec2(scrollbarSize, CROSS_AXIS_SIZE),
          new Vec4(0, 0, 0, 0),
          new Vec4(0, 0, 0, 0),
          new Vec4(0, 0, 0, 0),
          clipStart,
          clipSize,
          new Vec4(0, 0, 0, 0),
        );

        const scrollTrackSize = (node._state.clientWidth / node._state.scrollWidth) * scrollbarSize;
        const scrollTrackPosition = (node._state.scrollX / node._state.scrollWidth) * scrollbarSize;

        ui.rectangle(
          parseColor(scrollbarTrackColor),
          position.add(new Vec2(scrollTrackPosition, size.y)),
          new Vec2(scrollTrackSize, CROSS_AXIS_SIZE),
          new Vec4(scrollbarRadius, scrollbarRadius, scrollbarRadius, scrollbarRadius),
          new Vec4(0, 0, 0, 0),
          new Vec4(0, 0, 0, 0),
          clipStart,
          clipSize,
          new Vec4(0, 0, 0, 0),
        );
      }
    }
  }
}
