import { invariant } from "./invariant";
import { Vec4 } from "./math/Vec4";
import { Queue } from "./Queue";
import { Font } from "./fonts/Font";
import { parseColor } from "./parseColor";
import { IContext } from "./Context";
import { Vec2 } from "./math/Vec2";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      view: ViewAttributes;
      text: TextAttributes;
      shape: ShapeAttributes;
    }
  }
}

export type FlexDirection = "row" | "column";
export type JustifyContent =
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between";
export type AlignItems = "flex-start" | "center" | "flex-end" | "stretch";
export type AlignSelf = AlignItems;
export type Position = "absolute" | "relative";
export type Display = "flex" | "none";
export type Component = "view" | "text" | "shape";

/**
 *
 */
export type Style = Partial<{
  /**
   * If frame is positioned `absolute`, this property is used to define its
   * position relative to the parent frame.
   *
   * If frame is positioned `relative`, this property is an offset from the
   * calculated layout position (but it doesn't affect layout of siblings).
   */
  top: number;
  /**
   * If frame is positioned `absolute`, this property is used to define its
   * position relative to the parent frame.
   *
   * If frame is positioned `relative`, this property is an offset from the
   * calculated layout position (but it doesn't affect layout of siblings).
   */
  left: number;
  /**
   * If frame is positioned `absolute`, this property is used to define its
   * position relative to the parent frame.
   *
   * If frame is positioned `relative`, this property is an offset from the
   * calculated layout position (but it doesn't affect layout of siblings).
   */
  right: number;
  /**
   * If frame is positioned `absolute`, this property is used to define its
   * position relative to the parent frame.
   *
   * If frame is positioned `relative`, this property is an offset from the
   * calculated layout position (but it doesn't affect layout of siblings).
   */
  bottom: number;

  /**
   * Undefined means that frame should hug its content.
   *
   * String can only be a percentage value (e.g. `'50%'`).
   * It is defined relative to the parent frame.
   *
   * Numerical value is defined in pixels.
   */
  width: number | string | undefined;
  /**
   * Undefined means that frame should hug its content.
   *
   * String can only be a percentage value (e.g. `'50%'`).
   * It is defined relative to the parent frame.
   *
   * Percentage value does not take into account paddings or gaps.
   *
   * Numerical value is defined in pixels.
   */
  height: number | string | undefined;

  /**
   * Direction of children layout.
   */
  flexDirection: FlexDirection;

  /**
   * How children are aligned along the main axis.
   */
  justifyContent: JustifyContent;

  /**
   * How children are aligned along the cross axis.
   */
  alignItems: AlignItems;

  /**
   * Override parent's `alignItems` property for this child.
   */
  alignSelf: AlignSelf;

  /**
   * How space is distributed among children along the main axis.
   */
  flex: number;

  /**
   * Space between children along the main axis.
   */
  gap: number;

  /**
   * Space around children. More specific properties take precedence.
   */
  padding: number;

  /**
   * Takes precedence over `padding` property, less important than `paddingLeft` or `paddingRight`.
   */
  paddingHorizontal: number;

  /**
   * Takes precedence over `padding` property, less important than `paddingTop` or `paddingBottom`.
   */
  paddingVertical: number;

  /**
   * Takes precedence over `padding` and `paddingHorizontal` properties.
   */
  paddingLeft: number;
  /**
   * Takes precedence over `padding` and `paddingHorizontal` properties.
   */
  paddingRight: number;

  /**
   * Takes precedence over `padding` and `paddingVertical` properties.
   */
  paddingTop: number;
  /**
   *  Takes precedence over `padding` and `paddingVertical` properties.
   */
  paddingBottom: number;

  /**
   * Position `absolute` makes the frame skip taking part in the layout.
   */
  position: Position;

  /**
   * Z-index of the frame. Higher value means that the frame will be drawn on
   * top of values with lower z-index.
   *
   * Default value is 0.
   */
  zIndex: number;

  /**
   * RGBA color of the background.
   */
  backgroundColor: string;

  /**
   *
   */
  display: Display;
}>;

