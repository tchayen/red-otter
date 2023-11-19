import { Queue } from "../utils/Queue";
import { Vec2 } from "../math/Vec2";
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
  const firstPass = new Queue<View | Text>();
  const secondPass = new Queue<View | Text>();
  const thirdPass = new Queue<View | Text>();

  // TODO: inspect what would it take to get rid of root and use tree directly.
  const root = new View({
    style: {
      height: rootSize.y,
      overflow: Overflow.Scroll,
      width: rootSize.x,
    },
    testID: "layout#root",
  });
  root.add(tree);

  /*
   * NOTE:
   * Code style detail: `e` is an element, `c` is a child, `p` is a parent.
   */

  // Traverse tree in level order and generate the reverse queue.
  firstPass.enqueue(root);
  secondPass.enqueue(root);
  while (!firstPass.isEmpty()) {
    const e = firstPass.dequeue();
    invariant(e, "Empty queue.");

    const isHorizontal =
      e.parent?._style.flexDirection === FlexDirection.Row ||
      e.parent?._style.flexDirection === FlexDirection.RowReverse;

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
    if (typeof e._style.flexBasis === "number") {
      if (isHorizontal) {
        e._state.metrics.width = e._style.flexBasis;
      } else {
        e._state.metrics.height = e._style.flexBasis;
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
    if (typeof e._style.flexBasis === "string") {
      if (isHorizontal) {
        e._state.metrics.width =
          toPercentage(e._style.flexBasis) * (e.parent?._state.metrics.width ?? 0);
      } else {
        e._state.metrics.height =
          toPercentage(e._style.flexBasis) * (e.parent?._state.metrics.height ?? 0);
      }
    }

    const p = e.parent;
    if (e instanceof Text && fontLookups) {
      if (p?._state.metrics.width !== undefined) {
        const maxWidth = p._state.metrics.width - p._style.paddingLeft - p._style.paddingRight;
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

        e._state.metrics.width = shape.boundingRectangle.width;
        e._state.metrics.height = shape.boundingRectangle.height;
      }
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
        if (c._state.metrics.width) {
          if (
            (e._style.flexDirection === FlexDirection.Row ||
              e._style.flexDirection === FlexDirection.RowReverse) &&
            c._style.position === Position.Relative
          ) {
            // Padding is inside the width.
            e._state.metrics.width +=
              c._state.metrics.width + c._style.marginLeft + c._style.marginRight;
          }
          if (
            (e._style.flexDirection === FlexDirection.Column ||
              e._style.flexDirection === FlexDirection.ColumnReverse) &&
            c._style.position === Position.Relative
          ) {
            // For column layout only wraps the widest child.
            e._state.metrics.width = Math.max(
              e._state.metrics.width,
              c._state.metrics.width + c._style.marginLeft + c._style.marginRight
            );
          }
        }
        if (c._style.position === Position.Relative) {
          childrenCount += 1;
        }
        c = c.next;
      }

      // Include padding and gaps.
      e._state.metrics.width += e._style.paddingLeft + e._style.paddingRight;

      if (
        e._style.flexDirection === FlexDirection.Row ||
        e._style.flexDirection === FlexDirection.RowReverse
      ) {
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
            (e._style.flexDirection === FlexDirection.Column ||
              e._style.flexDirection === FlexDirection.ColumnReverse) &&
            c._style.position === Position.Relative
          ) {
            e._state.metrics.height +=
              c._state.metrics.height + c._style.marginTop + c._style.marginBottom;
          }
          if (
            (e._style.flexDirection === FlexDirection.Row ||
              e._style.flexDirection === FlexDirection.RowReverse) &&
            c._style.position === Position.Relative
          ) {
            e._state.metrics.height = Math.max(
              e._state.metrics.height,
              c._state.metrics.height + c._style.marginTop + c._style.marginBottom
            );
          }
        }
        if (c._style.position === Position.Relative) {
          childrenCount += 1;
        }
        c = c.next;
      }

      // Include padding and gaps.
      e._state.metrics.height += e._style.paddingTop + e._style.paddingBottom;

      if (
        e._style.flexDirection === FlexDirection.Column ||
        e._style.flexDirection === FlexDirection.ColumnReverse
      ) {
        e._state.metrics.height += (childrenCount - 1) * e._style.columnGap;
      }
    }

    if (isWrap) {
      // The size that was first calculated is size of the tallest child of all plus paddings. So
      // here we reset the size and build it again, for all rows.
      if (isHorizontal && e._style.height === undefined) {
        e._state.metrics.height = e._style.paddingTop + e._style.paddingBottom;
      }
      if (isVertical && e._style.width === undefined) {
        e._state.metrics.width = e._style.paddingLeft + e._style.paddingRight;
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
        ? c._state.metrics.width +
          c._style.marginLeft +
          c._style.marginRight +
          (!isJustifySpace ? e._style.rowGap : 0)
        : c._state.metrics.height +
          c._style.marginTop +
          c._style.marginBottom +
          (!isJustifySpace ? e._style.columnGap : 0);
      const parentMain = isHorizontal
        ? e._state.metrics.width - e._style.paddingLeft - e._style.paddingRight
        : e._state.metrics.height - e._style.paddingTop - e._style.paddingBottom;

      if (isWrap && main + deltaMain > parentMain) {
        let length = longestChildSize;
        length += isHorizontal ? e._style.columnGap : e._style.rowGap;
        longestChildSize = 0;
        rows.push([]);
        if (isWrap) {
          if (isHorizontal && e._style.height === undefined) {
            e._state.metrics.height += length;
          }
          if (isVertical && e._style.width === undefined) {
            e._state.metrics.width += length;
          }
        }
        main = 0;
        cross += length;
      }
      main += deltaMain;

      // Keep track of the longest child in the flex container for the purpose of wrapping.
      longestChildSize = Math.max(
        longestChildSize,
        isHorizontal ? c._state.metrics.height : c._state.metrics.width
      );

      rows.at(-1)?.push(c);
      c = c.next;
    }
    e._state.children = rows;

    // The last row.
    if (isWrap) {
      if (isHorizontal && e._style.height === undefined) {
        e._state.metrics.height += longestChildSize;
      }
      if (isVertical && e._style.width === undefined) {
        e._state.metrics.width += longestChildSize;
      }
    }

    if (e._style.overflow === Overflow.Scroll) {
      let farthestX = 0;
      let farthestY = 0;
      let c = e.firstChild;
      while (c) {
        farthestX = Math.max(
          farthestX,
          c._state.metrics.x + c._state.metrics.width + c._style.marginRight - e._state.metrics.x
        );
        farthestY = Math.max(
          farthestY,
          c._state.metrics.y + c._state.metrics.height + c._style.marginBottom - e._state.metrics.y
        );
        c = c.next;
      }

      farthestX += e._style.paddingRight;
      farthestY += e._style.paddingBottom;

      e._state.scrollSize = new Vec2(
        Math.max(farthestX, e._state.metrics.width),
        Math.max(farthestY, e._state.metrics.height)
      );
    } else {
      e._state.scrollSize = new Vec2(e._state.metrics.width, e._state.metrics.height);
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

    if (e._style.flex < 0) {
      console.warn(`Found flex value ${e._style.flex} lower than 0. Resetting to 0.`);
      e._style.flex = 0;
    }

    const parentWidth = p?._state.metrics.width ?? 0;
    const parentHeight = p?._state.metrics.height ?? 0;

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
    if (e._style.position === Position.Absolute) {
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

    if (e._style.flexWrap === FlexWrap.WrapReverse) {
      e._state.children.reverse();
    }

    if (isReversed) {
      e._state.children.forEach((row) => row.reverse());
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
          isHorizontal ? c._state.metrics.height : c._state.metrics.width
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
        ? e._state.metrics.width - e._style.paddingLeft - e._style.paddingRight
        : e._state.metrics.height - e._style.paddingTop - e._style.paddingBottom;
      if (!isJustifySpace) {
        availableMain -= mainGap * (line.length - 1);
      }
      if (
        e._style.overflowX === Overflow.Scroll &&
        e._state.scrollSize.x > e._state.metrics.width
      ) {
        availableMain -= CROSS_AXIS_SIZE;
      }
      if (
        e._style.overflowY === Overflow.Scroll &&
        e._state.scrollSize.y > e._state.metrics.height
      ) {
        availableMain -= CROSS_AXIS_SIZE;
      }
      let availableCross = isHorizontal
        ? e._state.metrics.height - e._style.paddingTop - e._style.paddingBottom
        : e._state.metrics.width - e._style.paddingLeft - e._style.paddingRight;
      for (let i = 0; i < maxCrossChildren.length; i++) {
        availableCross -= maxCrossChildren[i]!;
        if (i !== maxCrossChildren.length - 1 && !isContentSpace) {
          availableCross -= crossGap;
        }
      }

      for (const c of line) {
        if (c._style.position !== Position.Relative || c._style.display === Display.None) {
          continue;
        }

        availableMain -= isHorizontal
          ? c._state.metrics.width +
            (!isJustifySpace ? c._style.marginLeft + c._style.marginRight : 0)
          : c._state.metrics.height +
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
              c._state.metrics.width += (flexValue / totalFlexGrow) * availableMain;
            } else {
              c._state.metrics.height += (flexValue / totalFlexGrow) * availableMain;
            }
          }
          if (availableMain < 0 && c._style.flexShrink > 0) {
            if (isHorizontal) {
              c._state.metrics.width += (c._style.flexShrink / totalFlexShrink) * availableMain;
            } else {
              c._state.metrics.height += (c._style.flexShrink / totalFlexShrink) * availableMain;
            }
          }
        }

        applyMinMaxAndAspectRatio(c);

        if (isJustifySpace) {
          c._state.metrics.x += isHorizontal ? main : cross;
          c._state.metrics.y += isHorizontal ? cross : main;
          main += isHorizontal ? c._state.metrics.width : c._state.metrics.height;

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

          let lineCrossSize = maxCrossChild;
          // If there's only one line, if the flex container has defined height, use it as the
          // cross size. For multi lines it's not relevant.
          if (e._state.children.length === 1) {
            lineCrossSize = Math.max(
              lineCrossSize,
              isHorizontal ? e._state.metrics.height : e._state.metrics.width
            );
          }

          // Apply align items.
          if (c._style.alignSelf === AlignSelf.Auto) {
            if (e._style.alignItems === AlignItems.Center) {
              if (isHorizontal) {
                c._state.metrics.y += (lineCrossSize - c._state.metrics.height) / 2;
              } else {
                c._state.metrics.x += (lineCrossSize - c._state.metrics.width) / 2;
              }
            }
            if (e._style.alignItems === AlignItems.End) {
              if (isHorizontal) {
                c._state.metrics.y += lineCrossSize - c._state.metrics.height;
              } else {
                c._state.metrics.x += lineCrossSize - c._state.metrics.width;
              }
            }
            if (
              e._style.alignItems === AlignItems.Stretch &&
              ((isHorizontal && c._style.height === undefined) ||
                (isVertical && c._style.width === undefined))
            ) {
              if (isHorizontal) {
                c._state.metrics.height = lineCrossSize;
              } else {
                c._state.metrics.width = lineCrossSize;
              }
            }
          }

          // Apply align self.
          if (c._style.alignSelf === AlignSelf.Start) {
            if (isHorizontal) {
              c._state.metrics.y = resetCross;
            } else {
              c._state.metrics.x = resetCross;
            }
          }
          if (c._style.alignSelf === AlignSelf.Center) {
            if (isHorizontal) {
              c._state.metrics.y += (lineCrossSize - c._state.metrics.height) / 2;
            } else {
              c._state.metrics.x += (lineCrossSize - c._state.metrics.width) / 2;
            }
          }
          if (c._style.alignSelf === AlignSelf.End) {
            if (isHorizontal) {
              c._state.metrics.y += lineCrossSize - c._state.metrics.height;
            } else {
              c._state.metrics.x += lineCrossSize - c._state.metrics.width;
            }
          }
          if (
            c._style.alignSelf === AlignSelf.Stretch &&
            ((isHorizontal && c._style.height === undefined) ||
              (isVertical && c._style.width === undefined))
          ) {
            if (isHorizontal) {
              c._state.metrics.y = resetCross;
              c._state.metrics.height = lineCrossSize;
            } else {
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
      cross += maxCrossChild + crossGap;
    }

    // // Trim widths and heights to the root size (including position).
    // if (e._state.metrics.x + e._state.metrics.width > rootSize.x) {
    //   e._state.metrics.width = Math.max(0, rootSize.x - e._state.metrics.x);
    // }
    // if (e._state.metrics.y + e._state.metrics.height > rootSize.y) {
    //   e._state.metrics.height = Math.max(0, rootSize.y - e._state.metrics.y);
    // }

    e._state.children = [];
    e._state.metrics.x = Math.round(e._state.metrics.x);
    e._state.metrics.y = Math.round(e._state.metrics.y);
    e._state.metrics.width = Math.round(e._state.metrics.width);
    e._state.metrics.height = Math.round(e._state.metrics.height);

    console.log(e.props.testID, e._state.scrollSize, e);
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
        ? toPercentage(e._style.minHeight) * (e.parent?._state.metrics.height ?? 0)
        : e._style.minHeight;
    minHeight = value;
  }
  if (e._style.minWidth !== undefined) {
    const value =
      typeof e._style.minWidth === "string"
        ? toPercentage(e._style.minWidth) * (e.parent?._state.metrics.width ?? 0)
        : e._style.minWidth;
    minWidth = value;
  }
  if (e._style.maxHeight !== undefined) {
    const value =
      typeof e._style.maxHeight === "string"
        ? toPercentage(e._style.maxHeight) * (e.parent?._state.metrics.height ?? 0)
        : e._style.maxHeight;
    maxHeight = value;
  }
  if (e._style.maxWidth !== undefined) {
    const value =
      typeof e._style.maxWidth === "string"
        ? toPercentage(e._style.maxWidth) * (e.parent?._state.metrics.width ?? 0)
        : e._style.maxWidth;
    maxWidth = value;
  }

  let effectiveWidth = Math.min(Math.max(e._state.metrics.width, minWidth), maxWidth);
  let effectiveHeight = Math.min(Math.max(e._state.metrics.height, minHeight), maxHeight);

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

  e._state.metrics.width = effectiveWidth;
  e._state.metrics.height = effectiveHeight;
}
