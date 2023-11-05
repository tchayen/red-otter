import { Queue } from "../utils/Queue";
import { Vec2 } from "../math/Vec2";
import type { Lookups } from "../font/types";
import { View } from "../View";
import { invariant } from "../utils/invariant";
import { Text } from "../Text";

/**
 * @param tree tree of views to layout.
 * @param fontLookups used for calculating text sizes.
 *
 * This function traverses the tree and calculates layout information - width,
 * height, x, y of each element - and stores it in `__state.layout` property.
 */
export function layout(tree: View, fontLookups: Lookups, rootSize: Vec2): void {
  const firstPass = new Queue<View | Text>();
  const secondPass = new Queue<View | Text>();
  const thirdPass = new Queue<View | Text>();

  // TODO: inspect what would it take to get rid of root and use tree directly.
  const root = new View({ style: { height: rootSize.y, width: rootSize.x } });

  root.add(tree);

  /*
   * NOTE:
   * Code style detail: `e` is an element, `c` is a child, `p` is a parent.
   */

  // Traverse tree in level order and generate the reverse queue.
  firstPass.enqueue(root);
  while (!firstPass.isEmpty()) {
    const e = firstPass.dequeue();
    invariant(e, "Empty queue.");
    const p = e.parent;

    let c = e.firstChild;
    while (c !== null) {
      firstPass.enqueue(c);
      secondPass.enqueue(c);
      c = c.next;
    }

    e._state.metrics = { height: 0, width: 0, x: 0, y: 0 };

    // If element has defined width or height, set it.
    if (typeof e._style.width === "number") {
      e._state.metrics.width = e._style.width;
    }
    if (typeof e._style.height === "number") {
      e._state.metrics.height = e._style.height;
    }

    const parentWidth = p?._state.metrics.width ?? 0;
    const parentHeight = p?._state.metrics.height ?? 0;

    if (typeof e._style.width === "string") {
      e._state.metrics.width = toPercentage(e._style.width) * parentWidth;
    }
    if (typeof e._style.height === "string") {
      e._state.metrics.height = toPercentage(e._style.height) * parentHeight;
    }
  }

  /*
   * Second tree pass: resolve wrapping children.
   * Going bottom-up, level order.
   */
  while (!secondPass.isEmpty()) {
    const e = secondPass.dequeueFront();
    invariant(e, "Empty queue.");
    thirdPass.enqueue(e);

    // Width is at least the sum of children with defined widths.
    if (e._style.width === undefined) {
      let childrenCount = 0;

      let c = e.firstChild;
      while (c) {
        if (c._state.metrics.width) {
          if (
            e._style.flexDirection === "row" &&
            c._style.position === "relative"
          ) {
            // Padding is inside the width.
            e._state.metrics.width +=
              c._state.metrics.width +
              c._style.marginLeft +
              c._style.marginRight;
          }

          if (
            e._style.flexDirection === "column" &&
            c._style.position === "relative"
          ) {
            // For column layout only wraps the widest child.
            e._state.metrics.width = Math.max(
              e._state.metrics.width,
              c._state.metrics.width +
                c._style.marginLeft +
                c._style.marginRight
            );
          }
        }

        if (c._style.position === "relative") {
          childrenCount += 1;
        }

        c = c.next;
      }

      // Include padding and gaps.
      e._state.metrics.width +=
        e._style.paddingLeft +
        e._style.paddingRight +
        (e._style.flexDirection === "row"
          ? (childrenCount - 1) * e._style.rowGap
          : 0);
    }

    // Height is at least the sum of children with defined heights.
    if (e._style.height === undefined) {
      let childrenCount = 0;

      let c = e.firstChild;
      while (c) {
        if (c._state.metrics.height) {
          if (
            e._style.flexDirection === "column" &&
            c._style.position === "relative"
          ) {
            e._state.metrics.height +=
              c._state.metrics.height +
              c._style.marginTop +
              c._style.marginBottom;
          }

          if (
            e._style.flexDirection === "row" &&
            c._style.position === "relative"
          ) {
            e._state.metrics.height = Math.max(
              e._state.metrics.height,
              c._state.metrics.height +
                c._style.marginTop +
                c._style.marginBottom
            );
          }
        }

        if (c._style.position === "relative") {
          childrenCount += 1;
        }

        c = c.next;
      }

      // Include padding and gaps.
      e._state.metrics.height +=
        e._style.paddingTop +
        e._style.paddingBottom +
        (e._style.flexDirection === "column"
          ? (childrenCount - 1) * e._style.columnGap
          : 0);
    }
  }

  /*
   * Third tree pass: resolve flex.
   * Going top-down, level order.
   */
  while (!thirdPass.isEmpty()) {
    const e = thirdPass.dequeueFront();
    invariant(e, "Empty queue.");
    const p = e.parent;

    let totalFlex = 0;
    let childrenCount = 0;

    // Undefined is ruled out by the previous pass.
    const parentWidth = p?._state.metrics.width ?? 0;
    const parentHeight = p?._state.metrics.height ?? 0;

    invariant(
      e._style.flex === undefined || e._style.flex >= 0,
      "Flex cannot be negative."
    );

    if (typeof e._style.width === "string") {
      e._state.metrics.width = toPercentage(e._style.width) * parentWidth;
    }

    if (typeof e._style.height === "string") {
      e._state.metrics.height = toPercentage(e._style.height) * parentHeight;
    }

    let c = e.firstChild;

    // Available space is size of the parent minus padding and gaps and margins
    // of children.
    let availableWidth =
      e._state.metrics.width - e._style.paddingLeft - e._style.paddingRight;
    if (
      e._style.flexDirection === "row" &&
      e._style.justifyContent !== "space-between" &&
      e._style.justifyContent !== "space-around" &&
      e._style.justifyContent !== "space-evenly"
    ) {
      availableWidth -= (e._style.rowGap ?? 0) * (childrenCount - 1);
    }

    let availableHeight =
      e._state.metrics.height - e._style.paddingTop - e._style.paddingBottom;
    if (
      e._style.flexDirection === "column" &&
      e._style.justifyContent !== "space-between" &&
      e._style.justifyContent !== "space-around" &&
      e._style.justifyContent !== "space-evenly"
    ) {
      availableHeight -= (e._style.columnGap ?? 0) * (childrenCount - 1);
    }

    // Count children and total flex value.
    c = e.firstChild;
    while (c) {
      if (c._style.position === "relative") {
        childrenCount += 1;
      }

      if (
        e._style.flexDirection === "row" &&
        c._style.flex === undefined &&
        c._style.position === "relative"
      ) {
        availableWidth -=
          c._state.metrics.width + c._style.marginLeft + c._style.marginRight;
      }
      if (
        e._style.flexDirection === "column" &&
        c._style.flex === undefined &&
        c._style.position === "relative"
      ) {
        availableHeight -=
          c._state.metrics.height + c._style.marginTop + c._style.marginBottom;
      }

      // Calculate how many rectangles will be splitting the available space.
      if (e._style.flexDirection === "row" && c._style.flex !== undefined) {
        totalFlex += c._style.flex;
      }
      if (e._style.flexDirection === "column" && c._style.flex !== undefined) {
        totalFlex += c._style.flex;
      }

      c = c.next;
    }

    // Apply sizes.
    c = e.firstChild;
    while (c) {
      if (e._style.flexDirection === "row") {
        if (
          c._style.flex !== undefined &&
          e._style.justifyContent !== "space-between" &&
          e._style.justifyContent !== "space-evenly" &&
          e._style.justifyContent !== "space-around"
        ) {
          c._state.metrics.width = (c._style.flex / totalFlex) * availableWidth;
        }
      }
      if (e._style.flexDirection === "column") {
        if (
          c._style.flex !== undefined &&
          e._style.justifyContent !== "space-between" &&
          e._style.justifyContent !== "space-evenly" &&
          e._style.justifyContent !== "space-around"
        ) {
          c._state.metrics.height =
            (c._style.flex / totalFlex) * availableHeight;
        }
      }

      c = c.next;
    }

    // Offset for children, gradually building up as next children are
    // processed.
    let x = e._state.metrics.x + e._style.paddingLeft;
    let y = e._state.metrics.y + e._style.paddingTop;

    // Apply justify content. Starting point for laying out children.
    if (e._style.flexDirection === "row") {
      if (e._style.justifyContent === "center") {
        x += availableWidth / 2;
      }

      if (e._style.justifyContent === "flex-end") {
        x += availableWidth;
      }

      if (e._style.justifyContent === "space-around") {
        x += availableWidth / childrenCount / 2;
      }

      if (e._style.justifyContent === "space-evenly") {
        x += availableWidth / (childrenCount + 1);
      }
    }
    if (e._style.flexDirection === "column") {
      if (e._style.justifyContent === "center") {
        y += availableHeight / 2;
      }

      if (e._style.justifyContent === "flex-end") {
        y += availableHeight;
      }

      if (e._style.justifyContent === "space-around") {
        y += availableHeight / childrenCount / 2;
      }

      if (e._style.justifyContent === "space-evenly") {
        y += availableHeight / (childrenCount + 1);
      }
    }

    c = e.firstChild;
    while (c) {
      // Apply align items.
      if (c._style.position === "absolute") {
        c = c.next;
        continue;
      }

      c._state.metrics.x += c._style.marginLeft;
      c._state.metrics.y += c._style.marginTop;

      // Apply justify-content. This resets positions of children.
      if (
        e._style.justifyContent === "space-between" ||
        e._style.justifyContent === "space-around" ||
        e._style.justifyContent === "space-evenly"
      ) {
        if (e._style.flexDirection === "row") {
          c._state.metrics.x += x;
          x += c._state.metrics.width;
          if (e._style.justifyContent === "space-between") {
            x += availableWidth / (childrenCount - 1);
          }
          if (e._style.justifyContent === "space-around") {
            x += availableWidth / childrenCount;
          }
          if (e._style.justifyContent === "space-evenly") {
            x += availableWidth / (childrenCount + 1);
          }
          c._state.metrics.y += y;
        }
        if (e._style.flexDirection === "column") {
          c._state.metrics.y += y;
          y += c._state.metrics.height;
          if (e._style.justifyContent === "space-between") {
            y += availableHeight / (childrenCount - 1);
          }
          if (e._style.justifyContent === "space-around") {
            y += availableHeight / childrenCount;
          }
          if (e._style.justifyContent === "space-evenly") {
            y += availableHeight / (childrenCount + 1);
          }
          c._state.metrics.x += x;
        }
      } else {
        if (c._style.position === "absolute" || c._style.display === "none") {
          c = c.next;
          continue;
        }

        c._state.metrics.x += x;
        if (e._style.flexDirection === "row") {
          x += c._state.metrics.width;
          x += e._style.rowGap;
        }
        c._state.metrics.y += y;
        if (e._style.flexDirection === "column") {
          y += c._state.metrics.height;
          y += e._style.columnGap;
        }
      }

      if (e._style.flexDirection === "row") {
        if (e._style.alignItems === "center") {
          c._state.metrics.y +=
            e._state.metrics.y +
            e._state.metrics.height / 2 -
            c._state.metrics.height / 2;
        }

        if (e._style.alignItems === "flex-end") {
          c._state.metrics.y +=
            e._state.metrics.y +
            e._state.metrics.height -
            c._state.metrics.height -
            e._style.paddingBottom;
        }

        if (
          e._style.alignItems === "stretch" &&
          c._style.height === undefined
        ) {
          c._state.metrics.height =
            e._state.metrics.height -
            e._style.paddingTop -
            e._style.paddingBottom;
        }
      }
      if (e._style.flexDirection === "column") {
        if (e._style.alignItems === "center") {
          c._state.metrics.x +=
            e._state.metrics.x +
            e._state.metrics.width / 2 -
            c._state.metrics.width / 2;
        }

        if (e._style.alignItems === "flex-end") {
          c._state.metrics.x +=
            e._state.metrics.x +
            e._state.metrics.width -
            c._state.metrics.width -
            e._style.paddingRight;
        }

        if (e._style.alignItems === "stretch" && c._style.width === undefined) {
          c._state.metrics.width =
            e._state.metrics.width -
            e._style.paddingLeft -
            e._style.paddingRight;
        }
      }

      if (e._style.flexDirection === "row") {
        x += c._style.marginLeft + c._style.marginRight;
      }

      if (e._style.flexDirection === "column") {
        y += c._style.marginTop + c._style.marginBottom;
      }

      c = c.next;
    }

    // Round to whole pixels.
    e._state.metrics.x = Math.round(e._state.metrics.x);
    e._state.metrics.y = Math.round(e._state.metrics.y);
    e._state.metrics.width = Math.round(e._state.metrics.width);
    e._state.metrics.height = Math.round(e._state.metrics.height);
  }
}

function toPercentage(value: string): number {
  if (!value.endsWith("%")) {
    throw new Error("Value must be a percentage.");
  }

  return Number(value.replace("%", "")) / 100;
}
