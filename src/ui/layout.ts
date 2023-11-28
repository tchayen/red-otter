import { Queue } from "../utils/Queue";
import type { Vec2 } from "../math/Vec2";
import type { Lookups } from "../font/types";
import { View } from "../View";
import { invariant } from "../utils/invariant";
import { Text } from "../Text";
import { shapeText } from "../font/shapeText";
import { DEFAULT_FONT_SIZE } from "../consts";
import {
  AlignContent,
  AlignItems,
  AlignSelf,
  Display,
  FlexDirection,
  FlexWrap,
  JustifyContent,
  Overflow,
  Position,
} from "../types";
import { CROSS_AXIS_SIZE } from "./consts";

/**
 * @param tree tree of views to layout.
 * @param fontLookups used for calculating text shapes for text wrapping. Can be `null` if not needed.
 *
 * This function traverses the tree and calculates layout information - `width`, `height`, `x`, `y`
 * of each element - and stores it in `__state.metrics` of each node. Coordinates are in pixels and
 * start point for each element is top left corner of the root element, which is created around the
 * tree passed to this function. What this means in practice is that all coordinates are global and
 * not relative to the parent.
 */
export function layout(tree: View, fontLookups: Lookups | null, rootSize: Vec2): void {
  const traversalQueue = new Queue<View | Text>();

  // TODO: inspect what would it take to get rid of root and use tree directly.
  const root = new View({
    style: {
      height: rootSize.y,
      width: rootSize.x,
    },
    testID: "layout#root",
  });
  root.add(tree);

  const nodesInLevelOrder: Array<View | Text> = [root];

  /*
   * NOTE:
   * Code style detail: `e` is an element, `c` is a child, `p` is a parent.
   */

  // Traverse tree in level order and generate the reverse queue.
  traversalQueue.enqueue(root);
  while (!traversalQueue.isEmpty()) {
    const e = traversalQueue.dequeue();
    invariant(e, "Empty queue.");
    nodesInLevelOrder.push(e);

    const isHorizontal =
      e.parent?._style.flexDirection === FlexDirection.Row ||
      e.parent?._style.flexDirection === FlexDirection.RowReverse;

    let c = e.firstChild;
    while (c !== null) {
      traversalQueue.enqueue(c);
      c = c.next;
    }
    e._state.x = 0;
    e._state.y = 0;
    e._state.clientWidth = 0;
    e._state.clientHeight = 0;
    e._state.scrollWidth = 0;
    e._state.scrollHeight = 0;
    e._state.scrollX = 0;
    e._state.scrollY = 0;

    // If element has defined width or height, set it.
    if (typeof e._style.width === "number") {
      e._state.clientWidth = e._style.width;
    }
    if (typeof e._style.height === "number") {
      e._state.clientHeight = e._style.height;
    }
    if (typeof e._style.flexBasis === "number") {
      if (isHorizontal) {
        e._state.clientWidth = e._style.flexBasis;
      } else {
        e._state.clientHeight = e._style.flexBasis;
      }
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

      e._state.clientWidth =
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

      e._state.clientHeight =
        toPercentage(e._style.height) * accumulatedMultiplier * (definedHeight ?? 0);
    }
    if (typeof e._style.flexBasis === "string") {
      if (isHorizontal) {
        e._state.clientWidth =
          toPercentage(e._style.flexBasis) * (e.parent?._state.clientWidth ?? 0);
      } else {
        e._state.clientHeight =
          toPercentage(e._style.flexBasis) * (e.parent?._state.clientHeight ?? 0);
      }
    }

    const p = e.parent;
    if (e instanceof Text && fontLookups) {
      if (p?._state.clientWidth !== undefined) {
        const maxWidth =
          p._state.clientWidth -
          p._style.paddingLeft -
          p._style.paddingRight -
          p._style.borderLeftWidth -
          p._style.borderRightWidth;
        e._state.textWidthLimit = maxWidth;

        const shape = shapeText({
          fontName: e._style.fontName,
          fontSize: e._style.fontSize ?? DEFAULT_FONT_SIZE,
          lineHeight: e._style.lineHeight,
          lookups: fontLookups,
          maxWidth,
          text: e.text,
          textAlignment: e._style.textAlign ?? "left",
        });

        e._state.clientWidth = shape.boundingRectangle.width;
        e._state.clientHeight = shape.boundingRectangle.height;
      }
    }
  }

  /*
   * Second tree pass: resolve wrapping children.
   * Going bottom-up, level order.
   */
  for (let i = nodesInLevelOrder.length - 1; i >= 0; i--) {
    const e = nodesInLevelOrder[i]!;
    invariant(e, "Empty queue.");

    const isWrap =
      e._style.flexWrap === FlexWrap.Wrap || e._style.flexWrap === FlexWrap.WrapReverse;
    const isHorizontal =
      e._style.flexDirection === FlexDirection.Row ||
      e._style.flexDirection === FlexDirection.RowReverse;
    const isVertical =
      e._style.flexDirection === FlexDirection.Column ||
      e._style.flexDirection === FlexDirection.ColumnReverse;
    const isJustifySpace =
      e._style.justifyContent === JustifyContent.SpaceBetween ||
      e._style.justifyContent === JustifyContent.SpaceAround ||
      e._style.justifyContent === JustifyContent.SpaceEvenly;

    // Width is at least the sum of children with defined widths.
    if (e._style.width === undefined) {
      let childrenCount = 0;
      let c = e.firstChild;
      while (c) {
        if (c._state.clientWidth) {
          if (isHorizontal && c._style.position === Position.Relative) {
            // Padding is inside the width.
            e._state.clientWidth +=
              c._state.clientWidth + c._style.marginLeft + c._style.marginRight;
          }
          if (isVertical && c._style.position === Position.Relative) {
            // For column layout only wraps the widest child.
            e._state.clientWidth = Math.max(
              e._state.clientWidth,
              c._state.clientWidth + c._style.marginLeft + c._style.marginRight
            );
          }
        }
        if (c._style.position === Position.Relative) {
          childrenCount += 1;
        }
        c = c.next;
      }

      // Include padding and gaps.
      e._state.clientWidth +=
        e._style.paddingLeft +
        e._style.paddingRight +
        e._style.borderLeftWidth +
        e._style.borderRightWidth;

      if (isHorizontal) {
        e._state.clientWidth += (childrenCount - 1) * e._style.rowGap;
      }
    }
    // Height is at least the sum of children with defined heights.
    if (e._style.height === undefined) {
      let childrenCount = 0;
      let c = e.firstChild;
      while (c) {
        if (c._state.clientHeight) {
          if (isVertical && c._style.position === Position.Relative) {
            e._state.clientHeight +=
              c._state.clientHeight + c._style.marginTop + c._style.marginBottom;
          }
          if (isHorizontal && c._style.position === Position.Relative) {
            e._state.clientHeight = Math.max(
              e._state.clientHeight,
              c._state.clientHeight + c._style.marginTop + c._style.marginBottom
            );
          }
        }
        if (c._style.position === Position.Relative) {
          childrenCount += 1;
        }
        c = c.next;
      }

      // Include padding and gaps.
      e._state.clientHeight +=
        e._style.paddingTop +
        e._style.paddingBottom +
        e._style.borderTopWidth +
        e._style.borderBottomWidth;

      if (isVertical) {
        e._state.clientHeight += (childrenCount - 1) * e._style.columnGap;
      }
    }

    if (isWrap) {
      // The size that was first calculated is size of the tallest child of all plus paddings. So
      // here we reset the size and build it again, for all rows.
      if (isHorizontal && e._style.height === undefined) {
        e._state.clientHeight =
          e._style.paddingTop +
          e._style.paddingBottom +
          e._style.borderTopWidth +
          e._style.borderBottomWidth;
      }
      if (isVertical && e._style.width === undefined) {
        e._state.clientWidth =
          e._style.paddingLeft +
          e._style.paddingRight +
          e._style.borderLeftWidth +
          e._style.borderRightWidth;
      }
    }

    const rows: Array<Array<View | Text>> = [[]];
    let main = 0;
    let cross = 0;
    let longestChildSize = 0;
    let c = e.firstChild;
    while (c) {
      if (c._style.position !== Position.Relative || c._style.display === Display.None) {
        c = c.next;
        continue;
      }

      const deltaMain = isHorizontal
        ? c._state.clientWidth +
          c._style.marginLeft +
          c._style.marginRight +
          (!isJustifySpace ? e._style.rowGap : 0)
        : c._state.clientHeight +
          c._style.marginTop +
          c._style.marginBottom +
          (!isJustifySpace ? e._style.columnGap : 0);
      const parentMain = isHorizontal
        ? e._state.clientWidth -
          e._style.paddingLeft -
          e._style.paddingRight -
          e._style.borderLeftWidth -
          e._style.borderRightWidth
        : e._state.clientHeight -
          e._style.paddingTop -
          e._style.paddingBottom -
          e._style.borderTopWidth -
          e._style.borderBottomWidth;

      if (isWrap && main + deltaMain > parentMain) {
        let length = longestChildSize;
        length += isHorizontal ? e._style.columnGap : e._style.rowGap;
        longestChildSize = 0;
        rows.push([]);
        if (isWrap) {
          if (isHorizontal && e._style.height === undefined) {
            e._state.clientHeight += length;
          }
          if (isVertical && e._style.width === undefined) {
            e._state.clientWidth += length;
          }
        }
        main = 0;
        cross += length;
      }
      main += deltaMain;

      // Keep track of the longest child in the flex container for the purpose of wrapping.
      longestChildSize = Math.max(
        longestChildSize,
        isHorizontal ? c._state.clientHeight : c._state.clientWidth
      );

      rows.at(-1)?.push(c);
      c = c.next;
    }
    e._state.children = rows;

    // The last row.
    if (isWrap) {
      if (isHorizontal && e._style.height === undefined) {
        e._state.clientHeight += longestChildSize;
      }
      if (isVertical && e._style.width === undefined) {
        e._state.clientWidth += longestChildSize;
      }
    }
  }

  /*
   * Third tree pass: resolve flex.
   * Going top-down, level order.
   */
  for (let i = 0; i < nodesInLevelOrder.length; i++) {
    const e = nodesInLevelOrder[i]!;
    invariant(e, "Empty queue.");
    const p = e.parent;

    if (e._style.flex < 0) {
      console.warn(`Found flex value ${e._style.flex} lower than 0. Resetting to 0.`);
      e._style.flex = 0;
    }

    if (e._style.overflowX === Overflow.Scroll) {
      e._state.clientWidth -= CROSS_AXIS_SIZE;
    }
    if (e._style.overflowY === Overflow.Scroll) {
      e._state.clientHeight -= CROSS_AXIS_SIZE;
    }

    const parentWidth = p?._state.clientWidth ?? 0;
    const parentHeight = p?._state.clientHeight ?? 0;

    const direction = e._style.flexDirection;
    const isHorizontal = direction === FlexDirection.Row || direction === FlexDirection.RowReverse;
    const isVertical =
      direction === FlexDirection.Column || direction === FlexDirection.ColumnReverse;
    const isReversed =
      direction === FlexDirection.RowReverse || direction === FlexDirection.ColumnReverse;
    const isJustifySpace =
      e._style.justifyContent === JustifyContent.SpaceBetween ||
      e._style.justifyContent === JustifyContent.SpaceAround ||
      e._style.justifyContent === JustifyContent.SpaceEvenly;
    const isContentSpace =
      e._style.alignContent === AlignContent.SpaceBetween ||
      e._style.alignContent === AlignContent.SpaceAround ||
      e._style.alignContent === AlignContent.SpaceEvenly;

    // If parent had undefined width or height and its size was only calculated once children sizes
    // were added, then percentage sizing should happen now.
    if (p?._style.width === undefined && typeof e._style.width === "string") {
      e._state.clientWidth = toPercentage(e._style.width) * parentWidth;
    }
    if (p?._style.height === undefined && typeof e._style.height === "string") {
      e._state.clientHeight = toPercentage(e._style.height) * parentHeight;
    }

    // If element has both left, right offsets and no width, calculate width (analogues for height).
    if (
      e._style.top !== undefined &&
      e._style.bottom !== undefined &&
      e._style.height === undefined
    ) {
      e._state.y = (p?._state.y ?? 0) + e._style.top;
      e._state.clientHeight = parentHeight - e._style.top - e._style.bottom;
    }
    if (
      e._style.left !== undefined &&
      e._style.right !== undefined &&
      e._style.width === undefined
    ) {
      e._state.x = (p?._state.x ?? 0) + e._style.left;
      e._state.clientWidth = parentWidth - e._style.left - e._style.right;
    }

    // Handle absolute positioning.
    if (e._style.position === Position.Absolute) {
      e._state.x = p?._state.x ?? 0;
      e._state.y = p?._state.y ?? 0;

      if (e._style.left !== undefined) {
        e._state.x = e._state.x + e._style.left;
      } else if (e._style.right !== undefined) {
        e._state.x =
          (p?._state.x ?? 0) + (p?._state.clientWidth ?? 0) - e._state.clientWidth - e._style.right;
      }
      if (e._style.top !== undefined) {
        e._state.y = e._state.y + e._style.top;
      } else if (e._style.bottom !== undefined) {
        e._state.y =
          (p?._state.y ?? 0) +
          (p?._state.clientHeight ?? 0) -
          e._state.clientHeight -
          e._style.bottom;
      }
    }

    if (e._style.flexWrap === FlexWrap.WrapReverse) {
      e._state.children.reverse();
    }

    if (isReversed) {
      e._state.children.forEach((row) => row.reverse());
    }

    const resetMain = isHorizontal
      ? e._state.x + e._style.paddingLeft + e._style.borderLeftWidth
      : e._state.y + e._style.paddingTop + e._style.borderTopWidth;
    const resetCross = isHorizontal
      ? e._state.y + e._style.paddingTop + e._style.borderTopWidth
      : e._state.x + e._style.paddingLeft + e._style.borderLeftWidth;
    let main = resetMain;
    let cross = resetCross;
    const mainGap = (isHorizontal ? e._style.rowGap : e._style.columnGap) ?? 0;
    const crossGap = (isHorizontal ? e._style.columnGap : e._style.rowGap) ?? 0;

    const maxCrossChildren: Array<number> = [];
    const childrenInLine: Array<number> = [];
    for (const line of e._state.children) {
      let maxCrossChild = 0;
      let childrenCount = 0;

      for (const c of line) {
        if (c._style.position !== Position.Relative || c._style.display === Display.None) {
          continue;
        }

        childrenCount += 1;
        maxCrossChild = Math.max(
          maxCrossChild,
          isHorizontal ? c._state.clientHeight : c._state.clientWidth
        );
      }
      maxCrossChildren.push(maxCrossChild);
      childrenInLine.push(childrenCount);
    }

    // Iterate over lines.
    for (let i = 0; i < e._state.children.length; i++) {
      const line = e._state.children[i]!;
      const maxCrossChild = maxCrossChildren[i]!;
      const childrenCount = childrenInLine[i]!;
      let totalFlexGrow = 0;
      let totalFlexShrink = 0;

      // Calculate available space for justify content along the main axis.
      let availableMain = isHorizontal
        ? e._state.clientWidth -
          e._style.paddingLeft -
          e._style.paddingRight -
          e._style.borderLeftWidth -
          e._style.borderRightWidth
        : e._state.clientHeight -
          e._style.paddingTop -
          e._style.paddingBottom -
          e._style.borderTopWidth -
          e._style.borderBottomWidth;
      if (!isJustifySpace) {
        availableMain -= mainGap * (line.length - 1);
      }

      let availableCross = isHorizontal
        ? e._state.clientHeight -
          e._style.paddingTop -
          e._style.paddingBottom -
          e._style.borderTopWidth -
          e._style.borderBottomWidth
        : e._state.clientWidth -
          e._style.paddingLeft -
          e._style.paddingRight -
          e._style.borderLeftWidth -
          e._style.borderRightWidth;
      for (let i = 0; i < maxCrossChildren.length; i++) {
        availableCross -= maxCrossChildren[i]!;
        if (i !== maxCrossChildren.length - 1 && !isContentSpace) {
          availableCross -= crossGap;
        }
      }

      if (e._style.overflowX === Overflow.Scroll && e._state.scrollWidth > e._state.clientWidth) {
        if (isHorizontal) {
          availableMain -= CROSS_AXIS_SIZE;
        } else {
          availableCross -= CROSS_AXIS_SIZE;
        }
      }
      if (e._style.overflowY === Overflow.Scroll && e._state.scrollHeight > e._state.clientHeight) {
        if (isVertical) {
          availableMain -= CROSS_AXIS_SIZE;
        } else {
          availableCross -= CROSS_AXIS_SIZE;
        }
      }

      for (const c of line) {
        if (c._style.position !== Position.Relative || c._style.display === Display.None) {
          continue;
        }

        availableMain -= isHorizontal
          ? c._state.clientWidth +
            (!isJustifySpace ? c._style.marginLeft + c._style.marginRight : 0)
          : c._state.clientHeight +
            (!isJustifySpace ? c._style.marginTop + c._style.marginBottom : 0);

        if (c._style.flex > 0 || c._style.flexGrow > 0) {
          if (c._style.flex > 0) {
            totalFlexGrow += c._style.flex;
          } else if (c._style.flexGrow > 0) {
            totalFlexGrow += c._style.flexGrow;
          }
        }
        if (c._style.flexShrink > 0) {
          totalFlexShrink += c._style.flexShrink;
        }
      }

      // Adjust positions for justify content.
      if (e._style.justifyContent === JustifyContent.Center) {
        // TODO: availableMain/cross is useful here for skipping own size, but we should ignore
        // border or padding here (and we don't).
        main += availableMain / 2;
      }
      if (
        (isReversed && e._style.justifyContent === JustifyContent.Start) ||
        (!isReversed && e._style.justifyContent === JustifyContent.End)
      ) {
        main += availableMain;
      }
      if (e._style.justifyContent === JustifyContent.SpaceAround) {
        main += availableMain / childrenCount / 2;
      }
      if (e._style.justifyContent === JustifyContent.SpaceEvenly) {
        main += availableMain / (childrenCount + 1);
      }

      // Align content.
      if (e._style.alignContent === AlignContent.Center) {
        // TODO: availableMain/cross is useful here for skipping own size, but we should ignore
        // border or padding here (and we don't).
        if (i === 0) {
          cross += availableCross / 2;
        }
      }
      if (e._style.alignContent === AlignContent.End) {
        if (i === 0) {
          cross += availableCross;
        }
      }
      if (e._style.alignContent === AlignContent.SpaceBetween) {
        if (i > 0) {
          cross += availableCross / (maxCrossChildren.length - 1);
        }
      }
      if (e._style.alignContent === AlignContent.SpaceAround) {
        const gap = availableCross / maxCrossChildren.length;
        cross += i === 0 ? gap / 2 : gap;
      }
      if (e._style.alignContent === AlignContent.SpaceEvenly) {
        const gap = availableCross / (maxCrossChildren.length + 1);
        cross += gap;
      }
      if (e._style.alignContent === AlignContent.Stretch) {
        if (i > 0) {
          cross += availableCross / maxCrossChildren.length;
        }
      }

      // Iterate over children and apply positions and flex sizes.
      for (const c of line) {
        if (c._style.position !== Position.Relative || c._style.display === Display.None) {
          continue;
        }

        if (!isJustifySpace) {
          if (availableMain > 0 && (c._style.flex > 0 || c._style.flexGrow > 0)) {
            const flexValue = c._style.flex || c._style.flexGrow;
            if (isHorizontal) {
              c._state.clientWidth += (flexValue / totalFlexGrow) * availableMain;
            } else {
              c._state.clientHeight += (flexValue / totalFlexGrow) * availableMain;
            }
          }
          if (availableMain < 0 && c._style.flexShrink > 0) {
            if (isHorizontal) {
              c._state.clientWidth += (c._style.flexShrink / totalFlexShrink) * availableMain;
            } else {
              c._state.clientHeight += (c._style.flexShrink / totalFlexShrink) * availableMain;
            }
          }
        }

        applyMinMaxAndAspectRatio(c);

        if (isJustifySpace) {
          c._state.x += isHorizontal ? main : cross;
          c._state.y += isHorizontal ? cross : main;
          main += isHorizontal ? c._state.clientWidth : c._state.clientHeight;

          if (e._style.justifyContent === JustifyContent.SpaceBetween) {
            main += availableMain / (childrenCount - 1);
          }
          if (e._style.justifyContent === JustifyContent.SpaceAround) {
            main += availableMain / childrenCount;
          }
          if (e._style.justifyContent === JustifyContent.SpaceEvenly) {
            main += availableMain / (childrenCount + 1);
          }
        } else {
          c._state.x += isHorizontal ? main + c._style.marginLeft : cross + c._style.marginLeft;
          c._state.y += isHorizontal ? cross + c._style.marginTop : main + c._style.marginTop;

          main += isHorizontal
            ? c._state.clientWidth + c._style.marginLeft + c._style.marginRight
            : c._state.clientHeight + c._style.marginTop + c._style.marginBottom;
          main += mainGap;

          let lineCrossSize = maxCrossChild;
          // If there's only one line, if the flex container has defined height, use it as the
          // cross size. For multi lines it's not relevant.
          if (e._state.children.length === 1) {
            lineCrossSize = Math.max(
              lineCrossSize,
              isHorizontal ? e._state.clientHeight : e._state.clientWidth
            );
          }

          // Apply align items.
          if (c._style.alignSelf === AlignSelf.Auto) {
            if (e._style.alignItems === AlignItems.Center) {
              if (isHorizontal) {
                c._state.y += (lineCrossSize - c._state.clientHeight) / 2;
              } else {
                c._state.x += (lineCrossSize - c._state.clientWidth) / 2;
              }
            }
            if (e._style.alignItems === AlignItems.End) {
              if (isHorizontal) {
                c._state.y += lineCrossSize - c._state.clientHeight;
              } else {
                c._state.x += lineCrossSize - c._state.clientWidth;
              }
            }
            if (
              e._style.alignItems === AlignItems.Stretch &&
              ((isHorizontal && c._style.height === undefined) ||
                (isVertical && c._style.width === undefined))
            ) {
              if (isHorizontal) {
                c._state.clientHeight = lineCrossSize;
              } else {
                c._state.clientWidth = lineCrossSize;
              }
            }
          }

          // Apply align self.
          if (c._style.alignSelf === AlignSelf.Start) {
            if (isHorizontal) {
              c._state.y = resetCross;
            } else {
              c._state.x = resetCross;
            }
          }
          if (c._style.alignSelf === AlignSelf.Center) {
            if (isHorizontal) {
              c._state.y += (lineCrossSize - c._state.clientHeight) / 2;
            } else {
              c._state.x += (lineCrossSize - c._state.clientWidth) / 2;
            }
          }
          if (c._style.alignSelf === AlignSelf.End) {
            if (isHorizontal) {
              c._state.y += lineCrossSize - c._state.clientHeight;
            } else {
              c._state.x += lineCrossSize - c._state.clientWidth;
            }
          }
          if (
            c._style.alignSelf === AlignSelf.Stretch &&
            ((isHorizontal && c._style.height === undefined) ||
              (isVertical && c._style.width === undefined))
          ) {
            if (isHorizontal) {
              c._state.y = resetCross;
              c._state.clientHeight = lineCrossSize;
            } else {
              c._state.x = resetCross;
              c._state.clientWidth = lineCrossSize;
            }
          }
        }

        // Add left, top, right, bottom offsets.
        if (c._style.left) {
          c._state.x += c._style.left;
        } else if (c._style.right) {
          c._state.x -= c._style.right;
        }
        if (c._style.top) {
          c._state.y += c._style.top;
        } else if (c._style.bottom) {
          c._state.y -= c._style.bottom;
        }
      }

      main = resetMain;
      cross += maxCrossChild + crossGap;
    }

    e._state.children = [];
    e._state.x = Math.round(e._state.x);
    e._state.y = Math.round(e._state.y);
    e._state.clientWidth = Math.round(e._state.clientWidth);
    e._state.clientHeight = Math.round(e._state.clientHeight);
  }

  /*
   * Fourth tree pass: calculate scroll sizes.
   * Going top-down, level order.
   */
  for (let i = 0; i < nodesInLevelOrder.length; i++) {
    const e = nodesInLevelOrder[i]!;
    invariant(e, "Empty queue.");

    const hasHorizontalScroll = e._style.overflowX === Overflow.Scroll;
    const hasVerticalScroll = e._style.overflowY === Overflow.Scroll;

    if (hasHorizontalScroll || hasVerticalScroll) {
      let farthestX = 0;
      let farthestY = 0;
      let c = e.firstChild;
      while (c) {
        const potentialHorizontalScroll =
          c._style.overflowX === Overflow.Scroll ? CROSS_AXIS_SIZE : 0;
        const potentialVerticalScroll =
          c._style.overflowY === Overflow.Scroll ? CROSS_AXIS_SIZE : 0;
        farthestX = Math.max(
          farthestX,
          c._state.x +
            c._style.marginLeft +
            c._state.clientWidth +
            potentialHorizontalScroll +
            c._style.marginRight -
            e._state.x
        );
        farthestY = Math.max(
          farthestY,
          c._state.y +
            c._style.marginTop +
            c._state.clientHeight +
            potentialVerticalScroll +
            c._style.marginBottom -
            e._state.y
        );
        c = c.next;
      }

      farthestX += e._style.paddingRight + e._style.borderRightWidth;
      farthestY += e._style.paddingBottom + e._style.borderBottomWidth;

      e._state.scrollWidth = Math.max(farthestX, e._state.clientWidth);
      e._state.scrollHeight = Math.max(farthestY, e._state.clientHeight);
    } else {
      e._state.scrollWidth = e._state.clientWidth;
      e._state.scrollHeight = e._state.clientHeight;
    }
  }
}

