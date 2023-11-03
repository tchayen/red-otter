import { Queue } from "./utils/Queue";
import { Vec2 } from "./math/Vec2";
import type { Lookups } from "./font/types";
import { View } from "./View";
import { invariant } from "./utils/invariant";
import { shapeText } from "./font/shapeText";
import { Text } from "./Text";

/**
 * @param tree tree of views to layout.
 * @param fontLookups used for calculating text sizes.
 */
export function layout(tree: View, fontLookups: Lookups, rootSize: Vec2): void {
  const firstPass = new Queue<View | Text>();
  const secondPass = new Queue<View | Text>();
  const thirdPass = new Queue<View | Text>();

  const root = new View({ style: { height: rootSize.y, width: rootSize.x } });

  root.add(tree);

  // NOTE:
  // Code style detail: `e` is an element, `c` is a child, `p` is a parent.

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

    e.__state.layout = { height: 0, width: 0, x: 0, y: 0 };

    // If element has defined width or height, set it.
    if (typeof e.style.width === "number") {
      e.__state.layout.width = e.style.width;
    }
    if (typeof e.style.height === "number") {
      e.__state.layout.height = e.style.height;
    }

    // Undefined is ruled out by the previous pass.
    const parentWidth = p?.__state.layout.width ?? 0;
    const parentHeight = p?.__state.layout.height ?? 0;

    if (typeof e.style.width === "string") {
      e.__state.layout.width = toPercentage(e.style.width) * parentWidth;
    }

    if (typeof e.style.height === "string") {
      e.__state.layout.height = toPercentage(e.style.height) * parentHeight;
    }

    // Ideally text shaping should be done outside of the layout function.
    // Unfortunately this makes things so much easier since the height
    // calculated here will be used for further calcualations of other elements
    // so it's not obvious whether this could be done before or after layout.
    if ("text" in e) {
      if (p?.__state.layout.width !== undefined) {
        const maxWidth =
          p.__state.layout.width -
          (p.style.paddingLeft ?? 0) -
          (p.style.paddingRight ?? 0);
        e.style.maxWidth = maxWidth;

        const shape = shapeText({
          fontName: e.style.fontName,
          fontSize: e.style.fontSize,
          lineHeight: e.style.lineHeight,
          lookups: fontLookups,
          maxWidth: maxWidth,
          text: e.text,
        });

        e.__state.layout.height = shape.boundingRectangle.height;
      }
    }
  }

  // Second tree pass: resolve wrapping children.
  // Going bottom-up, level order.
  while (!secondPass.isEmpty()) {
    const e = secondPass.dequeueFront();
    invariant(e, "Empty queue.");
    thirdPass.enqueue(e);

    // Width is at least the sum of children with defined widths.
    if (e.style.width === undefined) {
      let childrenCount = 0;

      let c = e.firstChild;
      while (c) {
        if (c.__state.layout.width || typeof c.style.width === "number") {
          if (
            e.style.flexDirection === "row" &&
            c.style.position === "relative"
          ) {
            e.__state.layout.width +=
              c.__state.layout.width + c.style.marginLeft + c.style.marginRight;
          }

          if (
            e.style.flexDirection === "column" &&
            c.style.position === "relative"
          ) {
            e.__state.layout.width = Math.max(
              e.__state.layout.width,
              c.__state.layout.width + c.style.marginLeft + c.style.marginRight
            );
          }
        }

        if (c.style.position === "relative") {
          childrenCount += 1;
        }

        c = c.next;
      }

      e.__state.layout.width +=
        e.style.paddingLeft +
        e.style.paddingRight +
        (e.style.flexDirection === "row"
          ? (childrenCount - 1) * e.style.rowGap
          : 0);
    }

    // Height is at least the sum of children with defined heights.
    if (e.style.height === undefined) {
      let childrenCount = 0;

      let c = e.firstChild;
      while (c) {
        if (c.__state.layout.height || typeof c.style.height === "number") {
          if (
            e.style.flexDirection === "column" &&
            c.style.position === "relative"
          ) {
            e.__state.layout.height +=
              c.__state.layout.height +
              c.style.marginTop +
              c.style.marginBottom;
          }

          if (
            e.style.flexDirection === "row" &&
            c.style.position === "relative"
          ) {
            e.__state.layout.height = Math.max(
              e.__state.layout.height,
              c.__state.layout.height + c.style.marginTop + c.style.marginBottom
            );
          }
        }

        if (c.style.position === "relative") {
          childrenCount += 1;
        }

        c = c.next;
      }

      e.__state.layout.height +=
        e.style.paddingTop +
        e.style.paddingBottom +
        (e.style.flexDirection === "column"
          ? (childrenCount - 1) * e.style.columnGap
          : 0);
    }
  }

  // Third tree pass: resolve flex.
  // Going top-down, level order.
  while (!thirdPass.isEmpty()) {
    const e = thirdPass.dequeueFront();
    invariant(e, "Empty queue.");
    const p = e.parent;

    let totalFlex = 0;
    let childrenCount = 0;

    // Undefined is ruled out by the previous pass.
    const parentWidth = p?.__state.layout.width ?? 0;
    const parentHeight = p?.__state.layout.height ?? 0;

    invariant(
      e.style.flex === undefined || e.style.flex >= 0,
      "Flex cannot be negative."
    );

    if (typeof e.style.width === "string") {
      e.__state.layout.width = toPercentage(e.style.width) * parentWidth;
    }

    if (typeof e.style.height === "string") {
      e.__state.layout.height = toPercentage(e.style.height) * parentHeight;
    }

    // Apply top, left, right, bottom properties.
    if (
      e.style.left !== undefined &&
      e.style.right !== undefined &&
      e.style.width === undefined
    ) {
      e.__state.layout.x = (p?.__state.layout.x ?? 0) + e.style.left;
      e.__state.layout.width = parentWidth - e.style.left - e.style.right;
    } else if (e.style.left !== undefined) {
      if (e.style.position === "absolute") {
        e.__state.layout.x = (p?.__state.layout.x ?? 0) + (e.style.left ?? 0);
      } else {
        e.__state.layout.x += e.style.left ?? 0;
      }
    } else if (e.style.right !== undefined) {
      e.__state.layout.x =
        e.style.position === "absolute"
          ? (p?.__state.layout.x ?? 0) +
            parentWidth -
            e.style.right -
            e.__state.layout.width
          : (p?.__state.layout.x ?? 0) - e.style.right;
    } else if (e.style.position === "absolute") {
      // If position is "absolute" but offsets are not specified, set
      // position to parent's top left corner.
      e.__state.layout.x = p?.__state.layout.x ?? 0;
    }
    if (
      e.style.top !== undefined &&
      e.style.bottom !== undefined &&
      e.style.height === undefined
    ) {
      e.__state.layout.y = (p?.__state.layout.y ?? 0) + e.style.top;
      e.__state.layout.height = parentHeight - e.style.top - e.style.bottom;
    } else if (e.style.top !== undefined) {
      if (e.style.position === "absolute") {
        e.__state.layout.y = (p?.__state.layout.y ?? 0) + e.style.top;
      } else {
        e.__state.layout.y += e.style.top;
      }
    } else if (e.style.bottom !== undefined) {
      e.__state.layout.y =
        e.style.position === "absolute"
          ? (p?.__state.layout.y ?? 0) +
            parentHeight -
            e.style.bottom -
            e.__state.layout.height
          : (p?.__state.layout.y ?? 0) - e.style.bottom;
    } else if (e.style.position === "absolute") {
      // If position is "absolute" but offsets are not specified, set
      // position to parent's top left corner.
      e.__state.layout.y = p?.__state.layout.y ?? 0;
    }

    // Apply align self.
    if (e.style.position !== "absolute" && p) {
      if (p?.style.flexDirection === "row") {
        if (e.style.alignSelf === "center") {
          e.__state.layout.y =
            e.__state.layout.y +
            p.__state.layout.height / 2 -
            e.__state.layout.height / 2;
        }

        if (e.style.alignSelf === "flex-end") {
          e.__state.layout.y =
            e.__state.layout.y +
            p.__state.layout.height -
            e.__state.layout.height -
            p.style.paddingBottom -
            p.style.paddingTop;
        }

        if (e.style.alignSelf === "stretch") {
          e.__state.layout.height =
            p.__state.layout.height -
            p.style.paddingBottom -
            p.style.paddingTop;
        }
      }

      if (p?.style.flexDirection === "column") {
        if (e.style.alignSelf === "center") {
          e.__state.layout.x =
            e.__state.layout.x +
            p.__state.layout.width / 2 -
            e.__state.layout.width / 2;
        }

        if (e.style.alignSelf === "flex-end") {
          e.__state.layout.x =
            e.__state.layout.x +
            p.__state.layout.width -
            e.__state.layout.width -
            p.style.paddingLeft -
            p.style.paddingRight;
        }

        if (e.style.alignSelf === "stretch") {
          e.__state.layout.width =
            p.__state.layout.width - p.style.paddingLeft - p.style.paddingRight;
        }
      }
    }

    // Set sizes for children that use percentages.
    let c = e.firstChild;
    while (c) {
      if (typeof c.style.width === "string") {
        c.__state.layout.width =
          toPercentage(c.style.width) * e.__state.layout.width;
      }
      if (typeof c.style.height === "string") {
        c.__state.layout.height =
          toPercentage(c.style.height) * e.__state.layout.height;
      }
      c = c.next;
    }

    // Take zIndex from parent if not set.
    e.style.zIndex = e.style.zIndex ?? p?.style.zIndex ?? 0;

    let availableWidth = e.__state.layout.width;
    let availableHeight = e.__state.layout.height;

    // Count children and total flex value.
    c = e.firstChild;
    while (c) {
      if (c.style.position === "relative") {
        childrenCount += 1;
      }

      // TODO: maybe flex can be reset to 0 instead of undefined and this can be checked somehow else?
      if (
        e.style.flexDirection === "row" &&
        c.style.flex === undefined &&
        c.style.position === "relative"
      ) {
        availableWidth -= c.__state.layout.width;
      }
      if (
        e.style.flexDirection === "column" &&
        c.style.flex === undefined &&
        c.style.position === "relative"
      ) {
        availableHeight -= c.__state.layout.height;
      }

      // Calculate how many rectangles will be splitting the available space.
      if (e.style.flexDirection === "row" && c.style.flex !== undefined) {
        totalFlex += c.style.flex;
      }
      if (e.style.flexDirection === "column" && c.style.flex !== undefined) {
        totalFlex += c.style.flex;
      }

      c = c.next;
    }

    availableWidth -=
      e.style.paddingLeft +
      e.style.paddingRight +
      (e.style.flexDirection === "row" &&
      e.style.justifyContent !== "space-between" &&
      e.style.justifyContent !== "space-around" &&
      e.style.justifyContent !== "space-evenly"
        ? (childrenCount - 1) * e.style.rowGap
        : 0);
    availableHeight -=
      e.style.paddingTop +
      e.style.paddingBottom +
      (e.style.flexDirection === "column" &&
      e.style.justifyContent !== "space-between" &&
      e.style.justifyContent !== "space-around" &&
      e.style.justifyContent !== "space-evenly"
        ? (childrenCount - 1) * e.style.columnGap
        : 0);

    // Apply sizes.
    c = e.firstChild;
    while (c) {
      if (e.style.flexDirection === "row") {
        if (
          c.style.flex !== undefined &&
          e.style.justifyContent !== "space-between" &&
          e.style.justifyContent !== "space-evenly" &&
          e.style.justifyContent !== "space-around"
        ) {
          c.__state.layout.width = (c.style.flex / totalFlex) * availableWidth;
        }
      }
      if (e.style.flexDirection === "column") {
        if (
          c.style.flex !== undefined &&
          e.style.justifyContent !== "space-between" &&
          e.style.justifyContent !== "space-evenly" &&
          e.style.justifyContent !== "space-around"
        ) {
          c.__state.layout.height =
            (c.style.flex / totalFlex) * availableHeight;
        }
      }

      c = c.next;
    }

    e.__state.layout.x += e.style.marginLeft;
    e.__state.layout.y += e.style.marginTop;

    // Determine positions.
    let x = e.__state.layout.x + e.style.paddingLeft;
    let y = e.__state.layout.y + e.style.paddingTop;

    // Apply justify content.
    if (e.style.flexDirection === "row") {
      if (e.style.justifyContent === "center") {
        x += availableWidth / 2;
      }

      if (e.style.justifyContent === "flex-end") {
        x += availableWidth;
      }
    }
    if (e.style.flexDirection === "column") {
      if (e.style.justifyContent === "center") {
        y += availableHeight / 2;
      }

      if (e.style.justifyContent === "flex-end") {
        y += availableHeight;
      }
    }

    // NOTE: order of applying justify content, this and align items is important.
    if (
      e.style.justifyContent === "space-between" ||
      e.style.justifyContent === "space-around" ||
      e.style.justifyContent === "space-evenly"
    ) {
      const count =
        childrenCount +
        (e.style.justifyContent === "space-between"
          ? -1
          : e.style.justifyContent === "space-evenly"
          ? 1
          : 0);

      const horizontalGap = availableWidth / count;
      const verticalGap = availableHeight / count;

      c = e.firstChild;
      while (c) {
        c.__state.layout.x =
          x +
          (e.style.justifyContent === "space-between"
            ? 0
            : e.style.justifyContent === "space-around"
            ? horizontalGap / 2
            : horizontalGap);
        c.__state.layout.y =
          y +
          (e.style.justifyContent === "space-between"
            ? 0
            : e.style.justifyContent === "space-around"
            ? verticalGap / 2
            : verticalGap);

        if (e.style.flexDirection === "row") {
          x += c.__state.layout.width + horizontalGap;
        }
        if (e.style.flexDirection === "column") {
          y += c.__state.layout.height + verticalGap;
        }

        c = c.next;
      }
    } else {
      c = e.firstChild;
      while (c) {
        if (c.style.position === "absolute" || c.style.display === "none") {
          c = c.next;
          continue;
        }

        if (e.style.flexDirection === "row") {
          c.__state.layout.x = x;
          x += c.__state.layout.width;
          x += e.style.rowGap;
        } else {
          c.__state.layout.x = x + c.__state.layout.x;
        }
        if (e.style.flexDirection === "column") {
          c.__state.layout.y = y;
          y += c.__state.layout.height;
          y += e.style.columnGap;
        } else {
          c.__state.layout.y = y + c.__state.layout.y;
        }

        c = c.next;
      }
    }

    // Apply align items.
    c = e.firstChild;
    while (c) {
      if (c.style.position === "absolute") {
        c = c.next;
        continue;
      }

      if (e.style.flexDirection === "row") {
        if (e.style.alignItems === "center") {
          c.__state.layout.y =
            e.__state.layout.y +
            e.__state.layout.height / 2 -
            c.__state.layout.height / 2;
        }

        if (e.style.alignItems === "flex-end") {
          c.__state.layout.y =
            e.__state.layout.y +
            e.__state.layout.height -
            c.__state.layout.height -
            e.style.paddingBottom;
        }

        if (e.style.alignItems === "stretch" && c.style.height === undefined) {
          c.__state.layout.height =
            e.__state.layout.height -
            e.style.paddingTop -
            e.style.paddingBottom;
        }
      }
      if (e.style.flexDirection === "column") {
        if (e.style.alignItems === "center") {
          c.__state.layout.x =
            e.__state.layout.x +
            e.__state.layout.width / 2 -
            c.__state.layout.width / 2;
        }

        if (e.style.alignItems === "flex-end") {
          c.__state.layout.x =
            e.__state.layout.x +
            e.__state.layout.width -
            c.__state.layout.width -
            e.style.paddingRight;
        }

        if (e.style.alignItems === "stretch" && c.style.width === undefined) {
          c.__state.layout.width =
            e.__state.layout.width - e.style.paddingLeft - e.style.paddingRight;
        }
      }

      c = c.next;
    }

    // Round to whole pixels.
    e.__state.layout.x = Math.round(e.__state.layout.x);
    e.__state.layout.y = Math.round(e.__state.layout.y);
    e.__state.layout.width = Math.round(e.__state.layout.width);
    e.__state.layout.height = Math.round(e.__state.layout.height);
  }
}

function toPercentage(value: string): number {
  if (!value.endsWith("%")) {
    throw new Error("Value must be a percentage.");
  }

  return Number(value.replace("%", "")) / 100;
}
