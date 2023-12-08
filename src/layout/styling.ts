import type { Text } from "./Text";
import type { View } from "./View";
import { Vec2 } from "../math/Vec2";

export const enum UserEventType {
  MouseClick,
  MouseMove,
  MouseScroll,
}

export type ClickEvent = {
  position: Vec2;
  type: UserEventType.MouseClick;
};

export type MoveEvent = {
  position: Vec2;
  type: UserEventType.MouseMove;
};

export type ScrollEvent = {
  delta: Vec2;
  position: Vec2;
  type: UserEventType.MouseScroll;
};

export type UserEvent = ClickEvent | MoveEvent | ScrollEvent;

/**
 * Internal state of the node. Might be useful for debugging or hacking around but it is subject
 * to change at any point without notice.
 */
export type LayoutNodeState = {
  /**
   * Temporary array used by layout.
   */
  children: Array<Array<View | Text>>;
  /**
   * Height of the element excluding scrollbar.
   */
  clientHeight: number;
  /**
   * Width of the element excluding scrollbar.
   */
  clientWidth: number;
  /**
   * Screen-space position.
   */
  clipSize: Vec2;
  /**
   * Screen-space position.
   */
  clipStart: Vec2;
  /**
   * Height of the element including (potential) scrollbar and scrollable content.
   */
  scrollHeight: number;
  /**
   * Width of the element including (potential) scrollbar and scrollable content.
   */
  scrollWidth: number;
  /**
   * Current scroll position relative to parent.
   */
  scrollX: number;
  /**
   * Current scroll position relative to parent.
   */
  scrollY: number;
  /**
   * Is it still needed?
   */
  textWidthLimit?: number;
  /**
   * Sum of all scroll positions inside the parent chain.
   */
  totalScrollX: number;
  /**
   * Sum of all scroll positions inside the parent chain.
   */
  totalScrollY: number;
  /**
   * Screen-space position of element after layout (pre-scroll).
   */
  x: number;
  /**
   * Screen-space position of element after layout (pre-scroll).
   */
  y: number;
};

export const defaultLayoutNodeState = {
  children: [],
  clientHeight: 0,
  clientWidth: 0,
  clipSize: new Vec2(0, 0),
  clipStart: new Vec2(0, 0),
  scrollHeight: 0,
  scrollWidth: 0,
  scrollX: 0,
  scrollY: 0,
  totalScrollX: 0,
  totalScrollY: 0,
  x: 0,
  y: 0,
};

/**
 * Corresponds to CSS align-items.
 */
export const enum AlignItems {
  Center,
  End,
  Start,
  Stretch,
}

/**
 *  Corresponds to CSS align-items.
 */
export const enum JustifyContent {
  Center,
  End,
  SpaceAround,
  SpaceBetween,
  SpaceEvenly,
  Start,
}

/**
 * Corresponds to CSS align-content.
 */
export const enum AlignContent {
  Center,
  End,
  SpaceAround,
  SpaceBetween,
  SpaceEvenly,
  Start,
  Stretch,
}

/**
 * Corresponds to CSS align-self.
 */
export const enum AlignSelf {
  Auto,
  Center,
  End,
  Start,
  Stretch,
}

/**
 * Corresponds to CSS flex-direction.
 */
export const enum FlexDirection {
  Column,
  ColumnReverse,
  Row,
  RowReverse,
}

/**
 * Corresponds to CSS flex-wrap.
 */
export const enum FlexWrap {
  NoWrap,
  Wrap,
  WrapReverse,
}

/**
 * Determines how the element is clipped. Corresponds to CSS overflow.
 */
export const enum Overflow {
  /**
   * Shows scrollbars if needed.
   */
  Auto,
  /**
   * Clips content but doesn't show scrollbars.
   */
  Hidden,
  /**
   * Shows scrollbars always.
   */
  Scroll,
  /**
   * Lets content overflow the parent.
   */
  Visible,
}

/**
 * Corresponds to CSS display.
 */
export const enum Display {
  Flex,
  None,
}

/**
 * Corresponds to CSS position.
 */
export const enum Position {
  Absolute,
  Relative,
}

/**
 * All layout properties.
 */