export type TextStyle = {
  fontFamily: Font;
  fontSize?: number;
  color?: string;
};

type ShapeAttributes = {
  points: [number, number][];
  color: string;
};

/**
 * Fixed frame is a frame with all layout properties calculated. Output of
 * `flush()`, used by `render()`.
 */
export type FixedFrame = {
  input:
    | Style
    | (Style &
        // Remove the optional properties and add them as required (plus change
        // color from string to Vec4).
        Omit<TextStyle, "fontSize"> & {
          text: string;
          fontSize: number;
        })
    | (Style & ShapeAttributes);
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  backgroundColor: Vec4;
};

/**
 * Default values for frame properties.
 * TODO: move it to the `flush()` method.
 */
const frameDefaults: Partial<Style> = {
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  position: "relative",
  gap: 0,
  padding: 0,
  display: "flex",
};

const fixedFrameDefaults = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  zIndex: 0,
  backgroundColor: new Vec4(0, 0, 0, 0),
};

const textStyleDefaults = {
  fontSize: 16,
  color: "#fff",
};

function resolvePadding(input: Style): Style {
  if (input.padding) {
    if (input.paddingBottom === undefined) {
      input.paddingBottom = input.padding;
    }

    if (input.paddingTop === undefined) {
      input.paddingTop = input.padding;
    }

    if (input.paddingLeft === undefined) {
      input.paddingLeft = input.padding;
    }

    if (input.paddingRight === undefined) {
      input.paddingRight = input.padding;
    }
  }

  if (input.paddingHorizontal) {
    if (input.paddingLeft === undefined) {
      input.paddingLeft = input.paddingHorizontal;
    }

    if (input.paddingRight === undefined) {
      input.paddingRight = input.paddingHorizontal;
    }
  }

  if (input.paddingVertical) {
    if (input.paddingTop === undefined) {
      input.paddingTop = input.paddingVertical;
    }

    if (input.paddingBottom === undefined) {
      input.paddingBottom = input.paddingVertical;
    }
  }

  if (input.paddingBottom === undefined) {
    input.paddingBottom = 0;
  }

  if (input.paddingLeft === undefined) {
    input.paddingLeft = 0;
  }

  if (input.paddingRight === undefined) {
    input.paddingRight = 0;
  }

  if (input.paddingTop === undefined) {
    input.paddingTop = 0;
  }

  return input;
}

/**
 * A tiny tree implementation which supports only adding children.
 */
export class TreeNode<T> {
  next: TreeNode<T> | null;
  prev: TreeNode<T> | null;
  firstChild: TreeNode<T> | null;
  parent: TreeNode<T> | null = null;

  constructor(public readonly value: T) {
    this.next = null;
    this.prev = null;
    this.firstChild = null;
  }

  addChild(node: TreeNode<T>): TreeNode<T> {
    node.parent = this;

    if (this.firstChild === null) {
      this.firstChild = node;
    } else {
      let last = this.firstChild;
      while (last.next !== null) {
        last = last.next;
      }
      node.prev = last;
      last.next = node;
    }

    return node;
  }
}

function toPercentage(value: string): number {
  invariant(value.endsWith("%"), "Value must be a percentage.");
  return Number(value.replace("%", "")) / 100;
}

type ViewAttributes = { style?: Style | Style[] };
type TextAttributes = { style?: TextStyle | TextStyle[] };

export function f(
  component: "view",
  attributes: ViewAttributes,
  ...children: TreeNode<FixedFrame>[]
): TreeNode<FixedFrame>;
export function f(
  component: "view",
  attributes: ViewAttributes,
  children: TreeNode<FixedFrame>[]
): TreeNode<FixedFrame>;
export function f(
  component: "text",
  attributes: TextAttributes,
  ...children: [string]
): TreeNode<FixedFrame>;
export function f(
  component: "shape",
  attributes: ShapeAttributes
): TreeNode<FixedFrame>;

/**
 *
 */
