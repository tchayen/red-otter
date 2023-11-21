import { Text } from "../Text";
import { View } from "../View";
import { Vec2 } from "../math/Vec2";
import { Display, Overflow } from "../types";
import { Renderer } from "./Renderer";

export function compose(
  ui: Renderer,
  node: View | Text,
  clipStart = new Vec2(0, 0),
  clipSize = new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
  scrollOffset = new Vec2(0, 0)
): void {
  if (node._style.display === Display.None) {
    return;
  }

  // TODO: finish this, turn this into compose() and then make separate pass for painting.
  node._state.clipStart = clipStart;
  node._state.clipSize = clipSize;
  node._state.totalScrollX = scrollOffset.x;
  node._state.totalScrollY = scrollOffset.y;
  //
  const hasHorizontalScroll = node._style.overflowX === Overflow.Scroll;
  const hasVerticalScroll = node._style.overflowY === Overflow.Scroll;

  const nextScrollOffset = scrollOffset.add(new Vec2(node._state.scrollX, node._state.scrollY));

  const shouldClip =
    hasHorizontalScroll || hasVerticalScroll || node._style.overflow === Overflow.Hidden;

  const childClipStart = shouldClip
    ? new Vec2(Math.max(node._state.x, clipStart.x), Math.max(node._state.y, clipStart.y))
    : clipStart.subtract(scrollOffset);
  const scrollBarDifference = new Vec2(0, 0);
  const childClipSize = shouldClip
    ? new Vec2(
        Math.min(node._state.clientWidth - scrollBarDifference.x, clipSize.x),
        Math.min(node._state.clientHeight - scrollBarDifference.y, clipSize.y)
      )
    : clipSize;

  let c = node.firstChild;
  while (c) {
    compose(ui, c, childClipStart, childClipSize, nextScrollOffset);
    c = c.next;
  }
}