export type LayoutProps = {
  /**
   * Controls positioning of rows (or columns) when wrapping.
   */
  alignContent?: AlignContent;
  /**
   * Controls positioning of children on the cross axis.
   */
  alignItems?: AlignItems;
  /**
   * Controls positioning of the item itself on the cross axis.
   */
  alignSelf?: AlignSelf;
  /**
   * Enforces a specific aspect ratio on the size of the element. Uses the specified size
   * (either `width` or `height`) for calculating the other dimension. Respects `minWidth` and
   * `minHeight`.
   */
  aspectRatio?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  borderTopWidth?: number;
  borderWidth?: number;
  bottom?: number;
  /**
   * Overrides `gap` for columns.
   */
  columnGap?: number;
  display?: Display;
  flex?: number;
  /**
   * In row does the same as `width` and in column does the same as `height`.
   */
  flexBasis?: number | `${number}%`;
  flexDirection?: FlexDirection;
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: FlexWrap;
  gap?: number;
  height?: number | `${number}%`;
  /**
   * Controls positioning of children on the main axis.
   */
  justifyContent?: JustifyContent;
  left?: number;
  margin?: number;
  /**
   * Overrides `marginVertical` on the bottom.
   */
  marginBottom?: number;
  /**
   * Overrides `margin` on horizontal directions.
   */
  marginHorizontal?: number;
  /**
   * Overrides `marginHorizontal` on the left.
   */
  marginLeft?: number;
  /**
   * Overrides `marginHorizontal` on the right.
   */
  marginRight?: number;
  /**
   * Overrides `marginVertical` on the top.
   */
  marginTop?: number;
  /**
   * Overrides `margin` on vertical directions.
   */
  marginVertical?: number;
  maxHeight?: number | `${number}%`;
  maxWidth?: number | `${number}%`;
  minHeight?: number | `${number}%`;
  minWidth?: number | `${number}%`;
  overflow?: Overflow;
  overflowX?: Overflow;
  overflowY?: Overflow;
  padding?: number;
  paddingBottom?: number;
  paddingHorizontal?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingVertical?: number;
  position?: Position;
  right?: number;
  /**
   * Overrides `gap` for rows.
   */
  rowGap?: number;
  top?: number;
  width?: number | `${number}%`;
  zIndex?: number;
};

/**
 * All shorthand properties are expanded. All properties with defaults are required. Some properties
 * might rename undefined if that is recognized as a valid value by the layout.
 */
export type ExactLayoutProps = Required<
  Omit<
    LayoutProps,
    | "aspectRatio"
    | "bottom"
    | "flexBasis"
    | "height"
    | "left"
    | "margin"
    | "marginHorizontal"
    | "marginVertical"
    | "maxHeight"
    | "maxWidth"
    | "minHeight"
    | "minWidth"
    | "overflow"
    | "overflowX"
    | "overflowY"
    | "padding"
    | "paddingHorizontal"
    | "paddingVertical"
    | "right"
    | "top"
    | "width"
    | "zIndex"
  >
> & {
  aspectRatio: LayoutProps["aspectRatio"];
  bottom: LayoutProps["bottom"];
  flexBasis: LayoutProps["flexBasis"];
  height: LayoutProps["height"];
  left: LayoutProps["left"];
  maxHeight: LayoutProps["maxHeight"];
  maxWidth: LayoutProps["maxWidth"];
  minHeight: LayoutProps["minHeight"];
  minWidth: LayoutProps["minWidth"];
  overflowX: LayoutProps["overflowX"];
  overflowY: LayoutProps["overflowY"];
  right: LayoutProps["right"];
  top: LayoutProps["top"];
  width: LayoutProps["width"];
  zIndex: LayoutProps["zIndex"];
};

export type DecorativeProps = {
  backgroundColor?: string;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderColor?: string;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  /**
   * Not implemented yet.
   */
  boxShadowColor?: string;
  /**
   * Not implemented yet.
   */
  boxShadowOffsetX?: number;
  /**
   * Not implemented yet.
   */
  boxShadowOffsetY?: number;
  /**
   * Not implemented yet.
   */
  boxShadowRadius?: number;
  /**
   * Not implemented yet.
   */
  opacity?: number;
};

export type ExactDecorativeProps = Required<Omit<DecorativeProps, "borderRadius">>;

/**
 * Corresponds to CSS text-transform.
 */
export const enum TextTransform {
  None,
  Capitalize,
  Lowercase,
  Uppercase,
}

/**
 * Corresponds to CSS text-align.
 */
export const enum TextAlign {
  Center,
  Left,
  Right,
}

/**
 * Controls how text is rendered. Note that due to a custom text renderer, there might be some
 * differences in how text is rendered compared to a browser.
 */