export function f(
  component: Component,
  attributes: ViewAttributes | TextAttributes | ShapeAttributes | null,
  ...children: TreeNode<FixedFrame>[] | [TreeNode<FixedFrame>[]] | string[]
): TreeNode<FixedFrame> {
  switch (component) {
    case "view": {
      if (
        attributes &&
        "style" in attributes &&
        attributes.style &&
        ("fontFamily" in attributes.style ||
          "fontSize" in attributes.style ||
          "color" in attributes.style)
      ) {
        throw new Error(
          "View does not accept text styles. Provide them directly to the <text> element."
        );
      }

      const flattenedStyle: Style = {};
      if (
        attributes === null ||
        !("style" in attributes) ||
        !attributes.style
      ) {
        // Do nothing.
      } else if (Array.isArray(attributes.style)) {
        for (const s of attributes.style) {
          Object.assign(flattenedStyle, s);
        }
      } else {
        Object.assign(flattenedStyle, attributes.style);
      }

      const backgroundColor = flattenedStyle.backgroundColor
        ? parseColor(flattenedStyle.backgroundColor)
        : fixedFrameDefaults.backgroundColor;

      const node = new TreeNode<FixedFrame>({
        input: { ...frameDefaults, ...resolvePadding(flattenedStyle) },
        ...fixedFrameDefaults,
        backgroundColor,
      });

      for (const child of children) {
        // First element can be an array of children.
        if (Array.isArray(child)) {
          for (const c of child) {
            node.addChild(c);
          }
        } else {
          invariant(typeof child !== "string", "Unreachable.");

          node.addChild(child);
        }
      }
      return node;
    }
    case "text": {
      const text = children[0] ?? "";
      if (typeof text !== "string") {
        console.log(attributes, children);
        throw new Error("Child must be a string.");
      }

      const style = {} as TextStyle;
      if (
        attributes === null ||
        !("style" in attributes) ||
        !attributes.style
      ) {
        // Do nothing.
      } else if (Array.isArray(attributes.style)) {
        for (const s of attributes.style) {
          Object.assign(style, s);
        }
      } else {
        Object.assign(style, attributes.style);
      }

      const font = style.fontFamily;
      invariant(font, "Font family must be specified.");

      const styleWithDefaults = {
        ...textStyleDefaults,
        ...style,
      };

      const layout = font.getTextLayout(text, styleWithDefaults.fontSize);

      const { width, height } = layout.boundingRectangle;

      const node = new TreeNode<FixedFrame>({
        input: {
          ...resolvePadding(frameDefaults),
          ...styleWithDefaults,
          color: styleWithDefaults.color,
          text,
          width,
          height,
        },
        ...fixedFrameDefaults,
        width,
        height,
      });
      return node;
    }
    case "shape": {
      if (
        attributes === null ||
        !("points" in attributes) ||
        !("color" in attributes)
      ) {
        throw new Error("Shape must have points and color.");
      }

      if ("style" in attributes) {
        throw new Error("Shape does not accept style.");
      }

      const { points, color } = attributes;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const [x, y] of points) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      const width = maxX - minX;
      const height = maxY - minY;

      return new TreeNode<FixedFrame>({
        input: { ...resolvePadding(frameDefaults), points },
        ...fixedFrameDefaults,
        width,
        height,
        backgroundColor: parseColor(color),
      });
    }
  }
}

/**
 * Here I am hijacking global `ę` value to make the element constructing
 * function globally visible without requiring user to import it (and then have
 * warnings about unused variable).
 */
declare global {
  function ę(...args: Parameters<typeof f>): ReturnType<typeof f>;
}

globalThis.ę = f;

/**
 * Layout is a tree of frames. Use it via JSX API (`<view>` etc.) or direct API
 * (`frame()` and `text()`).
 */
export class Layout {
  private root: TreeNode<FixedFrame> | null;
  private current: TreeNode<FixedFrame> | null;

  constructor(private context: IContext) {
    const node = new TreeNode<FixedFrame>({
      input: { ...resolvePadding(frameDefaults) },
      ...fixedFrameDefaults,
      width: context.getCanvas().clientWidth,
      height: context.getCanvas().clientHeight,
    });

    this.root = node;
    this.current = node;
  }

