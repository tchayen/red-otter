import type { BaseView } from "./layout/BaseView";
import { CROSS_AXIS_SIZE } from "./consts";
import { Vec4 } from "./math/Vec4";
import { intersection as getIntersection, isInside } from "./math/utils";
import type { UserEvent } from "./layout/eventTypes";

/**
 * @returns whether event happened within the node's visible rectangle, including scrollbars.
 */
export function hitTest(node: BaseView, event: UserEvent): boolean {
  const intersection = getScreenVisibleRectangle(node);
  return isInside(event.position, intersection);
}

/**
 * @returns rectangle of the node's visible area in screen space coordinates, including scrollbars.
 */
export function getScreenVisibleRectangle(node: BaseView) {
  const { totalScrollX, totalScrollY, clipStart, clipSize, clientHeight, clientWidth } =
    node._state;
  const nodeRectangle = new Vec4(
    node._state.x - totalScrollX,
    node._state.y - totalScrollY,
    clientWidth + (node._state.hasHorizontalScrollbar ? CROSS_AXIS_SIZE : 0),
    clientHeight + (node._state.hasVerticalScrollbar ? CROSS_AXIS_SIZE : 0),
  );
  const boundary = new Vec4(clipStart.x, clipStart.y, clipSize.x, clipSize.y);
  const intersection = getIntersection(nodeRectangle, boundary);
  return intersection;
}
