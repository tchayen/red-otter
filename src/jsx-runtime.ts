import { Style } from "./Style";
import { invariant } from "./invariant";
import {
  FixedView,
  fixedViewDefaults,
  TextStyle,
  textStyleDefaults,
  TreeNode,
  viewDefaults,
} from "./Layout";
import { parseColor } from "./parseColor";
import { resolveStylingValues } from "./resolveStylingValues";
import { hash } from "./hash";

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

type ViewAttributes = { style?: Style | Style[]; id?: string };
type TextAttributes = { style?: TextStyle | TextStyle[] };
type ShapeAttributes = { points: [number, number][]; color: string } & (
  | {
      thickness: number;
      type: "line";
    }
  | {
      type: "polygon";
    }
);

type Component = "view" | "text" | "shape";

export function jsx(
  component: (
    attributes: ViewAttributes | TextAttributes | ShapeAttributes | null
  ) => TreeNode<FixedView>,
  attributes: ViewAttributes,
  ...children: TreeNode<FixedView>[]
): TreeNode<FixedView>;
export function jsx(
  component: "view",
  attributes: ViewAttributes,
  ...children: TreeNode<FixedView>[]
): TreeNode<FixedView>;
export function jsx(
  component: "view",
  attributes: ViewAttributes,
  children: TreeNode<FixedView>[]
): TreeNode<FixedView>;
export function jsx(
  component: "text",
  attributes: TextAttributes,
  ...children: [string]
): TreeNode<FixedView>;
export function jsx(
  component: "shape",
  attributes: ShapeAttributes
): TreeNode<FixedView>;

/**
 *
 */
export function jsx(
  component:
    | Component
    | ((
        attributes: ViewAttributes | TextAttributes | ShapeAttributes | null
      ) => TreeNode<FixedView>),
  attributes: ViewAttributes | TextAttributes | ShapeAttributes | null,
  ...children: TreeNode<FixedView>[] | [TreeNode<FixedView>[]] | string[]
): TreeNode<FixedView> {
  if (typeof component === "function") {
    return component(attributes);
  }

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

      const borderColor = flattenedStyle.borderColor
        ? parseColor(flattenedStyle.borderColor)
        : undefined;

      const node = new TreeNode<FixedView>({
        input: { ...viewDefaults, ...resolveStylingValues(flattenedStyle) },
        ...fixedViewDefaults,
        backgroundColor,
        borderColor,
      });

      if (attributes && "id" in attributes && attributes.id) {
        node.id = hash(attributes.id);
      }

      for (const child of children) {
        // First element can be an array of children.
        if (Array.isArray(child)) {
          for (const c of child) {
            // TODO: fix types as according to them this should never be null.
            if (c) {
              node.addChild(c);
            }
          }
        } else {
          invariant(
            typeof child !== "string",
            "Text must be wrapped in <text>."
          );

          if (child) {
            // TODO: fix types as according to them this should never be null.
            node.addChild(child);
          }
        }
      }

      return node;
    }
    case "text": {
      const text = children.map((child) => String(child)).join("") ?? "";

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

      const shape = font.getTextShape(text, styleWithDefaults.fontSize);
      const { width, height } = shape.boundingRectangle;

      return new TreeNode<FixedView>({
        input: {
          ...resolveStylingValues(viewDefaults),
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
          ...viewDefaults,
          points: points.map(([x, y]) => [x - minX, y - minY]),
          type,
          width,
          height,
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
