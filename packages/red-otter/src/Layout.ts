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

/**
 * Available components.
 */
export type Component = "view" | "text" | "shape";

/**
 *
 */
export type Style = {
  /**
   * Undefined means that view should hug its content.
   *
   * String can only be a percentage value (e.g. `'50%'`).
   * It is defined relative to the parent view.
   *
   * Numerical value is defined in pixels.
   */
  width?: number | string | undefined;
  /**
   * Undefined means that view should hug its content.
   *
   * String can only be a percentage value (e.g. `'50%'`).
   * It is defined relative to the parent view.
   *
   * Percentage value does not take into account paddings or gaps.
   *
   * Numerical value is defined in pixels.
   */
  height?: number | string | undefined;

  /**
   * Direction of children layout.
   */
  flexDirection?: "row" | "column";

  /**
   * How children are aligned along the main axis.
   */
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";

  /**
   * How children are aligned along the cross axis.
   */
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";

  /**
   * Override parent's `alignItems` property for this child.
   */
  alignSelf?: "flex-start" | "center" | "flex-end" | "stretch";

  /**
   * How space is distributed among children along the main axis.
   */
  flex?: number;

  /**
   * Position `absolute` makes the view skip taking part in the layout.
   */
  position?: "absolute" | "relative";

  /**
   * Space between children along the main axis.
   */
  gap?: number;

  /**
   * Z-index of the view. Higher value means that the view will be drawn on
   * top of values with lower z-index.
   *
   * Default value is 0.
   */
  zIndex?: number;

  /**
   * Supported formats: `#f00`, `#ff0000`, `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`, `hsl(60, 100%, 50%)`, `hsl(60 100% 50%)`, `hsla(30, 60%, 90%, 0.8)`, `hsla(30 60% 90% 0.8)`, `hsla(30 60% 90% / 0.8)`.
   */
  backgroundColor?: string;

  /**
   * Whether the view should be visible or not.
   */
  display?: "flex" | "none";

  /**
   * If view is positioned `absolute`, this property is used to define its
   * position relative to the parent view.
   *
   * If view is positioned `relative`, this property is an offset from the
   * calculated layout position (but it doesn't affect layout of siblings).
   */
  top?: number;
  /**
   * See: `top` property.
   */
  left?: number;
  /**
   * See: `top` property.
   */
  right?: number;
  /**
   * See: `top` property.
   */
  bottom?: number;

  /**
   * Space around children. More specific properties override it.
   */
  padding?: number;

  /**
   * Overrides `padding` property but is less important than `paddingLeft` or `paddingRight`.
   */
  paddingHorizontal?: number;

  /**
   * Overrides `padding` property, less important than `paddingTop` or `paddingBottom`.
   */
  paddingVertical?: number;

  /**
   * Overrides `margin` and `marginHorizontal` properties.
   */
  paddingLeft?: number;
  /**
   * Overrides `margin` and `marginHorizontal` properties.
   */
  paddingRight?: number;

  /**
   * Overrides `margin` and `marginVertical` properties.
   */
  paddingTop?: number;
  /**
   *  Overrides `margin` and `marginVertical` properties.
   */
  paddingBottom?: number;

  /**
   * Space around children. More specific properties take precedence.
   */
  margin?: number;

  /**
   * Overrides `margin` property, less important than `marginLeft` or `marginRight`.
   */
  marginHorizontal?: number;

  /**
   * Overrides `margin` property, less important than `marginTop` or `marginBottom`.
   */
  marginVertical?: number;

  /**
   * Overrides `margin` and `marginHorizontal` properties.
   */
  marginLeft?: number;
  /**
   * Overrides `margin` and `marginHorizontal` properties.
   */
  marginRight?: number;

  /**
   * Overrides `margin` and `marginVertical` properties.
   */
  marginTop?: number;
  /**
   *  Overrides `margin` and `marginVertical` properties.
   */
  marginBottom?: number;
};

export type TextStyle = {
  fontFamily: Font;
  fontSize?: number;
  color?: string;
};

type ShapeAttributes =
  | {
      points: [number, number][];
      color: string;
      type: "polygon";
    }
  | {
      points: [number, number][];
      color: string;
      thickness: number;
      type: "line";
    };

/**
 * Fixed view is a view with all layout properties calculated. Output of
 * `flush()`, used by `render()`.
 */
