import { Queue } from "./utils/Queue";
import { Tree } from "./utils/Tree";
import { fixedRectangleDefaults, rectangleStylesDefaults } from "./styling";
import { shapeText } from "./font/shapeText";
import { Vec2 } from "./math/Vec2";
import type { FixedRectangle, ResolvedInput } from "./ui/types";
import type { Lookups } from "./font/types";

/**
 * @param tree tree of rectangles to layout.
 * @param fontLookups used for calculating text sizes.
 */
export function layout(
  tree: Tree<FixedRectangle>,
  fontLookups: Lookups,
  rootSize: Vec2
): void {
  const firstPass = new Queue<Tree<FixedRectangle>>();
  const secondPass = new Queue<Tree<FixedRectangle>>();
  const thirdPass = new Queue<Tree<FixedRectangle>>();

  const root = new Tree<FixedRectangle>({
    input: {},
    ...fixedRectangleDefaults,
    height: rootSize.y,
    styles: rectangleStylesDefaults,
    width: rootSize.x,
  });

  root.add(tree);

  // Traverse tree in level order and generate the reverse queue.
  firstPass.enqueue(root);
  while (!firstPass.isEmpty()) {
    const element = firstPass.dequeue();
    if (element === null) {
      throw new Error("Empty queue.");
    }

    let p = element.firstChild;
    while (p !== null) {
      firstPass.enqueue(p);
      secondPass.enqueue(p);
      p = p.next;
    }

    const input = element.value.input as ResolvedInput;
    const parent = element.parent;

    element.value =
      "text" in element.value
        ? ({
            ...element.value,
            height: 0,
            width: 0,
            x: 0,
            y: 0,
            zIndex: 0,
          } as FixedRectangle)
        : {
            ...element.value,
            height: 0,
            width: 0,
            x: 0,
            y: 0,
            zIndex: 0,
          };

    // If element has defined width or height, set it.
    if (typeof input.width === "number") {
      element.value.width = input.width;
    }
    if (typeof input.height === "number") {
      element.value.height = input.height;
    }

    // Undefined is ruled out by the previous pass.
    const parentWidth = parent?.value.width ?? 0;
    const parentHeight = parent?.value.height ?? 0;

    if (typeof input.width === "string") {
      element.value.width = toPercentage(input.width) * parentWidth;
    }

    if (typeof input.height === "string") {
      element.value.height = toPercentage(input.height) * parentHeight;
    }

    // Ideally text shaping should be done outside of the layout function.
    // Unfortunately this makes things so much easier since the height
    // calculated here will be used for further calcualations of other elements
    // so it's not obvious whether this could be done before or after layout.
    if ("text" in element.value) {
      if (parent?.value.width !== undefined) {
        const maxWidth =
          parent.value.width -
          (parent.value.input.paddingLeft ?? 0) -
          (parent.value.input.paddingRight ?? 0);
        element.value.textStyle.maxWidth = maxWidth;

        const shape = shapeText({
          fontName: element.value.textStyle.fontName,
          fontSize: element.value.textStyle.fontSize,
          lineHeight: element.value.textStyle.lineHeight,
          lookups: fontLookups,
          maxWidth: maxWidth,
          text: element.value.text,
        });

        element.value.height = shape.boundingRectangle.height;
      }
    }
  }

  // Second tree pass: resolve wrapping children.
  // Going bottom-up, level order.
  while (!secondPass.isEmpty()) {
    const element = secondPass.dequeueFront();
    if (element === null) {
      throw new Error("Empty queue.");
    }
    thirdPass.enqueue(element);
    const input = element.value.input as ResolvedInput;

    // Width is at least the sum of children with defined widths.
    if (input.width === undefined) {
      let childrenCount = 0;

      let p = element.firstChild;
      while (p) {
        const childInput = p.value.input as ResolvedInput;
        if (p.value.width || typeof childInput.width === "number") {
          if (
            input.flexDirection === "row" &&
            childInput.position === "relative"
          ) {
            element.value.width +=
              p.value.width + childInput.marginLeft + childInput.marginRight;
          }

          if (
            input.flexDirection === "column" &&
            childInput.position === "relative"
          ) {
            element.value.width = Math.max(
              element.value.width,
              p.value.width + childInput.marginLeft + childInput.marginRight
            );
          }
        }

        if (p.value.input.position === "relative") {
          childrenCount += 1;
        }

        p = p.next;
      }

      element.value.width +=
        input.paddingLeft +
        input.paddingRight +
        (input.flexDirection === "row" ? (childrenCount - 1) * input.gap : 0);
    }

    // Height is at least the sum of children with defined heights.
    if (input.height === undefined) {
      let childrenCount = 0;

      let p = element.firstChild;
      while (p) {
        const childInput = p.value.input as ResolvedInput;

        if (p.value.height || typeof childInput.height === "number") {
          if (
            input.flexDirection === "column" &&
            p.value.input.position === "relative"
          ) {
            element.value.height +=
              p.value.height + childInput.marginTop + childInput.marginBottom;
          }

          if (
            input.flexDirection === "row" &&
            p.value.input.position === "relative"
          ) {
            element.value.height = Math.max(
              element.value.height,
              p.value.height + childInput.marginTop + childInput.marginBottom
            );
          }
        }

        if (childInput.position === "relative") {
          childrenCount += 1;
        }

        p = p.next;
      }

      element.value.height +=
        input.paddingTop +
        input.paddingBottom +
        (input.flexDirection === "column"
          ? (childrenCount - 1) * input.gap
          : 0);
    }
  }

  // Third tree pass: resolve flex.
  // Going top-down, level order.
  while (!thirdPass.isEmpty()) {
    const element = thirdPass.dequeueFront();
    if (element === null) {
      throw new Error("Empty queue.");
    }
    const parent = element.parent;

    let totalFlex = 0;
    let childrenCount = 0;

    // Undefined is ruled out by the previous pass.
    const parentWidth = parent?.value.width ?? 0;
    const parentHeight = parent?.value.height ?? 0;

    const input = element.value.input as ResolvedInput;
    const parentInput = parent?.value.input as ResolvedInput;

    if (input?.flex < 0) {
      throw new Error("Flex cannot be negative.");
    }

    if (typeof input.width === "string") {
      element.value.width = toPercentage(input.width) * parentWidth;
    }

    if (typeof input.height === "string") {
      element.value.height = toPercentage(input.height) * parentHeight;
    }

    // Apply top, left, right, bottom properties.

    if (
      input.left !== undefined &&
      input.right !== undefined &&
      input.width === undefined
    ) {
      element.value.x = (parent?.value.x ?? 0) + input.left;
      element.value.width = parentWidth - input.left - input.right;
    } else if (input.left !== undefined) {
      if (input.position === "absolute") {
        element.value.x = (parent?.value.x ?? 0) + input.left;
      } else {
        element.value.x += input.left;
      }
    } else if (input.right !== undefined) {
      element.value.x =
        input.position === "absolute"
          ? (parent?.value.x ?? 0) +
            parentWidth -
            input.right -
            element.value.width
          : (parent?.value.x ?? 0) - input.right;
    } else if (input.position === "absolute") {
      // If position is "absolute" but offsets are not specified, set
      // position to parent's top left corner.
      element.value.x = parent?.value.x ?? 0;
    }
    if (
      input.top !== undefined &&
      input.bottom !== undefined &&
      input.height === undefined
    ) {
      element.value.y = (parent?.value.y ?? 0) + input.top;
      element.value.height = parentHeight - input.top - input.bottom;
    } else if (input.top !== undefined) {
      if (input.position === "absolute") {
        element.value.y = (parent?.value.y ?? 0) + input.top;
      } else {
        element.value.y += input.top;
      }
    } else if (input.bottom !== undefined) {
      element.value.y =
        input.position === "absolute"
          ? (parent?.value.y ?? 0) +
            parentHeight -
            input.bottom -
            element.value.height
          : (parent?.value.y ?? 0) - input.bottom;
    } else if (input.position === "absolute") {
      // If position is "absolute" but offsets are not specified, set
      // position to parent's top left corner.
      element.value.y = parent?.value.y ?? 0;
    }

    // Apply align self.
    if (element.value.input.position !== "absolute" && parent) {
      if (parentInput.flexDirection === "row") {
        if (input.alignSelf === "center") {
          element.value.y =
            element.value.y +
            parent.value.height / 2 -
            element.value.height / 2;
        }

        if (input.alignSelf === "flex-end") {
          element.value.y =
            element.value.y +
            parent.value.height -
            element.value.height -
            parentInput.paddingBottom -
            parentInput.paddingTop;
        }

        if (input.alignSelf === "stretch") {
          element.value.height =
            parent.value.height -
            parentInput.paddingBottom -
            parentInput.paddingTop;
        }
      }

      if (parentInput.flexDirection === "column") {
        if (input.alignSelf === "center") {
          element.value.x =
            element.value.x + parent.value.width / 2 - element.value.width / 2;
        }

        if (input.alignSelf === "flex-end") {
          element.value.x =
            element.value.x +
            parent.value.width -
            element.value.width -
            parentInput.paddingLeft -
            parentInput.paddingRight;
        }

        if (input.alignSelf === "stretch") {
          element.value.width =
            parent.value.width -
            parentInput.paddingLeft -
            parentInput.paddingRight;
        }
      }
    }

    // Set sizes for children that use percentages.
    let p = element.firstChild;
    while (p) {
      if (typeof p.value.input.width === "string") {
        p.value.width = toPercentage(p.value.input.width) * element.value.width;
      }
      if (typeof p.value.input.height === "string") {
        p.value.height =
          toPercentage(p.value.input.height) * element.value.height;
      }
      p = p.next;
    }

    // Take zIndex from parent if not set.
    element.value.zIndex = input.zIndex ?? parent?.value.zIndex ?? 0;

    let availableWidth = element.value.width;
    let availableHeight = element.value.height;

    // Count children and total flex value.
    p = element.firstChild;
    while (p) {
      if (p.value.input.position === "relative") {
        childrenCount += 1;
      }

      if (
        input.flexDirection === "row" &&
        p.value.input.flex === undefined &&
        p.value.input.position === "relative"
      ) {
        availableWidth -= p.value.width;
      }
      if (
        input.flexDirection === "column" &&
        p.value.input.flex === undefined &&
        p.value.input.position === "relative"
      ) {
        availableHeight -= p.value.height;
      }

      // Calculate how many rectangles will be splitting the available space.
      if (input.flexDirection === "row" && p.value.input.flex !== undefined) {
        totalFlex += p.value.input.flex;
      }
      if (
        input.flexDirection === "column" &&
        p.value.input.flex !== undefined
      ) {
        totalFlex += p.value.input.flex;
      }

      p = p.next;
    }

    availableWidth -=
      input.paddingLeft +
      input.paddingRight +
      (input.flexDirection === "row" &&
      input.justifyContent !== "space-between" &&
      input.justifyContent !== "space-around" &&
      input.justifyContent !== "space-evenly"
        ? (childrenCount - 1) * input.gap
        : 0);
    availableHeight -=
      input.paddingTop +
      input.paddingBottom +
      (input.flexDirection === "column" &&
      input.justifyContent !== "space-between" &&
      input.justifyContent !== "space-around" &&
      input.justifyContent !== "space-evenly"
        ? (childrenCount - 1) * input.gap
        : 0);

    // Apply sizes.
    p = element.firstChild;
    while (p) {
      if (input.flexDirection === "row") {
        if (
          p.value.input.flex !== undefined &&
          input.justifyContent !== "space-between" &&
          input.justifyContent !== "space-evenly" &&
          input.justifyContent !== "space-around"
        ) {
          p.value.width = (p.value.input.flex / totalFlex) * availableWidth;
        }
      }
      if (input.flexDirection === "column") {
        if (
          p.value.input.flex !== undefined &&
          input.justifyContent !== "space-between" &&
          input.justifyContent !== "space-evenly" &&
          input.justifyContent !== "space-around"
        ) {
          p.value.height = (p.value.input.flex / totalFlex) * availableHeight;
        }
      }

      p = p.next;
    }

    element.value.x += input.marginLeft;
    element.value.y += input.marginTop;

    // Determine positions.
    let x = element.value.x + input.paddingLeft;
    let y = element.value.y + input.paddingTop;

    // Apply justify content.
    if (input.flexDirection === "row") {
      if (input.justifyContent === "center") {
        x += availableWidth / 2;
      }

      if (input.justifyContent === "flex-end") {
        x += availableWidth;
      }
    }
    if (input.flexDirection === "column") {
      if (input.justifyContent === "center") {
        y += availableHeight / 2;
      }

      if (input.justifyContent === "flex-end") {
        y += availableHeight;
      }
    }

    // NOTE: order of applying justify content, this and align items is important.
    if (
      input.justifyContent === "space-between" ||
      input.justifyContent === "space-around" ||
      input.justifyContent === "space-evenly"
    ) {
      const count =
        childrenCount +
        (input.justifyContent === "space-between"
          ? -1
          : input.justifyContent === "space-evenly"
          ? 1
          : 0);

      const horizontalGap = availableWidth / count;
      const verticalGap = availableHeight / count;

      p = element.firstChild;
      while (p) {
        p.value.x =
          x +
          (input.justifyContent === "space-between"
            ? 0
            : input.justifyContent === "space-around"
            ? horizontalGap / 2
            : horizontalGap);
        p.value.y =
          y +
          (input.justifyContent === "space-between"
            ? 0
            : input.justifyContent === "space-around"
            ? verticalGap / 2
            : verticalGap);

        if (input.flexDirection === "row") {
          x += p.value.width + horizontalGap;
        }
        if (input.flexDirection === "column") {
          y += p.value.height + verticalGap;
        }

        p = p.next;
      }
    } else {
      p = element.firstChild;
      while (p) {
        if (
          p.value.input.position === "absolute" ||
          p.value.input.display === "none"
        ) {
          p = p.next;
          continue;
        }

        if (input.flexDirection === "row") {
          p.value.x = x;
          x += p.value.width;
          x += input.gap;
        } else {
          p.value.x = x + p.value.x;
        }
        if (input.flexDirection === "column") {
          p.value.y = y;
          y += p.value.height;
          y += input.gap;
        } else {
          p.value.y = y + p.value.y;
        }

        p = p.next;
      }
    }

    // Apply align items.
    p = element.firstChild;
    while (p) {
      if (p.value.input.position === "absolute") {
        p = p.next;
        continue;
      }

      if (input.flexDirection === "row") {
        if (input.alignItems === "center") {
          p.value.y =
            element.value.y + element.value.height / 2 - p.value.height / 2;
        }

        if (input.alignItems === "flex-end") {
          p.value.y =
            element.value.y +
            element.value.height -
            p.value.height -
            input.paddingBottom;
        }

        if (
          input.alignItems === "stretch" &&
          p.value.input.height === undefined
        ) {
          p.value.height =
            element.value.height - input.paddingTop - input.paddingBottom;
        }
      }
      if (input.flexDirection === "column") {
        if (input.alignItems === "center") {
          p.value.x =
            element.value.x + element.value.width / 2 - p.value.width / 2;
        }

        if (input.alignItems === "flex-end") {
          p.value.x =
            element.value.x +
            element.value.width -
            p.value.width -
            input.paddingRight;
        }

        if (
          input.alignItems === "stretch" &&
          p.value.input.width === undefined
        ) {
          p.value.width =
            element.value.width - input.paddingLeft - input.paddingRight;
        }
      }

      p = p.next;
    }

    // Round to whole pixels.
    element.value.x = Math.round(element.value.x);
    element.value.y = Math.round(element.value.y);
    element.value.width = Math.round(element.value.width);
    element.value.height = Math.round(element.value.height);
  }
}

function toPercentage(value: string): number {
  if (!value.endsWith("%")) {
    throw new Error("Value must be a percentage.");
  }

  return Number(value.replace("%", "")) / 100;
}
