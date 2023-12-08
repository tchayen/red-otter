import type { Text } from "./Text";
import type { View } from "./View";
import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { intersection } from "../math/utils";
import { Display } from "./styling";
import type { Renderer } from "../renderer/Renderer";

/**
 * TODO: description.
 */
export function compose(
  ui: Renderer,
  node: View | Text,
  clipStart = new Vec2(0, 0),
  clipSize = new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
  scrollOffset = new Vec2(0, 0),
): void {
  if (node._style.display === Display.None) {
    return;
  }

  node._state.clipStart = clipStart;
  node._state.clipSize = clipSize;
  node._state.totalScrollX = scrollOffset.x;
  node._state.totalScrollY = scrollOffset.y;

  const nextScrollOffset = scrollOffset.add(new Vec2(node._state.scrollX, node._state.scrollY));

  const clipped = intersection(
    new Vec4(
      node._state.x - scrollOffset.x,
      node._state.y - scrollOffset.y,
      node._state.clientWidth,
      node._state.clientHeight,
    ),
    new Vec4(clipStart.x, clipStart.y, clipSize.x, clipSize.y),
  );

  let c = node.firstChild;
  while (c) {
    compose(ui, c, clipped.xy(), clipped.zw(), nextScrollOffset);
    c = c.next;
  }
}