  /**
   * Adds a new frame to the layout. Any subsequent calls to `frame()` and
   * `text()` will add children to this frame. Call `end()` to return to the
   * parent frame.
   *
   * Alternative to JSX API.
   *
   * Usage:
   *
   * ```js
   * layout.frame(containerStyle);
   * layout.text("Hello", font, 12, "black");
   * layout.end();
   * ```
   */
  frame(frame: Style): void {
    const parent = this.current;
    invariant(parent !== null, "No parent frame.");

    const backgroundColor = frame.backgroundColor
      ? parseColor(frame.backgroundColor)
      : fixedFrameDefaults.backgroundColor;

    const node = new TreeNode({
      input: { ...frameDefaults, ...resolvePadding(frame) },
      ...fixedFrameDefaults,
      backgroundColor,
    });
    parent.addChild(node);

    this.current = node;
  }

  /**
   * Returns to the parent frame.
   */
  end(): void {
    invariant(this.current !== null, "No current frame.");
    this.current = this.current.parent;
  }

  /**
   * Adds a new text frame to the layout.
   *
   * Alternative to JSX API.
   */
  text(
    text: string,
    font: Font,
    fontSize: number,
    color: string,
    x?: number,
    y?: number
  ): void {
    const parent = this.current;
    invariant(parent !== null, "No parent frame.");

    const layout = font.getTextLayout(text, fontSize);

    const { width, height } = layout.boundingRectangle;

    const node = new TreeNode({
      input: {
        ...resolvePadding(frameDefaults),
        fontSize: fontSize,
        color,
        text,
        width,
        height,
      },
      ...fixedFrameDefaults,
      x: x ?? 0,
      y: y ?? 0,
      width,
      height,
    });

    parent.addChild(node);
  }

  /**
   * Usage:
   *
   * ```tsx
   * layout.add(
   *   <view style={container}>
   *     <text style={{ fontFamily: font, fontSize: 12, color: '#fff' }}>
   *      Hello
   *    </text>
   *  </view>
   * );
   * ```
   *
   * Alternative to using direct API:
   * ```
   * layout.frame(containerStyle);
   * layout.text("Hello", font, 12, "#fff");
   * layout.end();
   * ```
   */
  add(node: TreeNode<FixedFrame>): void {
    const parent = this.current;
    invariant(parent !== null, "No parent frame.");
    parent.addChild(node);
  }