function toPercentage(value: string): number {
  invariant(value.endsWith("%"), "Value must be a percentage.");
  const result = Number(value.replace("%", "")) / 100;
  invariant(Number.isFinite(result), "Value must be a real fraction.");
  return result;
}

function applyMinMaxAndAspectRatio(e: View | Text): void {
  let minHeight = 0;
  let minWidth = 0;
  let maxHeight = Number.POSITIVE_INFINITY;
  let maxWidth = Number.POSITIVE_INFINITY;

  if (e._style.minHeight !== undefined) {
    const value =
      typeof e._style.minHeight === "string"
        ? toPercentage(e._style.minHeight) * (e.parent?._state.clientHeight ?? 0)
        : e._style.minHeight;
    minHeight = value;
  }
  if (e._style.minWidth !== undefined) {
    const value =
      typeof e._style.minWidth === "string"
        ? toPercentage(e._style.minWidth) * (e.parent?._state.clientWidth ?? 0)
        : e._style.minWidth;
    minWidth = value;
  }
  if (e._style.maxHeight !== undefined) {
    const value =
      typeof e._style.maxHeight === "string"
        ? toPercentage(e._style.maxHeight) * (e.parent?._state.clientHeight ?? 0)
        : e._style.maxHeight;
    maxHeight = value;
  }
  if (e._style.maxWidth !== undefined) {
    const value =
      typeof e._style.maxWidth === "string"
        ? toPercentage(e._style.maxWidth) * (e.parent?._state.clientWidth ?? 0)
        : e._style.maxWidth;
    maxWidth = value;
  }

  let effectiveWidth = Math.min(Math.max(e._state.clientWidth, minWidth), maxWidth);
  let effectiveHeight = Math.min(Math.max(e._state.clientHeight, minHeight), maxHeight);

  const isHorizontal =
    e.parent?._style.flexDirection === FlexDirection.Row ||
    e.parent?._style.flexDirection === FlexDirection.RowReverse;

  if (e._style.aspectRatio !== undefined) {
    const aspectRatio = e._style.aspectRatio;
    if ((e._style.width !== undefined || minWidth > 0) && e._style.height === undefined) {
      const calculatedHeight = effectiveWidth / aspectRatio;
      effectiveHeight = Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
    } else if ((e._style.height !== undefined || minHeight > 0) && e._style.width === undefined) {
      const calculatedWidth = effectiveHeight * aspectRatio;
      effectiveWidth = Math.min(Math.max(calculatedWidth, minWidth), maxWidth);
    } else if (e._style.width === undefined && e._style.height === undefined) {
      // If both width and height are undefined.
      if (isHorizontal) {
        effectiveHeight = Math.min(Math.max(effectiveWidth / aspectRatio, minHeight), maxHeight);
      } else {
        effectiveWidth = Math.min(Math.max(effectiveHeight * aspectRatio, minWidth), maxWidth);
      }
    } else {
      // Both width and height are defined.
      if (isHorizontal) {
        effectiveHeight = effectiveWidth / aspectRatio;
      } else {
        effectiveWidth = effectiveHeight * aspectRatio;
      }
      effectiveWidth = Math.min(Math.max(effectiveWidth, minWidth), maxWidth);
      effectiveHeight = Math.min(Math.max(effectiveHeight, minHeight), maxHeight);
    }
  }

  e._state.clientWidth = effectiveWidth;
  e._state.clientHeight = effectiveHeight;
}
