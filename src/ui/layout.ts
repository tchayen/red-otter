import { Queue } from "../utils/Queue";
import { Vec2 } from "../math/Vec2";
import type { Lookups } from "../font/types";
import { View } from "../View";
import { invariant } from "../utils/invariant";
import { Text } from "../Text";

/**
 * @param tree tree of views to layout.
 * @param fontLookups used for calculating text shapes for text wrapping. Can be `null` if not needed.
 *
 * This function traverses the tree and calculates layout information - `width`, `height`, `x`, `y`
 * of each element - and stores it in `__state.metrics` of each node.
 */
export function layout(tree: View, fontLookups: Lookups | null, rootSize: Vec2): void {
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
        toPercentage(e._style.width) * accumulatedMultiplier * (definedWidth ?? 0);
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
        toPercentage(e._style.height) * accumulatedMultiplier * (definedHeight ?? 0);
    }

    // TODO @tchayen: add text wrapping.
  }

  /*
   * Second tree pass: resolve wrapping children.
   * Going bottom-up, level order.
   */
  while (!secondPass.isEmpty()) {
    const e = secondPass.dequeueFront();
    invariant(e, "Empty queue.");
    thirdPass.enqueue(e);

    const isWrap = e._style.flexWrap === "wrap" || e._style.flexWrap === "wrap-reverse";
    const isJustifySpace =
      e._style.justifyContent === "space-between" ||
      e._style.justifyContent === "space-around" ||
      e._style.justifyContent === "space-evenly";

    // Width is at least the sum of children with defined widths.
    if (e._style.width === undefined) {
      let childrenCount = 0;
      let c = e.firstChild;
      while (c) {
        if (c._state.metrics.width) {
          if (
            (e._style.flexDirection === "row" || e._style.flexDirection === "row-reverse") &&
            c._style.position === "relative"
          ) {
            // Padding is inside the width.
            e._state.metrics.width +=
              c._state.metrics.width + c._style.marginLeft + c._style.marginRight;
          }
          if (
            (e._style.flexDirection === "column" || e._style.flexDirection === "column-reverse") &&
            c._style.position === "relative"
          ) {
            // For column layout only wraps the widest child.
            e._state.metrics.width = Math.max(
              e._state.metrics.width,
              c._state.metrics.width + c._style.marginLeft + c._style.marginRight
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

      if (e._style.flexDirection === "row" || e._style.flexDirection === "row-reverse") {
        e._state.metrics.width += (childrenCount - 1) * e._style.rowGap;
      }
    }
    // Height is at least the sum of children with defined heights.
    if (e._style.height === undefined) {
      let childrenCount = 0;
      let c = e.firstChild;
      while (c) {
        if (c._state.metrics.height) {
          if (
            (e._style.flexDirection === "column" || e._style.flexDirection === "column-reverse") &&
            c._style.position === "relative"
          ) {
            e._state.metrics.height +=
              c._state.metrics.height + c._style.marginTop + c._style.marginBottom;
          }
          if (
            (e._style.flexDirection === "row" || e._style.flexDirection === "row-reverse") &&
            c._style.position === "relative"
          ) {
            e._state.metrics.height = Math.max(
              e._state.metrics.height,
              c._state.metrics.height + c._style.marginTop + c._style.marginBottom
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

      if (e._style.flexDirection === "column" || e._style.flexDirection === "column-reverse") {
        e._state.metrics.height += (childrenCount - 1) * e._style.columnGap;
      }
    }

    // Handle min/max width/height.
    if (e._style.minHeight !== undefined) {
      const value =
        typeof e._style.minHeight === "string"
          ? toPercentage(e._style.minHeight) * (e.parent?._state.metrics.height ?? 0)
          : e._style.minHeight;
      e._state.metrics.height = Math.max(e._state.metrics.height, value);
    }
    if (e._style.minWidth !== undefined) {
      const value =
        typeof e._style.minWidth === "string"
          ? toPercentage(e._style.minWidth) * (e.parent?._state.metrics.width ?? 0)
          : e._style.minWidth;
      e._state.metrics.width = Math.max(e._state.metrics.width, value);
    }
    if (e._style.maxHeight !== undefined) {
      const value =
        typeof e._style.maxHeight === "string"
          ? toPercentage(e._style.maxHeight) * (e.parent?._state.metrics.height ?? 0)
          : e._style.maxHeight;
      e._state.metrics.height = Math.min(e._state.metrics.height, value);
    }
    if (e._style.maxWidth !== undefined) {
      const value =
        typeof e._style.maxWidth === "string"
          ? toPercentage(e._style.maxWidth) * (e.parent?._state.metrics.width ?? 0)
          : e._style.maxWidth;
      e._state.metrics.width = Math.min(e._state.metrics.width, value);
    }

    // Calculate flexWrap height.
    let x = 0;
    let y = 0;
    let longestChildHeight = 0;

    if (isWrap) {
      // The size that was first calculated is size of the tallest child of all plus paddings. So
      // here there's a need to reset the size and build it again, for all rows.
      if (e._style.flexDirection === "row" || e._style.flexDirection === "row-reverse") {
        if (e._style.height === undefined) {
          e._state.metrics.height = e._style.paddingTop + e._style.paddingBottom;
        }
      }
      if (e._style.flexDirection === "column" || e._style.flexDirection === "column-reverse") {
        if (e._style.width === undefined) {
          e._state.metrics.width = e._style.paddingLeft + e._style.paddingRight;
        }
      }
    }

    let c = e.firstChild;
    const rows: Array<Array<View | Text>> = [[]];
    while (c) {
      if (c._style.position !== "relative") {
        // TODO @tchayen: add a test which has a position: absolute element in a flex wrap
        // container.
        c = c.next;
        continue;
      }

      if (e._style.flexDirection === "row" || e._style.flexDirection === "row-reverse") {
        const deltaX = c._state.metrics.width + c._style.marginLeft + c._style.marginRight;
        const parentWidth = e._state.metrics.width - e._style.paddingLeft - e._style.paddingRight;
        if (isWrap && (x + deltaX >= parentWidth || c.next === null)) {
          x = 0;
          const height = longestChildHeight + e._style.columnGap; // TODO @tchayen: with alignContent space-between etc. there won't be a gap.
          y += height;
          longestChildHeight = 0;
          rows.push([]);
          if (isWrap && e._style.height === undefined) {
            e._state.metrics.height += height;
          }
        } else {
          x += deltaX + (isJustifySpace ? e._style.rowGap : 0);
        }
      }
      if (e._style.flexDirection === "column" || e._style.flexDirection === "column-reverse") {
        const deltaY = c._state.metrics.height + c._style.marginTop + c._style.marginBottom;
        const parentHeight = e._state.metrics.height - e._style.paddingTop - e._style.paddingBottom;
        if (isWrap && (y + deltaY >= parentHeight || c.next === null)) {
          y = 0;
          const width = longestChildHeight + e._style.rowGap; // TODO @tchayen: with alignContent space-between etc. there won't be a gap.
          x += width;
          longestChildHeight = 0;
          rows.push([]);

          if (e._style.width === undefined) {
            e._state.metrics.width += width;
          }
        } else {
          y += deltaY + (isJustifySpace ? e._style.columnGap : 0);
        }
      }

      // Keep track of the longest child in the flex container for the purpose of wrapping.
      if (c._style.flexDirection === "row" || c._style.flexDirection === "row-reverse") {
        longestChildHeight = Math.max(longestChildHeight, c._state.metrics.width);
      }
      if (c._style.flexDirection === "column" || c._style.flexDirection === "column-reverse") {
        longestChildHeight = Math.max(longestChildHeight, c._state.metrics.height);
      }

      rows.at(-1)?.push(c);

      c = c.next;
    }
    e._state.flexChildren = rows;

    // The last row.
    if (isWrap && e._style.height === undefined) {
      if (e._style.flexDirection === "row") {
        e._state.metrics.height += longestChildHeight;
      }
      if (e._style.flexDirection === "column") {
        e._state.metrics.width += longestChildHeight;
      }
    }

    // TODO @tchayen: calculate scrollable content area.
  }

  /*
   * Third tree pass: resolve flex.
   * Going top-down, level order.
   */
  while (!thirdPass.isEmpty()) {
    const e = thirdPass.dequeueFront();
    invariant(e, "Empty queue.");
    const p = e.parent;

    const parentWidth = p?._state.metrics.width ?? 0;
    const parentHeight = p?._state.metrics.height ?? 0;

    const isHorizontal =
      e._style.flexDirection === "row" || e._style.flexDirection === "row-reverse";
    const isVertical =
      e._style.flexDirection === "column" || e._style.flexDirection === "column-reverse";
    const isReversed =
      e._style.flexDirection === "row-reverse" || e._style.flexDirection === "column-reverse";
    const isJustifySpace =
      e._style.justifyContent === "space-between" ||
      e._style.justifyContent === "space-around" ||
      e._style.justifyContent === "space-evenly";

    invariant(e._style.flex === undefined || e._style.flex >= 0, "Flex cannot be negative.");

    // TODO @tchayen: it probably shouldn't really be here? There's calculation  in the first pass.
    // Figure out why this seems to be needed.
    if (typeof e._style.width === "string") {
      e._state.metrics.width = toPercentage(e._style.width) * parentWidth;
    }
    if (typeof e._style.height === "string") {
      e._state.metrics.height = toPercentage(e._style.height) * parentHeight;
    }

    // If element has both left, right offsets and no width, calculate width (analogues for height).
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

    // Handle absolute positioning.
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

    // TODO @tchayen:
    // - align content

    if (e._style.flexWrap === "wrap-reverse") {
      e._state.flexChildren.reverse();
    }

    if (isReversed) {
      e._state.flexChildren.forEach((row) => row.reverse());
    }

    const resetMain = isHorizontal
      ? e._state.metrics.x + e._style.paddingLeft
      : e._state.metrics.y + e._style.paddingTop;
    const resetCross = isHorizontal
      ? e._state.metrics.y + e._style.paddingTop
      : e._state.metrics.x + e._style.paddingLeft;
    let main = resetMain;
    let cross = resetCross;
    const mainGap = (isHorizontal ? e._style.rowGap : e._style.columnGap) ?? 0;
    const crossGap = (isHorizontal ? e._style.columnGap : e._style.rowGap) ?? 0;

    for (const line of e._state.flexChildren) {
      let longestChild = 0;
      let childrenCount = 0;

      // Calculate available space for justify content along the main axis.
      let availableMain = isHorizontal
        ? e._state.metrics.width - e._style.paddingLeft - e._style.paddingRight
        : e._state.metrics.height - e._style.paddingTop - e._style.paddingBottom;
      if (!isJustifySpace) {
        availableMain -= mainGap * (line.length - 1);
      }
      let totalFlex = 0;

      for (const c of line) {
        if (c._style.position === "absolute" || c._style.display === "none") {
          continue;
        }
        childrenCount += 1;
        longestChild = Math.max(longestChild, c._state.metrics.height);
        availableMain -= isHorizontal
          ? c._state.metrics.width +
            (!isJustifySpace ? c._style.marginLeft + c._style.marginRight : 0)
          : c._state.metrics.height +
            (!isJustifySpace ? c._style.marginTop + c._style.marginBottom : 0);
        if (c._style.flex !== undefined) {
          totalFlex += c._style.flex;
        }
      }

      // Adjust positions for justify content.
      if (e._style.justifyContent === "center") {
        main += availableMain / 2;
      }
      if (
        (isReversed && e._style.justifyContent === "flex-start") ||
        (!isReversed && e._style.justifyContent === "flex-end")
      ) {
        main += availableMain;
      }
      if (e._style.justifyContent === "space-around") {
        main += availableMain / childrenCount / 2;
      }
      if (e._style.justifyContent === "space-evenly") {
        main += availableMain / (childrenCount + 1);
      }

      // Iterate over children and apply positions.
      for (const c of line) {
        if (c._style.position === "absolute" || c._style.display === "none") {
          continue;
        }

        if (isHorizontal) {
          if (c._style.flex !== undefined && !isJustifySpace) {
            c._state.metrics.width += (c._style.flex / totalFlex) * availableMain;
          }
        }
        if (isVertical) {
          if (c._style.flex !== undefined && !isJustifySpace) {
            c._state.metrics.height += (c._style.flex / totalFlex) * availableMain;
          }
        }

        if (isJustifySpace) {
          c._state.metrics.x += isHorizontal ? main : cross;
          c._state.metrics.y += isHorizontal ? cross : main;
          main += isHorizontal ? c._state.metrics.width : c._state.metrics.height;

          if (e._style.justifyContent === "space-between") {
            main += availableMain / (childrenCount - 1);
          }
          if (e._style.justifyContent === "space-around") {
            main += availableMain / childrenCount;
          }
          if (e._style.justifyContent === "space-evenly") {
            main += availableMain / (childrenCount + 1);
          }
        } else {
          c._state.metrics.x += isHorizontal
            ? main + c._style.marginLeft
            : cross + c._style.marginLeft;
          c._state.metrics.y += isHorizontal
            ? cross + c._style.marginTop
            : main + c._style.marginTop;

          main += isHorizontal
            ? c._state.metrics.width + c._style.marginLeft + c._style.marginRight
            : c._state.metrics.height + c._style.marginTop + c._style.marginBottom;
          main += mainGap;

          // Apply align items.
          const lineCrossSize = Math.max(
            longestChild,
            isHorizontal ? e._state.metrics.height : e._state.metrics.width
          );
          if (e._style.alignItems === "center") {
            if (isHorizontal) {
              c._state.metrics.y += (lineCrossSize - c._state.metrics.height) / 2;
            }
            if (isVertical) {
              c._state.metrics.x += (lineCrossSize - c._state.metrics.width) / 2;
            }
          }
          if (e._style.alignItems === "flex-end") {
            if (isHorizontal) {
              c._state.metrics.y += lineCrossSize - c._state.metrics.height;
            }
            if (isVertical) {
              c._state.metrics.x += lineCrossSize - c._state.metrics.width;
            }
          }
          if (
            e._style.alignItems === "stretch" &&
            ((isHorizontal && c._style.height === undefined) ||
              (isVertical && c._style.width === undefined)) &&
            c._style.alignSelf === "auto"
          ) {
            if (isHorizontal) {
              c._state.metrics.height = lineCrossSize;
            }
            if (isVertical) {
              c._state.metrics.width = lineCrossSize;
            }
          }

          // Apply align self.
          if (c._style.alignSelf === "flex-start") {
            if (isHorizontal) {
              c._state.metrics.y = resetCross;
            }
            if (isVertical) {
              c._state.metrics.x = resetCross;
            }
          }
          if (c._style.alignSelf === "center") {
            if (isHorizontal) {
              c._state.metrics.y += (lineCrossSize - c._state.metrics.height) / 2;
            }
            if (isVertical) {
              c._state.metrics.x += (lineCrossSize - c._state.metrics.width) / 2;
            }
          }
          if (c._style.alignSelf === "flex-end") {
            if (isHorizontal) {
              c._state.metrics.y += lineCrossSize - c._state.metrics.height;
            }
            if (isVertical) {
              c._state.metrics.x += lineCrossSize - c._state.metrics.width;
            }
          }
          if (
            c._style.alignSelf === "stretch" &&
            ((isHorizontal && c._style.height === undefined) ||
              (isVertical && c._style.width === undefined))
          ) {
            if (isHorizontal) {
              c._state.metrics.y = resetCross;
              c._state.metrics.height = lineCrossSize;
            }
            if (isVertical) {
              c._state.metrics.x = resetCross;
              c._state.metrics.width = lineCrossSize;
            }
          }
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
      }

      main = resetMain;
      cross += longestChild + crossGap;
    }

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