  /**
   * Calculates layout tree by applying all sizing and direction properties.
   * Returns the root node of the tree. Pass it to `render()` method.
   */
  flush(): TreeNode<FixedFrame> {
    const quadQueue = new Queue<TreeNode<FixedFrame>>();
    const reverseQueue = new Queue<TreeNode<FixedFrame>>();
    const forwardQueue = new Queue<TreeNode<FixedFrame>>();

    invariant(this.root !== null, "No root frame.");

    // Traverse node tree in level order and generate the reverse queue.
    quadQueue.enqueue(this.root);
    while (!quadQueue.isEmpty()) {
      const element = quadQueue.dequeue();
      invariant(element !== null, "Empty queue.");

      let p = element.firstChild;
      while (p !== null) {
        quadQueue.enqueue(p);
        reverseQueue.enqueue(p);
        p = p.next;
      }
    }

    // Second tree pass: resolve HugContent.
    // Going bottom-up, level order.
    while (!reverseQueue.isEmpty()) {
      const element = reverseQueue.dequeueFront();
      invariant(element !== null, "Empty queue.");

      forwardQueue.enqueue(element);

      const { input } = element.value;
      invariant(input.paddingBottom !== undefined, "Padding is undefined.");
      invariant(input.paddingLeft !== undefined, "Padding is undefined.");
      invariant(input.paddingRight !== undefined, "Padding is undefined.");
      invariant(input.paddingTop !== undefined, "Padding is undefined.");
      invariant(input.gap !== undefined, "Gap is undefined.");

      if (typeof input.width === "number") {
        element.value.width = input.width;
      }

      if (typeof input.height === "number") {
        element.value.height = input.height;
      }

      if (input.width === undefined) {
        let childrenCount = 0;

        let p = element.firstChild;
        while (p) {
          if (p.value.width || typeof p.value.input.width === "number") {
            if (
              input.flexDirection === "row" &&
              p.value.input.position === "relative"
            ) {
              element.value.width += p.value.width;
            }

            if (
              input.flexDirection === "column" &&
              p.value.input.position === "relative"
            ) {
              element.value.width = Math.max(
                element.value.width,
                p.value.width
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

      if (input.height === undefined) {
        let childrenCount = 0;

        let p = element.firstChild;
        while (p) {
          if (p.value.height || typeof p.value.input.height === "number") {
            if (
              input.flexDirection === "column" &&
              p.value.input.position === "relative"
            ) {
              element.value.height += p.value.height;
            }

            if (
              input.flexDirection === "row" &&
              p.value.input.position === "relative"
            ) {
              element.value.height = Math.max(
                element.value.height,
                p.value.height
              );
            }
          }

          if (p.value.input.position === "relative") {
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
    while (!forwardQueue.isEmpty()) {
      const element = forwardQueue.dequeueFront();
      invariant(element !== null, "Empty queue.");

      let totalFlex = 0;
      let childrenCount = 0;

      // Undefined is ruled out by the previous pass.
      const parentWidth = element.parent?.value.width ?? 0;
      const parentHeight = element.parent?.value.height ?? 0;

      const { input } = element.value;

      if (typeof input.width === "string") {
        element.value.width = toPercentage(input.width) * parentWidth;
      }

      if (typeof input.height === "string") {
        element.value.height = toPercentage(input.height) * parentHeight;
      }

      let availableWidth = element.value.width;
      let availableHeight = element.value.height;

      // Apply `top`, `left`, `right`, `bottom` properties.
      {
        if (input.position === "absolute") {
          element.value.x = element.parent?.value.x ?? 0;
          element.value.y = element.parent?.value.y ?? 0;
        }

        if (input.top !== undefined) {
          element.value.y += input.top;
        }

        if (input.left !== undefined) {
          element.value.x += input.left;
        }

        if (input.right !== undefined) {
          if (input.position === "absolute") {
            element.value.x += parentWidth - input.right - element.value.width;
          } else {
            element.value.x -= input.right;
          }
        }

        if (input.bottom !== undefined) {
          if (input.position === "absolute") {
            element.value.y +=
              parentHeight - input.bottom - element.value.height;
          } else {
            element.value.y -= input.bottom;
          }
        }
      }

      invariant(input.gap !== undefined, "Gap is undefined.");
      invariant(
        input.flex ? input.flex >= 0 : true,
        "Flex cannot be negative."
      );
      invariant(input.paddingBottom !== undefined, "Padding is undefined.");
      invariant(input.paddingLeft !== undefined, "Padding is undefined.");
      invariant(input.paddingRight !== undefined, "Padding is undefined.");
      invariant(input.paddingTop !== undefined, "Padding is undefined.");

      // Apply align self.
      if (element.value.input.position !== "absolute" && element.parent) {
        if (element.parent.value.input.flexDirection === "row") {
          if (input.alignSelf === "center") {
            element.value.y =
              element.value.y +
              element.value.height / 2 -
              element.value.height / 2;
          }

          if (input.alignSelf === "flex-end") {
            element.value.y =
              element.value.y +
              element.parent.value.height -
              element.value.height;
          }

          if (input.alignSelf === "stretch") {
            element.value.height = element.parent.value.height;
          }
        }

        if (element.parent.value.input.flexDirection === "column") {
          if (input.alignSelf === "center") {
            element.value.x =
              element.value.x +
              element.value.width / 2 -
              element.value.width / 2;
          }

          if (input.alignSelf === "flex-end") {
            element.value.x =
              element.value.x +
              element.parent.value.width -
              element.value.width;
          }

          if (input.alignSelf === "stretch") {
            element.value.width = element.parent.value.width;
          }
        }
      }

      // Set sizes for children that use percentages.
      let p = element.firstChild;
      while (p) {
        if (typeof p.value.input.width === "string") {
          p.value.width =
            toPercentage(p.value.input.width) * element.value.width;
        }

        if (typeof p.value.input.height === "string") {
          p.value.height =
            toPercentage(p.value.input.height) * element.value.height;
        }

        p = p.next;
      }

      // Take zIndex from parent if not set.
      element.value.zIndex = input.zIndex ?? element.parent?.value.zIndex ?? 0;

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

        // Calculate how many quads will be splitting the available space.
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
        input.justifyContent !== "space-between"
          ? (childrenCount - 1) * input.gap
          : 0);

      availableHeight -=
        input.paddingTop +
        input.paddingBottom +
        (input.flexDirection === "column" &&
        input.justifyContent !== "space-between"
          ? (childrenCount - 1) * input.gap
          : 0);

      // Apply sizes.
      p = element.firstChild;
      while (p) {
        if (input.flexDirection === "row") {
          if (p.value.input.flex !== undefined) {
            p.value.width = (p.value.input.flex / totalFlex) * availableWidth;
          }
        }

        if (input.flexDirection === "column") {
          if (p.value.input.flex !== undefined) {
            p.value.height = (p.value.input.flex / totalFlex) * availableHeight;
          }
        }

        p = p.next;
      }

      invariant(input.paddingBottom !== undefined, "Padding is undefined.");
      invariant(input.paddingLeft !== undefined, "Padding is undefined.");
      invariant(input.paddingRight !== undefined, "Padding is undefined.");
      invariant(input.paddingTop !== undefined, "Padding is undefined.");

      // Determine positions.
      let x = element.value.x + input.paddingLeft;
      let y = element.value.y + input.paddingTop;

      // Apply justify content.
      {
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
      }

      // NOTE: order of applying justify content, this and align items is important.
      if (input.justifyContent === "space-between") {
        const horizontalGap = availableWidth / (childrenCount - 1);
        const verticalGap = availableHeight / (childrenCount - 1);

        if (input.backgroundColor === "rgba(50, 100, 200, 0.3)") {
          console.log({
            availableHeight,
            availableWidth,
            horizontalGap,
            verticalGap,
          });
        }

        p = element.firstChild;
        while (p) {
          p.value.x = x;
          p.value.y = y;

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
      {
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
      }

      // Hide parts of frames that overflow parent. Similarly, fix UV
      // coordinates for text.
      // TODO: implement this.
    }

    return this.root as TreeNode<FixedFrame>;
  }

  /**
   * Render the tree to the context. Most of the time it means that this step is
   * what takes UI to appear on the screen.
   */
  render(): void {
    const tree = this.flush();
    const list: FixedFrame[] = [];

    const queue = new Queue<TreeNode<FixedFrame>>();
    queue.enqueue(tree);
    while (!queue.isEmpty()) {
      const node = queue.dequeue();
      invariant(node, "Node should not be null.");
      let p = node.firstChild;

      while (p) {
        if (
          p.value.width < 0.01 ||
          p.value.height < 0.01 ||
          p.value.input.display === "none"
        ) {
          p = p.next;
          continue;
        }

        queue.enqueue(p);
        list.push(p.value);

        p = p.next;
      }
    }

    list.sort((a, b) => a.zIndex - b.zIndex);

    for (const frame of list) {
      if ("text" in frame.input) {
        this.context.text(
          frame.input.text,
          frame.x,
          frame.y,
          frame.input.fontSize,
          frame.input.color ?? "rgba(0, 0, 0, 0)"
        );
      } else if ("points" in frame.input) {
        this.context.polygon(
          frame.input.points.map(
            ([x, y]) => new Vec2(x + frame.x, y + frame.y)
          ),
          frame.backgroundColor
        );
      } else {
        this.context.rectangle(
          new Vec2(frame.x, frame.y),
          new Vec2(frame.width, frame.height),
          frame.backgroundColor
        );
      }
    }
  }
}
