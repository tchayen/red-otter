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

    if (typeof e._style.width === "string") {
      let definedWidth = undefined;
      let accumulatedMultiplier = 1;
      let _p = e.parent;
      while (definedWidth === undefined && _p) {
        if (typeof _p._style.width === "string") {
          accumulatedMultiplier *= toPercentage(_p._style.width);
        } else if (typeof _p._style.width === "number") {
          definedWidth = _p._style.width;
        }
        _p = _p.parent;
      }

      e._state.metrics.width =
        toPercentage(e._style.width) *
        accumulatedMultiplier *
        (definedWidth ?? 0);
    }
    if (typeof e._style.height === "string") {
      let definedHeight = undefined;
      let accumulatedMultiplier = 1;
      let _p = e.parent;
      while (definedHeight === undefined && _p) {
        if (typeof _p._style.height === "string") {
          accumulatedMultiplier *= toPercentage(_p._style.height);
        } else if (typeof _p._style.height === "number") {
          definedHeight = _p._style.height;
        }
        _p = _p.parent;
      }

      e._state.metrics.height =
        toPercentage(e._style.height) *
        accumulatedMultiplier *
        (definedHeight ?? 0);
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
            (e._style.flexDirection === "row" ||
              e._style.flexDirection === "row-reverse") &&
            c._style.position === "relative"
          ) {
            // Padding is inside the width.
            e._state.metrics.width +=
              c._state.metrics.width +
              c._style.marginLeft +
              c._style.marginRight;
          }

          if (
            (e._style.flexDirection === "column" ||
              e._style.flexDirection === "column-reverse") &&
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
      e._state.metrics.width += e._style.paddingLeft + e._style.paddingRight;

      if (
        e._style.flexDirection === "row" ||
        e._style.flexDirection === "row-reverse"
      ) {
        e._state.metrics.width += (childrenCount - 1) * e._style.rowGap;
      }
    }

    // Height is at least the sum of children with defined heights.
    if (e._style.height === undefined) {
      let childrenCount = 0;

      if (e._style.flexWrap === "wrap") {
        //
      }

      let c = e.firstChild;
      while (c) {
        if (c._state.metrics.height) {
          if (
            (e._style.flexDirection === "column" ||
              e._style.flexDirection === "column-reverse") &&
            c._style.position === "relative"
          ) {
            e._state.metrics.height +=
              c._state.metrics.height +
              c._style.marginTop +
              c._style.marginBottom;
          }

          if (
            (e._style.flexDirection === "row" ||
              e._style.flexDirection === "row-reverse") &&
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
      e._state.metrics.height += e._style.paddingTop + e._style.paddingBottom;

      if (
        e._style.flexDirection === "column" ||
        e._style.flexDirection === "column-reverse"
      ) {
        e._state.metrics.height += (childrenCount - 1) * e._style.columnGap;
      }
    }

    // Handle min/max width/height.
    if (e._style.minHeight !== undefined) {
      const value =
        typeof e._style.minHeight === "string"
          ? toPercentage(e._style.minHeight) *
            (e.parent?._state.metrics.height ?? 0)
          : e._style.minHeight;
      e._state.metrics.height = Math.max(e._state.metrics.height, value);
    }
    if (e._style.minWidth !== undefined) {
      const value =
        typeof e._style.minWidth === "string"
          ? toPercentage(e._style.minWidth) *
            (e.parent?._state.metrics.width ?? 0)
          : e._style.minWidth;
      e._state.metrics.width = Math.max(e._state.metrics.width, value);
    }
    if (e._style.maxHeight !== undefined) {
      const value =
        typeof e._style.maxHeight === "string"
          ? toPercentage(e._style.maxHeight) *
            (e.parent?._state.metrics.height ?? 0)
          : e._style.maxHeight;
      e._state.metrics.height = Math.min(e._state.metrics.height, value);
    }
    if (e._style.maxWidth !== undefined) {
      const value =
        typeof e._style.maxWidth === "string"
          ? toPercentage(e._style.maxWidth) *
            (e.parent?._state.metrics.width ?? 0)
          : e._style.maxWidth;
      e._state.metrics.width = Math.min(e._state.metrics.width, value);
    }

    // Calculate flexWrap height.
    // TODO @tchayen: doesn't work (yet).
    // TODO: actually I think that what should be added for the height is not
    // height of the current row, but height of the next row (that is being
    // wrapped now)
    // TODO:
    if (e._style.flexWrap === "wrap") {
      let x = 0;
      let y = 0;
      let longestChildHeight = 0;
      // The size that was first calculated is size of the tallest child of
      // all plus paddings. So here there's a need to reset the size and build
      // it again, for all rows.
      if (
        e._style.flexDirection === "row" ||
        e._style.flexDirection === "row-reverse"
      ) {
        e._state.metrics.height = e._style.paddingTop + e._style.paddingBottom;
      }
      if (
        e._style.flexDirection === "column" ||
        e._style.flexDirection === "column-reverse"
      ) {
        e._state.metrics.width = e._style.paddingLeft + e._style.paddingRight;
      }

      let c = e.firstChild;
      while (c) {
        if (c._style.position !== "relative") {
          // TODO @tchayen: add a test which has a position: absolute element
          // in a flex wrap container.
          c = c.next;
          continue;
        }

        if (
          e._style.flexDirection === "row" ||
          e._style.flexDirection === "row-reverse"
        ) {
          const deltaX =
            c._state.metrics.width + c._style.marginLeft + c._style.marginRight;
          const parentWidth =
            e._state.metrics.width -
            e._style.paddingLeft -
            e._style.paddingRight;
          if (x + deltaX >= parentWidth || c.next === null) {
            x = 0;
            const height = longestChildHeight + e._style.columnGap;
            y += height;
            e._state.metrics.height += height;
            longestChildHeight = 0;
          } else {
            x += deltaX + e._style.rowGap;
          }
        }
        if (
          e._style.flexDirection === "column" ||
          e._style.flexDirection === "column-reverse"
        ) {
          const deltaY =
            c._state.metrics.height +
            c._style.marginTop +
            c._style.marginBottom;
          const parentHeight =
            e._state.metrics.height -
            e._style.paddingTop -
            e._style.paddingBottom;
          if (y + deltaY >= parentHeight || c.next === null) {
            y = 0;
            const width = longestChildHeight + e._style.rowGap;
            x += width;
            e._state.metrics.width += width;
            longestChildHeight = 0;
          } else {
            y += deltaY + e._style.columnGap;
          }
        }

        // Keep track of the longest child in the flex container for the purpose
        // of wrapping.
        if (
          c._style.flexDirection === "row" ||
          c._style.flexDirection === "row-reverse"
        ) {
          longestChildHeight = Math.max(
            longestChildHeight,
            c._state.metrics.width
          );
        }
        if (
          c._style.flexDirection === "column" ||
          c._style.flexDirection === "column-reverse"
        ) {
          longestChildHeight = Math.max(
            longestChildHeight,
            c._state.metrics.height
          );
        }
        c = c.next;
      }

      // The last row.
      e._state.metrics.height += longestChildHeight;
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

    const isHorizontal =
      e._style.flexDirection === "row" ||
      e._style.flexDirection === "row-reverse";
    const isVertical =
      e._style.flexDirection === "column" ||
      e._style.flexDirection === "column-reverse";
    const isReversed =
      e._style.flexDirection === "row-reverse" ||
      e._style.flexDirection === "column-reverse";

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

    // If element has both left, right offsets and no width, calculate width
    // (analogues for height).
    if (
      e._style.top !== undefined &&
      e._style.bottom !== undefined &&
      e._style.height === undefined
    ) {
      e._state.metrics.y = (p?._state.metrics.y ?? 0) + e._style.top;
      e._state.metrics.height = parentHeight - e._style.top - e._style.bottom;
    }
    if (
      e._style.left !== undefined &&
      e._style.right !== undefined &&
      e._style.width === undefined
    ) {
      e._state.metrics.x = (p?._state.metrics.x ?? 0) + e._style.left;
      e._state.metrics.width = parentWidth - e._style.left - e._style.right;
    }

    if (e._style.position === "absolute") {
      e._state.metrics.x = p?._state.metrics.x ?? 0;
      e._state.metrics.y = p?._state.metrics.y ?? 0;

      if (e._style.left !== undefined) {
        e._state.metrics.x = e._state.metrics.x + e._style.left;
      } else if (e._style.right !== undefined) {
        e._state.metrics.x =
          (p?._state.metrics.x ?? 0) +
          (p?._state.metrics.width ?? 0) -
          e._state.metrics.width -
          e._style.right;
      }
      if (e._style.top !== undefined) {
        e._state.metrics.y = e._state.metrics.y + e._style.top;
      } else if (e._style.bottom !== undefined) {
        e._state.metrics.y =
          (p?._state.metrics.y ?? 0) +
          (p?._state.metrics.height ?? 0) -
          e._state.metrics.height -
          e._style.bottom;
      }
    }

    // Available space is size of the parent minus padding and gaps and margins
    // of children.
    let availableWidth =
      e._state.metrics.width - e._style.paddingLeft - e._style.paddingRight;
    let availableHeight =
      e._state.metrics.height - e._style.paddingTop - e._style.paddingBottom;

    // Count children and total flex value.
    let c = e.firstChild;
    while (c) {
      if (c._style.position === "relative") {
        childrenCount += 1;
      }

      if (
        isHorizontal &&
        c._style.flex === undefined &&
        c._style.position === "relative"
      ) {
        availableWidth -=
          c._state.metrics.width + c._style.marginLeft + c._style.marginRight;
      }
      if (
        isVertical &&
        c._style.flex === undefined &&
        c._style.position === "relative"
      ) {
        availableHeight -=
          c._state.metrics.height + c._style.marginTop + c._style.marginBottom;
      }

      // Calculate how many rectangles will be splitting the available space.
      if (isHorizontal && c._style.flex !== undefined) {
        totalFlex += c._style.flex;
      }
      if (isVertical && c._style.flex !== undefined) {
        totalFlex += c._style.flex;
      }

      c = c.next;
    }

    // Mind the gap.
    if (
      isHorizontal &&
      e._style.justifyContent !== "space-between" &&
      e._style.justifyContent !== "space-around" &&
      e._style.justifyContent !== "space-evenly"
    ) {
      availableWidth -= (e._style.rowGap ?? 0) * (childrenCount - 1);
    }
    if (
      isVertical &&
      e._style.justifyContent !== "space-between" &&
      e._style.justifyContent !== "space-around" &&
      e._style.justifyContent !== "space-evenly"
    ) {
      availableHeight -= (e._style.columnGap ?? 0) * (childrenCount - 1);
    }

    // Apply sizes.
    c = e.firstChild;
    while (c) {
      if (isHorizontal) {
        if (
          c._style.flex !== undefined &&
          e._style.justifyContent !== "space-between" &&
          e._style.justifyContent !== "space-evenly" &&
          e._style.justifyContent !== "space-around"
        ) {
          c._state.metrics.width = (c._style.flex / totalFlex) * availableWidth;
        }
      }
      if (isVertical) {
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
    if (isHorizontal) {
      if (e._style.justifyContent === "center") {
        x += availableWidth / 2;
      }

      if (
        (e._style.flexDirection === "row" &&
          e._style.justifyContent === "flex-end") ||
        (e._style.flexDirection === "row-reverse" &&
          e._style.justifyContent === "flex-start")
      ) {
        x += availableWidth;
      }

      if (e._style.justifyContent === "space-around") {
        x += availableWidth / childrenCount / 2;
      }

      if (e._style.justifyContent === "space-evenly") {
        x += availableWidth / (childrenCount + 1);
      }
    }
    if (isVertical) {
      if (e._style.justifyContent === "center") {
        y += availableHeight / 2;
      }

      if (
        (e._style.flexDirection === "column" &&
          e._style.justifyContent === "flex-end") ||
        (e._style.flexDirection === "column-reverse" &&
          e._style.justifyContent === "flex-start")
      ) {
        y += availableHeight;
      }

      if (e._style.justifyContent === "space-around") {
        y += availableHeight / childrenCount / 2;
      }

      if (e._style.justifyContent === "space-evenly") {
        y += availableHeight / (childrenCount + 1);
      }
    }

    // Apply positions to children.
    const direction = isReversed ? -1 : 1;

    // Along the main axis.
    let longestChildHeight = 0;

    c = e.firstChild;
    if (isReversed) {
      c = e.lastChild;
    }
    while (c) {
      if (c._style.position === "absolute" || c._style.display === "none") {
        c = isReversed ? c.prev : c.next;
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
        if (isHorizontal) {
          c._state.metrics.x += x * direction;
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
        }
        if (isVertical) {
          c._state.metrics.y += y * direction;
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
        }
      } else {
        if (e._style.flexWrap === "wrap") {
          if (isHorizontal) {
            const deltaX =
              c._state.metrics.width +
              c._style.marginLeft +
              c._style.marginRight;
            const parentWidth =
              e._state.metrics.width -
              e._style.paddingLeft -
              e._style.paddingRight;
            if (x - e._state.metrics.x + deltaX >= parentWidth) {
              x = e._state.metrics.x + e._style.paddingLeft;
              y += longestChildHeight + e._style.columnGap;
              longestChildHeight = 0;
            }
          }
          if (isVertical) {
            const deltaY =
              c._state.metrics.height +
              c._style.marginTop +
              c._style.marginBottom;
            const parentHeight =
              e._state.metrics.height -
              e._style.paddingTop -
              e._style.paddingBottom;
            if (y - e._state.metrics.y + deltaY >= parentHeight) {
              y = e._state.metrics.y + e._style.paddingTop;
              x += longestChildHeight + e._style.rowGap;
              longestChildHeight = 0;
            }
          }
        }

        c._state.metrics.x += isHorizontal ? x : x * direction;

        c._state.metrics.y += isVertical ? y : y * direction;

        if (isHorizontal) {
          x += c._state.metrics.width;
          x += e._style.rowGap;
        }
        if (isVertical) {
          y += c._state.metrics.height;
          y += e._style.columnGap;
        }
      }

      // Apply align items.
      if (isHorizontal) {
        if (e._style.alignItems === "flex-start") {
          c._state.metrics.y = y + c._style.marginTop;
        }

        if (e._style.alignItems === "center") {
          c._state.metrics.y =
            e._state.metrics.y +
            e._state.metrics.height / 2 -
            c._state.metrics.height / 2;
        }

        if (e._style.alignItems === "flex-end") {
          c._state.metrics.y =
            e._state.metrics.y +
            e._state.metrics.height -
            c._state.metrics.height -
            e._style.paddingBottom;
        }

        if (
          e._style.alignItems === "stretch" &&
          c._style.height === undefined &&
          c._style.alignSelf === "auto"
        ) {
          c._state.metrics.height =
            e._state.metrics.height -
            e._style.paddingTop -
            e._style.paddingBottom;
        }
      }
      if (isVertical) {
        if (e._style.alignItems === "flex-start") {
          c._state.metrics.x = x + c._style.marginLeft;
        }

        if (e._style.alignItems === "center") {
          c._state.metrics.x =
            e._state.metrics.x +
            e._state.metrics.width / 2 -
            c._state.metrics.width / 2;
        }

        if (e._style.alignItems === "flex-end") {
          c._state.metrics.x =
            e._state.metrics.x +
            e._state.metrics.width -
            c._state.metrics.width -
            e._style.paddingRight;
        }

        if (
          e._style.alignItems === "stretch" &&
          c._style.width === undefined &&
          c._style.alignSelf === "auto"
        ) {
          c._state.metrics.width =
            e._state.metrics.width -
            e._style.paddingLeft -
            e._style.paddingRight;
        }
      }

      // Align self.
      if (isHorizontal) {
        if (c._style.alignSelf === "flex-start") {
          c._state.metrics.y =
            e._state.metrics.y + e._style.paddingTop + c._style.marginTop;
        }

        if (c._style.alignSelf === "center") {
          c._state.metrics.y =
            e._state.metrics.y +
            e._state.metrics.height / 2 -
            c._state.metrics.height / 2;
        }

        if (c._style.alignSelf === "flex-end") {
          c._state.metrics.y =
            e._state.metrics.y +
            e._state.metrics.height -
            c._state.metrics.height -
            e._style.paddingBottom;
        }

        if (c._style.alignSelf === "stretch" && c._style.height === undefined) {
          c._state.metrics.y = e._state.metrics.y + e._style.paddingTop;
          c._state.metrics.height =
            e._state.metrics.height -
            e._style.paddingTop -
            e._style.paddingBottom;
        }
      }
      if (isVertical) {
        if (c._style.alignSelf === "flex-start") {
          c._state.metrics.x =
            e._state.metrics.x + e._style.paddingLeft + c._style.marginLeft;
        }

        if (c._style.alignSelf === "center") {
          c._state.metrics.x =
            e._state.metrics.x +
            e._state.metrics.width / 2 -
            c._state.metrics.width / 2;
        }

        if (c._style.alignSelf === "flex-end") {
          c._state.metrics.x =
            e._state.metrics.x +
            e._state.metrics.width -
            c._state.metrics.width -
            e._style.paddingRight;
        }

        if (c._style.alignSelf === "stretch" && c._style.width === undefined) {
          c._state.metrics.x = e._state.metrics.x + e._style.paddingLeft;
          c._state.metrics.width =
            e._state.metrics.width -
            e._style.paddingLeft -
            e._style.paddingRight;
        }
      }

      if (isHorizontal) {
        x += c._style.marginLeft + c._style.marginRight;
      }

      if (isVertical) {
        y += c._style.marginTop + c._style.marginBottom;
      }

      // Add left, top, right, bottom offsets.
      if (c._style.left) {
        c._state.metrics.x += c._style.left;
      } else if (c._style.right) {
        c._state.metrics.x -= c._style.right;
      }
      if (c._style.top) {
        c._state.metrics.y += c._style.top;
      } else if (c._style.bottom) {
        c._state.metrics.y -= c._style.bottom;
      }

      // Keep track of the longest child in the flex container for the
      // purpose of wrapping.
      if (c._style.flexDirection === "row") {
        longestChildHeight = Math.max(
          longestChildHeight,
          c._state.metrics.width
        );
      }
      if (c._style.flexDirection === "column") {
        longestChildHeight = Math.max(
          longestChildHeight,
          c._state.metrics.height
        );
      }

      c = isReversed ? c.prev : c.next;
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
