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
  let clipStart = new Vec2(0, 0);
  let clipEnd = new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

  while (dfsStack.length > 0) {
    const element = dfsStack.pop();
    invariant(element, "Node should not be null.");
    const [node, isFirstVisit] = element;

    if (isFirstVisit) {
      // Children are also skipped if the parent is not visible.
      if (node._style.display === "none") {
        continue;
      }

      if (node._style.overflow === "hidden" || node._style.overflow === "scroll") {
        clipStart = new Vec2(node._state.metrics.x, node._state.metrics.y);
        clipEnd = new Vec2(node._state.metrics.width, node._state.metrics.height);
      }

      if (node._style.overflow === "scroll") {
        const scrollOffset = node._state.scrollOffset;
        cumulativeScroll = cumulativeScroll.add(scrollOffset);
      }

      paintNode(ui, node, clipStart, clipEnd, cumulativeScroll);

      clipStack.push(new Vec4(clipStart.x, clipStart.y, clipEnd.x, clipEnd.y));
      scrollStack.push(cumulativeScroll);
      dfsStack.push([node, false]);
      let p = node.firstChild;
      while (p) {
        dfsStack.push([p, true]);
        p = p.next;
      }
    } else {
      const scrollOffset = scrollStack.pop();
      if (scrollOffset) {
        cumulativeScroll = cumulativeScroll.subtract(scrollOffset);
      }
      const clip = clipStack.pop();
      if (clip) {
        clipStart = new Vec2(clip.x, clip.y);
        clipEnd = new Vec2(clip.z, clip.w);
      }
    }
  }
}

function paintNode(
  ui: ScrollableRenderer,
  node: View | Text,
  clipStart: Vec2,
  clipEnd: Vec2,
  cumulativeScroll: Vec2
): void {
  // TODO @tchayen: remove this; it's temporarily disabled for debugging.
  clipStart = new Vec2(0, 0);
  clipEnd = new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
  //
  if (node instanceof Text) {
    const position = new Vec2(node._state.metrics.x, node._state.metrics.y).subtract(
      cumulativeScroll
    );
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
    const position = new Vec2(node._state.metrics.x, node._state.metrics.y).subtract(
      cumulativeScroll
    );
    const size = new Vec2(node._state.metrics.width, node._state.metrics.height);

    ui.rectangle(
      parseColor(node._style.backgroundColor),
      position,
      size,
      new Vec4(0, 0, 0, 0),
      clipStart,
      clipEnd,
      new Vec4(0, 0, 0, 0)
    );
  }
}