export type FixedView = {
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
 * Default values for view properties.
 * TODO: move it to the `flush()` method.
 */
const viewDefaults: Partial<Style> = {
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  position: "relative",
  gap: 0,
  padding: 0,
  display: "flex",
};

const fixedViewDefaults = {
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

function resolvePaddingAndMargin(input: Style): Style {
  input.paddingTop =
    input.paddingTop ?? input.paddingVertical ?? input.padding ?? 0;
  input.paddingBottom =
    input.paddingBottom ?? input.paddingVertical ?? input.padding ?? 0;
  input.paddingLeft =
    input.paddingLeft ?? input.paddingHorizontal ?? input.padding ?? 0;
  input.paddingRight =
    input.paddingRight ?? input.paddingHorizontal ?? input.padding ?? 0;

  input.marginTop =
    input.marginTop ?? input.marginVertical ?? input.margin ?? 0;
  input.marginBottom =
    input.marginBottom ?? input.marginVertical ?? input.margin ?? 0;
  input.marginLeft =
    input.marginLeft ?? input.marginHorizontal ?? input.margin ?? 0;
  input.marginRight =
    input.marginRight ?? input.marginHorizontal ?? input.margin ?? 0;

  return input;
}

/**
 * A tiny tree implementation which supports only adding children.
 */
class TreeNode<T> {
  next: TreeNode<T> | null;
  prev: TreeNode<T> | null;
  firstChild: TreeNode<T> | null;
  lastChild: TreeNode<T> | null;
  parent: TreeNode<T> | null = null;

  constructor(public readonly value: T) {
    this.next = null;
    this.prev = null;
    this.firstChild = null;
    this.lastChild = null;
  }

  addChild(node: TreeNode<T>): TreeNode<T> {
    node.parent = this;

    if (this.firstChild === null) {
      this.firstChild = node;
      this.lastChild = node;
    } else {
      invariant(this.lastChild !== null, "Last child must be set.");
      node.prev = this.lastChild;
      this.lastChild.next = node;
      this.lastChild = node;
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

export function addView(
  component: "view",
  attributes: ViewAttributes,
  ...children: TreeNode<FixedView>[]
): TreeNode<FixedView>;
export function addView(
  component: "view",
  attributes: ViewAttributes,
  children: TreeNode<FixedView>[]
): TreeNode<FixedView>;
export function addView(
  component: "text",
  attributes: TextAttributes,
  ...children: [string]
): TreeNode<FixedView>;
export function addView(
  component: "shape",
  attributes: ShapeAttributes
): TreeNode<FixedView>;

/**
 *
 */
export function addView(
  component: Component,
  attributes: ViewAttributes | TextAttributes | ShapeAttributes | null,
  ...children: TreeNode<FixedView>[] | [TreeNode<FixedView>[]] | string[]
): TreeNode<FixedView> {
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
        : fixedViewDefaults.backgroundColor;

      const node = new TreeNode<FixedView>({
        input: { ...viewDefaults, ...resolvePaddingAndMargin(flattenedStyle) },
        ...fixedViewDefaults,
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

      const node = new TreeNode<FixedView>({
        input: {
          ...resolvePaddingAndMargin(viewDefaults),
          ...styleWithDefaults,
          color: styleWithDefaults.color,
          text,
          width,
          height,
        },
        ...fixedViewDefaults,
        width,
        height,
      });
      return node;
    }
    case "shape": {
      if (
        attributes === null ||
        !("type" in attributes) ||
        !("points" in attributes) ||
        !("color" in attributes)
      ) {
        throw new Error("Shape must have type, points and color.");
      }

      if (attributes.type === "polygon" && "thickness" in attributes) {
        throw new Error("Polygon does not accept thickness.");
      }

      if ("style" in attributes) {
        throw new Error("Shape does not accept style.");
      }

      const { points, color, type } = attributes;
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

      return new TreeNode<FixedView>({
        input: {
          ...resolvePaddingAndMargin(viewDefaults),
          points,
          type,
          thickness:
            "thickness" in attributes ? attributes.thickness : undefined,
        },
        ...fixedViewDefaults,
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
  function ę(...args: Parameters<typeof addView>): ReturnType<typeof addView>;
}

globalThis.ę = addView;

/**
 * Layout is a tree of views. Use it via JSX API (`<view>` etc.) or direct API
 * (`view()` and `text()`).
 */
export class Layout {
  private root: TreeNode<FixedView> | null;
  private current: TreeNode<FixedView> | null;

  /**
   * Takes a context instance which is used to retrieve HTML canvas size.
   */
  constructor(private context: IContext) {
    const node = new TreeNode<FixedView>({
      input: { ...resolvePaddingAndMargin(viewDefaults) },
      ...fixedViewDefaults,
      width: context.getCanvas().clientWidth,
      height: context.getCanvas().clientHeight,
    });

    this.root = node;
    this.current = node;
  }

  /**
   * Adds a new view to the layout. Any subsequent calls to `view()` and
   * `text()` will add children to this view. Call `end()` to return to the
   * parent view.
   *
   * Alternative to JSX API.
   *
   * Usage:
   *
   * ```js
   * layout.view(containerStyle);
   * layout.text("Hello", font, 12, "#000", 10, 10);
   * layout.end();
   * ```
   */
  view(style: Style): void {
    const parent = this.current;
    invariant(parent !== null, "No parent view.");

    const backgroundColor = style.backgroundColor
      ? parseColor(style.backgroundColor)
      : fixedViewDefaults.backgroundColor;

    const node = new TreeNode({
      input: { ...viewDefaults, ...resolvePaddingAndMargin(style) },
      ...fixedViewDefaults,
      backgroundColor,
    });
    parent.addChild(node);

    this.current = node;
  }

  /**
   * Makes the parent view the current view, so that subsequent calls to
   * `view()` and `text()` will add children to the parent view instead.
   */
  end(): void {
    invariant(this.current !== null, "No current view.");
    this.current = this.current.parent;
  }

  /**
   * Adds a new text view to the layout.
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
    invariant(parent !== null, "No parent view.");

    const layout = font.getTextLayout(text, fontSize);

    const { width, height } = layout.boundingRectangle;

    const node = new TreeNode({
      input: {
        ...resolvePaddingAndMargin(viewDefaults),
        fontSize: fontSize,
        color,
        text,
        width,
        height,
      },
      ...fixedViewDefaults,
      x: x ?? 0,
      y: y ?? 0,
      width,
      height,
    });

    parent.addChild(node);
  }

  /**
   * Add a subtree to the layout. Can be used interchangeably with direct API
   * (`view()` and `text()`) if needed.
   *
   * Can be also called multiple times
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
   */
  add(node: TreeNode<FixedView>): void {
    const parent = this.current;
    invariant(parent !== null, "No parent view.");
    parent.addChild(node);
  }

  /**
   * Calculates layout tree by applying all sizing and direction properties.
   * Returns the root node of the tree. Pass it to `render()` method.
   */
  flush(): TreeNode<FixedView> {
    const quadQueue = new Queue<TreeNode<FixedView>>();
    const reverseQueue = new Queue<TreeNode<FixedView>>();
    const forwardQueue = new Queue<TreeNode<FixedView>>();

    invariant(this.root !== null, "No root view.");

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

      // TODO: adjust typing so at this point we know those are defined.
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
          invariant(
            p.value.input.marginBottom !== undefined,
            "Margin is undefined."
          );
          invariant(
            p.value.input.marginLeft !== undefined,
            "Margin is undefined."
          );
          invariant(
            p.value.input.marginRight !== undefined,
            "Margin is undefined."
          );
          invariant(
            p.value.input.marginTop !== undefined,
            "Margin is undefined."
          );

          if (p.value.width || typeof p.value.input.width === "number") {
            if (
              input.flexDirection === "row" &&
              p.value.input.position === "relative"
            ) {
              element.value.width +=
                p.value.width +
                p.value.input.marginLeft +
                p.value.input.marginRight;
            }

            if (
              input.flexDirection === "column" &&
              p.value.input.position === "relative"
            ) {
              // TODO: margin?
              element.value.width = Math.max(
                element.value.width,
                p.value.width +
                  p.value.input.marginLeft +
                  p.value.input.marginRight
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
          invariant(
            p.value.input.marginBottom !== undefined,
            "Margin is undefined."
          );
          invariant(
            p.value.input.marginLeft !== undefined,
            "Margin is undefined."
          );
          invariant(
            p.value.input.marginRight !== undefined,
            "Margin is undefined."
          );
          invariant(
            p.value.input.marginTop !== undefined,
            "Margin is undefined."
          );

          if (p.value.height || typeof p.value.input.height === "number") {
            if (
              input.flexDirection === "column" &&
              p.value.input.position === "relative"
            ) {
              element.value.height +=
                p.value.height +
                p.value.input.marginTop +
                p.value.input.marginBottom;
            }

            if (
              input.flexDirection === "row" &&
              p.value.input.position === "relative"
            ) {
              // TODO: margin?
              element.value.height = Math.max(
                element.value.height,
                p.value.height +
                  p.value.input.marginTop +
                  p.value.input.marginBottom
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

      // Apply `top`, `left`, `right`, `bottom` properties.
      {
        if (
          input.left !== undefined &&
          input.right !== undefined &&
          input.width === undefined
        ) {
          element.value.x = (element.parent?.value.x ?? 0) + input.left;
          element.value.width = parentWidth - input.left - input.right;
        } else if (input.left !== undefined) {
          if (input.position === "absolute") {
            element.value.x = (element.parent?.value.x ?? 0) + input.left;
          } else {
            element.value.x += input.left;
          }
        } else if (input.right !== undefined) {
          if (input.position === "absolute") {
            element.value.x =
              (element.parent?.value.x ?? 0) +
              parentWidth -
              input.right -
              element.value.width;
          } else {
            element.value.x = (element.parent?.value.x ?? 0) - input.right;
          }
        } else if (input.position === "absolute") {
          // If position is "absolute" but offsets are not specified, set
          // position to parent's top left corner.
          element.value.x = element.parent?.value.x ?? 0;
        }

        if (
          input.top !== undefined &&
          input.bottom !== undefined &&
          input.height === undefined
        ) {
          element.value.y = (element.parent?.value.y ?? 0) + input.top;
          element.value.height = parentHeight - input.top - input.bottom;
        } else if (input.top !== undefined) {
          if (input.position === "absolute") {
            element.value.y = (element.parent?.value.y ?? 0) + input.top;
          } else {
            element.value.y += input.top;
          }
        } else if (input.bottom !== undefined) {
          if (input.position === "absolute") {
            element.value.y =
              (element.parent?.value.y ?? 0) +
              parentHeight -
              input.bottom -
              element.value.height;
          } else {
            element.value.y = (element.parent?.value.y ?? 0) - input.bottom;
          }
        } else if (input.position === "absolute") {
          // If position is "absolute" but offsets are not specified, set
          // position to parent's top left corner.
          element.value.y = element.parent?.value.y ?? 0;
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

      invariant(input.paddingBottom !== undefined, "Padding is undefined.");
      invariant(input.paddingLeft !== undefined, "Padding is undefined.");
      invariant(input.paddingRight !== undefined, "Padding is undefined.");
      invariant(input.paddingTop !== undefined, "Padding is undefined.");

      invariant(input.marginBottom !== undefined, "Margin is undefined.");
      invariant(input.marginLeft !== undefined, "Margin is undefined.");
      invariant(input.marginRight !== undefined, "Margin is undefined.");
      invariant(input.marginTop !== undefined, "Margin is undefined.");

      element.value.x += input.marginLeft;
      element.value.y += input.marginTop;

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
      } else if (input.justifyContent === "space-around") {
        const horizontalGap = availableWidth / childrenCount;
        const verticalGap = availableHeight / childrenCount;

        p = element.firstChild;
        while (p) {
          p.value.x = x + horizontalGap / 2;
          p.value.y = y + verticalGap / 2;

          if (input.flexDirection === "row") {
            x += p.value.width + horizontalGap;
          }

          if (input.flexDirection === "column") {
            y += p.value.height + verticalGap;
          }

          p = p.next;
        }
      } else if (input.justifyContent === "space-evenly") {
        const horizontalGap = availableWidth / (childrenCount + 1);
        const verticalGap = availableHeight / (childrenCount + 1);

        p = element.firstChild;
        while (p) {
          p.value.x = x + horizontalGap;
          p.value.y = y + verticalGap;

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

      // Hide parts of views that overflow parent. Similarly, fix UV
      // coordinates for text.
      // TODO: implement this.
    }

    return this.root as TreeNode<FixedView>;
  }

  /**
   * Render the tree to the context. Most of the time it means that this step is
   * what takes UI to appear on the screen.
   */
  render(): void {
    const tree = this.flush();
    const list: FixedView[] = [];

    // Traverse the tree in DFS order to respect local order of components
    // (unlike in level order traversal).
    const queue = new Queue<TreeNode<FixedView>>();
    queue.enqueue(tree);
    while (!queue.isEmpty()) {
      const node = queue.dequeueFront();
      invariant(node, "Node should not be null.");

      list.push(node.value);

      let p = node.lastChild;
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

        p = p.prev;
      }
    }

    list.sort((a, b) => a.zIndex - b.zIndex);

    for (const view of list) {
      if ("text" in view.input) {
        this.context.text(
          view.input.text,
          view.x,
          view.y,
          view.input.fontSize,
          view.input.color ?? "rgba(0, 0, 0, 0)"
        );
      } else if ("points" in view.input) {
        if (view.input.type === "polygon") {
          this.context.polygon(
            view.input.points.map(([x, y]) => new Vec2(x + view.x, y + view.y)),
            view.backgroundColor
          );
        } else if (view.input.type === "line") {
          this.context.line(
            view.input.points.map(([x, y]) => new Vec2(x + view.x, y + view.y)),
            view.input.thickness,
            view.backgroundColor
          );
        }
      } else {
        this.context.rectangle(
          new Vec2(view.x, view.y),
          new Vec2(view.width, view.height),
          view.backgroundColor
        );
      }
    }
  }
}
