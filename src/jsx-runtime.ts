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
      view: ViewProps;
      text: TextProps;
      shape: ShapeProps;
    }
  }
}

export type ViewProps = { style?: Style | Style[]; id?: string };
export type TextProps = { style?: TextStyle | TextStyle[] };
export type ShapeProps = { points: [number, number][]; color: string } & (
  | {
      thickness: number;
      type: "line";
    }
  | {
      type: "polygon";
    }
);

export type BuiltInTag = "view" | "text" | "shape";
export type Component = (
  props: ViewProps | TextProps | ShapeProps | null
) => TreeNode<FixedView>;

/**
 *
 */
export function createElement(
  type: BuiltInTag | Component,
  props: ViewProps | TextProps | ShapeProps | null,
  ...children: TreeNode<FixedView>[] | [TreeNode<FixedView>[]] | string[]
): TreeNode<FixedView> {
  if (typeof type === "function") {
    return type(props);
  }

  switch (type) {
    case "view": {
      if (
        props &&
        "style" in props &&
        props.style &&
        ("fontFamily" in props.style ||
          "fontSize" in props.style ||
          "color" in props.style)
      ) {
        throw new Error(
          "View does not accept text styles. Provide them directly to the <text> element."
        );
      }

      const flattenedStyle: Style = {};
      if (props === null || !("style" in props) || !props.style) {
        // Do nothing.
      } else if (Array.isArray(props.style)) {
        for (const s of props.style) {
          Object.assign(flattenedStyle, s);
        }
      } else {
        Object.assign(flattenedStyle, props.style);
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

      if (props && "id" in props && props.id) {
        node.id = hash(props.id);
      }

      const childrenFlat = children.flat();
      for (const child of childrenFlat) {
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
      if (props === null || !("style" in props) || !props.style) {
        // Do nothing.
      } else if (Array.isArray(props.style)) {
        for (const s of props.style) {
          Object.assign(style, s);
        }
      } else {
        Object.assign(style, props.style);
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
        props === null ||
        !("type" in props) ||
        !("points" in props) ||
        !("color" in props)
      ) {
        throw new Error("Shape must have type, points and color.");
      }

      if (props.type === "polygon" && "thickness" in props) {
        throw new Error("Polygon does not accept thickness.");
      }

      if ("style" in props) {
        throw new Error("Shape does not accept style.");
      }

      const { points, color, type } = props;
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
          thickness: "thickness" in props ? props.thickness : undefined,
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
 * Used by new JSX transform. Similar to https://github.com/facebook/react/blob/main/packages/react/src/jsx/ReactJSXElement.js
 */
export function jsx(
  type: BuiltInTag | Component,
  props: Record<string, unknown> | null
): ReturnType<typeof createElement> {
  return createElement(
    type,
    props as ViewProps,
    props?.children as TreeNode<FixedView>[]
  );
}

export const jsxs = jsx;
