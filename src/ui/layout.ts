import { Queue } from "../utils/Queue";
import { Vec2 } from "../math/Vec2";
import type { Lookups } from "../font/types";
import { View } from "../View";
import { invariant } from "../utils/invariant";
import { shapeText } from "../font/shapeText";
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

    // Undefined is ruled out by the previous pass.
    const parentWidth = p?._state.metrics.width ?? 0;
    const parentHeight = p?._state.metrics.height ?? 0;

    if (typeof e._style.width === "string") {
      e._state.metrics.width = toPercentage(e._style.width) * parentWidth;
    }

    if (typeof e._style.height === "string") {
      e._state.metrics.height = toPercentage(e._style.height) * parentHeight;
    }

    // Add margins.
    e._state.metrics.x += e._style.marginLeft;
    e._state.metrics.y += e._style.marginTop;

    /*
     * Ideally text shaping should be done outside of the layout function.
     * Unfortunately this makes things so much easier since the height
     * calculated here will be used for further calcualations of other elements
     * so it's not obvious whether this could be done before or after layout.
     */
    if ("text" in e) {
      if (p?._state.metrics.width !== undefined) {
        const maxWidth =
          p._state.metrics.width -
          (p._style.paddingLeft ?? 0) -
          (p._style.paddingRight ?? 0);
        e._style.maxWidth = maxWidth;

        const shape = shapeText({
          fontName: e._style.fontName,
          fontSize: e._style.fontSize,
          lineHeight: e._style.lineHeight,
          lookups: fontLookups,
          maxWidth: maxWidth,
          text: e.text,
        });

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

    // Width is at least the sum of children with defined widths.
    if (e._style.width === undefined) {
      let childrenCount = 0;

      let c = e.firstChild;
      while (c) {
        if (c._state.metrics.width || typeof c._style.width === "number") {
          if (
            e._style.flexDirection === "row" &&
            c._style.position === "relative"
          ) {
            e._state.metrics.width +=
              c._state.metrics.width +
              c._style.marginLeft +
              c._style.marginRight;
          }

          if (
            e._style.flexDirection === "column" &&
            c._style.position === "relative"
          ) {
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
        if (c._state.metrics.height || typeof c._style.height === "number") {
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

      e._state.metrics.height +=
        e._style.paddingTop +
        e._style.paddingBottom +
        (e._style.flexDirection === "column"
          ? (childrenCount - 1) * e._style.columnGap
          : 0);
    }

    if (e._style.overflow === "scroll") {
      let farthestX = 0;
      let farthestY = 0;

      let c = e.firstChild;
      while (c) {
        const childFarX = c._state.metrics.x + c._state.metrics.width;
        const childFarY = c._state.metrics.y + c._state.metrics.height;
        console.log(e.props.testID, c._state.metrics.x, childFarX, childFarY);

        if (childFarX > farthestX) {
          farthestX = childFarX;
        }

        if (childFarY > farthestY) {
          farthestY = childFarY;
        }

        c = c.next;
      }

      e._state.scrollableContentSize = new Vec2(
        Math.max(farthestX, e._state.metrics.width),
        Math.max(farthestY, e._state.metrics.height)
      );
    } else {
      e._state.scrollableContentSize = new Vec2(
        e._state.metrics.width,
        e._state.metrics.height
      );
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

    // Apply top, left, right, bottom properties.
    if (
      e._style.left !== undefined &&
      e._style.right !== undefined &&
      e._style.width === undefined
    ) {
      e._state.metrics.x = (p?._state.metrics.x ?? 0) + e._style.left;
      e._state.metrics.width = parentWidth - e._style.left - e._style.right;
    } else if (e._style.left !== undefined) {
      if (e._style.position === "absolute") {
        e._state.metrics.x = (p?._state.metrics.x ?? 0) + (e._style.left ?? 0);
      } else {
        e._state.metrics.x += e._style.left ?? 0;
      }
    } else if (e._style.right !== undefined) {
      e._state.metrics.x =
        e._style.position === "absolute"
          ? (p?._state.metrics.x ?? 0) +
            parentWidth -
            e._style.right -
            e._state.metrics.width
          : (p?._state.metrics.x ?? 0) - e._style.right;
    } else if (e._style.position === "absolute") {
      /*
       * If position is "absolute" but offsets are not specified, set
       * position to parent's top left corner.
       */
      e._state.metrics.x = p?._state.metrics.x ?? 0;
    }
    if (
      e._style.top !== undefined &&
      e._style.bottom !== undefined &&
      e._style.height === undefined
    ) {
      e._state.metrics.y = (p?._state.metrics.y ?? 0) + e._style.top;
      e._state.metrics.height = parentHeight - e._style.top - e._style.bottom;
    } else if (e._style.top !== undefined) {
      if (e._style.position === "absolute") {
        e._state.metrics.y = (p?._state.metrics.y ?? 0) + e._style.top;
      } else {
        e._state.metrics.y += e._style.top;
      }
    } else if (e._style.bottom !== undefined) {
      e._state.metrics.y =
        e._style.position === "absolute"
          ? (p?._state.metrics.y ?? 0) +
            parentHeight -
            e._style.bottom -
            e._state.metrics.height
          : (p?._state.metrics.y ?? 0) - e._style.bottom;
    } else if (e._style.position === "absolute") {
      /*
       * If position is "absolute" but offsets are not specified, set
       * position to parent's top left corner.
       */
      e._state.metrics.y = p?._state.metrics.y ?? 0;
    }

    // Apply align self.
    if (e._style.position !== "absolute" && p) {
      if (p?._style.flexDirection === "row") {
        if (e._style.alignSelf === "center") {
          e._state.metrics.y =
            e._state.metrics.y +
            p._state.metrics.height / 2 -
            e._state.metrics.height / 2;
        }

        if (e._style.alignSelf === "flex-end") {
          e._state.metrics.y =
            e._state.metrics.y +
            p._state.metrics.height -
            e._state.metrics.height -
            p._style.paddingBottom -
            p._style.paddingTop;
        }

        if (e._style.alignSelf === "stretch") {
          e._state.metrics.height =
            p._state.metrics.height -
            p._style.paddingBottom -
            p._style.paddingTop;
        }
      }

      if (p?._style.flexDirection === "column") {
        if (e._style.alignSelf === "center") {
          e._state.metrics.x =
            e._state.metrics.x +
            p._state.metrics.width / 2 -
            e._state.metrics.width / 2;
        }

        if (e._style.alignSelf === "flex-end") {
          e._state.metrics.x =
            e._state.metrics.x +
            p._state.metrics.width -
            e._state.metrics.width -
            p._style.paddingLeft -
            p._style.paddingRight;
        }

        if (e._style.alignSelf === "stretch") {
          e._state.metrics.width =
            p._state.metrics.width -
            p._style.paddingLeft -
            p._style.paddingRight;
        }
      }
    }

    // Set sizes for children that use percentages.
    let c = e.firstChild;
    while (c) {
      if (typeof c._style.width === "string") {
        c._state.metrics.width =
          toPercentage(c._style.width) * e._state.metrics.width;
      }
      if (typeof c._style.height === "string") {
        c._state.metrics.height =
          toPercentage(c._style.height) * e._state.metrics.height;
      }
      c = c.next;
    }

    // Take zIndex from parent if not set.
    e._style.zIndex = e._style.zIndex ?? p?._style.zIndex ?? 0;

    let availableWidth = e._state.metrics.width;
    let availableHeight = e._state.metrics.height;

    // Count children and total flex value.
    c = e.firstChild;
    while (c) {
      if (c._style.position === "relative") {
        childrenCount += 1;
      }

      /*
       * TODO: maybe flex can be reset to 0 instead of undefined and this can
       * be checked somehow else?
       */
      if (
        e._style.flexDirection === "row" &&
        c._style.flex === undefined &&
        c._style.position === "relative"
      ) {
        availableWidth -= c._state.metrics.width;
      }
      if (
        e._style.flexDirection === "column" &&
        c._style.flex === undefined &&
        c._style.position === "relative"
      ) {
        availableHeight -= c._state.metrics.height;
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

    availableWidth -=
      e._style.paddingLeft +
      e._style.paddingRight +
      (e._style.flexDirection === "row" &&
      e._style.justifyContent !== "space-between" &&
      e._style.justifyContent !== "space-around" &&
      e._style.justifyContent !== "space-evenly"
        ? (childrenCount - 1) * e._style.rowGap
        : 0);
    availableHeight -=
      e._style.paddingTop +
      e._style.paddingBottom +
      (e._style.flexDirection === "column" &&
      e._style.justifyContent !== "space-between" &&
      e._style.justifyContent !== "space-around" &&
      e._style.justifyContent !== "space-evenly"
        ? (childrenCount - 1) * e._style.columnGap
        : 0);

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

    // Determine positions.
    let x = e._state.metrics.x + e._style.paddingLeft;
    let y = e._state.metrics.y + e._style.paddingTop;

    // Apply justify content.
    if (e._style.flexDirection === "row") {
      if (e._style.justifyContent === "center") {
        x += availableWidth / 2;
      }

      if (e._style.justifyContent === "flex-end") {
        x += availableWidth;
      }
    }
    if (e._style.flexDirection === "column") {
      if (e._style.justifyContent === "center") {
        y += availableHeight / 2;
      }

      if (e._style.justifyContent === "flex-end") {
        y += availableHeight;
      }
    }

    /*
     * NOTE: order of applying justify content, this and align items is
     * important.
     */
    if (
      e._style.justifyContent === "space-between" ||
      e._style.justifyContent === "space-around" ||
      e._style.justifyContent === "space-evenly"
    ) {
      const count =
        childrenCount +
        (e._style.justifyContent === "space-between"
          ? -1
          : e._style.justifyContent === "space-evenly"
          ? 1
          : 0);

      const horizontalGap = availableWidth / count;
      const verticalGap = availableHeight / count;

      c = e.firstChild;
      while (c) {
        c._state.metrics.x =
          x +
          (e._style.justifyContent === "space-between"
            ? 0
            : e._style.justifyContent === "space-around"
            ? horizontalGap / 2
            : horizontalGap);
        c._state.metrics.y =
          y +
          (e._style.justifyContent === "space-between"
            ? 0
            : e._style.justifyContent === "space-around"
            ? verticalGap / 2
            : verticalGap);

        if (e._style.flexDirection === "row") {
          x += c._state.metrics.width + horizontalGap;
        }
        if (e._style.flexDirection === "column") {
          y += c._state.metrics.height + verticalGap;
        }

        c = c.next;
      }
    } else {
      c = e.firstChild;
      while (c) {
        if (c._style.position === "absolute" || c._style.display === "none") {
          c = c.next;
          continue;
        }

        if (e._style.flexDirection === "row") {
          c._state.metrics.x = x;
          x += c._state.metrics.width;
          x += e._style.rowGap;
        } else {
          c._state.metrics.x = x + c._state.metrics.x;
        }
        if (e._style.flexDirection === "column") {
          c._state.metrics.y = y;
          y += c._state.metrics.height;
          y += e._style.columnGap;
        } else {
          c._state.metrics.y = y + c._state.metrics.y;
        }

        c = c.next;
      }
    }

    // Apply align items.
    c = e.firstChild;
    while (c) {
      if (c._style.position === "absolute") {
        c = c.next;
        continue;
      }

      if (e._style.flexDirection === "row") {
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

        if (e._style.alignItems === "stretch" && c._style.width === undefined) {
          c._state.metrics.width =
            e._state.metrics.width -
            e._style.paddingLeft -
            e._style.paddingRight;
        }
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