export type TextStyleProps = {
  color: string;
  /**
   * As defined in the lookups object.
   */
  fontName: string;
  fontSize?: number;
  lineHeight?: number;
  textAlign?: TextAlign;
  textTransform?: TextTransform;
};

export type ViewStyleProps = LayoutProps & DecorativeProps;

const defaultLayoutProps: ExactLayoutProps = {
  alignContent: AlignContent.Start,
  alignItems: AlignItems.Start,
  alignSelf: AlignSelf.Auto,
  aspectRatio: undefined,
  borderBottomWidth: 0,
  borderLeftWidth: 0,
  borderRightWidth: 0,
  borderTopWidth: 0,
  borderWidth: 0,
  bottom: undefined,
  columnGap: 0,
  display: Display.Flex,
  flex: 0,
  flexBasis: undefined,
  flexDirection: FlexDirection.Column,
  flexGrow: 0,
  flexShrink: 0,
  flexWrap: FlexWrap.NoWrap,
  gap: 0,
  height: undefined,
  justifyContent: JustifyContent.Start,
  left: undefined,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  maxHeight: undefined,
  maxWidth: undefined,
  minHeight: undefined,
  minWidth: undefined,
  overflowX: Overflow.Visible,
  overflowY: Overflow.Visible,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  position: Position.Relative,
  right: undefined,
  rowGap: 0,
  top: undefined,
  width: undefined,
  zIndex: undefined,
};

const defaultDecorativeProps: ExactDecorativeProps = {
  backgroundColor: "transparent",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  borderColor: "transparent",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  boxShadowColor: "#000",
  boxShadowOffsetX: 0,
  boxShadowOffsetY: 0,
  boxShadowRadius: 0,
  opacity: 1,
};

export const defaultTextStyleProps: Required<TextStyleProps> = {
  color: "#000",
  fontName: "Inter",
  fontSize: 16,
  lineHeight: 20,
  textAlign: TextAlign.Left,
  textTransform: TextTransform.None,
};

export function normalizeLayoutProps<T extends LayoutProps, S extends ExactLayoutProps>(
  input: T,
): S {
  const result = { ...defaultLayoutProps, ...input };

  result.paddingTop = input.paddingTop ?? input.paddingVertical ?? input.padding ?? 0;
  result.paddingBottom = input.paddingBottom ?? input.paddingVertical ?? input.padding ?? 0;
  result.paddingLeft = input.paddingLeft ?? input.paddingHorizontal ?? input.padding ?? 0;
  result.paddingRight = input.paddingRight ?? input.paddingHorizontal ?? input.padding ?? 0;

  result.marginTop = input.marginTop ?? input.marginVertical ?? input.margin ?? 0;
  result.marginBottom = input.marginBottom ?? input.marginVertical ?? input.margin ?? 0;
  result.marginLeft = input.marginLeft ?? input.marginHorizontal ?? input.margin ?? 0;
  result.marginRight = input.marginRight ?? input.marginHorizontal ?? input.margin ?? 0;

  result.borderBottomWidth = input.borderBottomWidth ?? input.borderWidth ?? 0;
  result.borderTopWidth = input.borderTopWidth ?? input.borderWidth ?? 0;
  result.borderLeftWidth = input.borderLeftWidth ?? input.borderWidth ?? 0;
  result.borderRightWidth = input.borderRightWidth ?? input.borderWidth ?? 0;

  result.columnGap = input.columnGap ?? input.gap ?? 0;
  result.rowGap = input.rowGap ?? input.gap ?? 0;

  result.overflowX = input.overflowX ?? input.overflow ?? Overflow.Visible;
  result.overflowY = input.overflowY ?? input.overflow ?? Overflow.Visible;

  return result as S;
}

export function normalizeDecorativeProps<T extends DecorativeProps, S extends ExactDecorativeProps>(
  input: T,
): S {
  const result = { ...defaultDecorativeProps, ...input };

  result.borderTopLeftRadius = input.borderTopLeftRadius ?? input.borderRadius ?? 0;
  result.borderTopRightRadius = input.borderTopRightRadius ?? input.borderRadius ?? 0;
  result.borderBottomLeftRadius = input.borderBottomLeftRadius ?? input.borderRadius ?? 0;
  result.borderBottomRightRadius = input.borderBottomRightRadius ?? input.borderRadius ?? 0;

  return result as S;
}
