import { ScrollableRenderer } from "../ScrollableRenderer";
import { Text } from "../Text";
import { View } from "../View";
import { DEFAULT_FONT_SIZE, DEFAULT_LINE_HEIGHT_MULTIPLIER } from "../consts";
import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";
import { invariant } from "../utils/invariant";
import { parseColor } from "../utils/parseColor";

// TODO: probably construct an array and sort by z-index.
export function paint(ui: ScrollableRenderer, root: View): void {
  const dfsStack: Array<[View | Text, boolean]> = [[root, true]];

  const scrollStack: Vec2[] = [new Vec2(0, 0)];
  let cumulativeScroll = new Vec2(0, 0);

  const clipStack = [new Vec4(0, 0, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)];
  let clipBounds = new Vec4(0, 0, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

  while (dfsStack.length > 0) {
    const element = dfsStack.pop();
    invariant(element, "Node should not be null.");
    const [node, isFirstVisit] = element;

    if (isFirstVisit) {
      // Children are also skipped if the parent is not visible.
      if (node._style.display === "none") {
        continue;
      }

      if (node._style.overflow === "scroll") {
        cumulativeScroll = cumulativeScroll.add(node._state.scrollOffset);
        scrollStack.push(cumulativeScroll);
      } else {
        scrollStack.push(cumulativeScroll);
      }

      if (node._style.overflow === "hidden" || node._style.overflow === "scroll") {
        const newClipStart = new Vec2(node._state.metrics.x, node._state.metrics.y);
        const newClipEnd = new Vec2(node._state.metrics.width, node._state.metrics.height);
        const newClipBounds = new Vec4(
          Math.max(clipBounds.x, newClipStart.x),
          Math.max(clipBounds.y, newClipStart.y),
          Math.min(clipBounds.z, newClipEnd.x),
          Math.min(clipBounds.w, newClipEnd.y)
        );
        clipStack.push(newClipBounds);
        clipBounds = newClipBounds;
      } else {
        clipStack.push(clipBounds);
      }

      paintNode(ui, node, clipBounds, cumulativeScroll);

      dfsStack.push([node, false]);

      let p = node.firstChild;
      while (p) {
        dfsStack.push([p, true]);
        p = p.next;
      }
    } else {
      cumulativeScroll = scrollStack.pop() || new Vec2(0, 0);
      clipBounds =
        clipStack.pop() || new Vec4(0, 0, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    }
  }
}

function paintNode(
  ui: ScrollableRenderer,
  node: View | Text,
  clipBounds: Vec4,
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
    const size = new Vec2(node._state.metrics.width, node._state.metrics.height);

    ui.rectangle(
      parseColor(node._style.backgroundColor),
      position,
      size,
      new Vec4(0, 0, 0, 0),
      clipBounds.xy(),
      clipBounds.zw(),
      new Vec4(0, 0, 0, 0)
    );
  }
}
