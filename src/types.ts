import { Text } from "./Text";
import { View } from "./View";
import { Vec2 } from "./math/Vec2";

export enum UserEventType {
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

export type LayoutNodeState = {
  children: Array<Array<View | Text>>;
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollWidth: number;
  scrollX: number;
  scrollY: number;
  textWidthLimit?: number;
  x: number;
  y: number;
};

export enum AlignItems {
  Center,
  End,
  Start,
  Stretch,
}

export enum JustifyContent {
  Center,
  End,
  SpaceAround,
  SpaceBetween,
  SpaceEvenly,
  Start,
}

export enum AlignContent {
  Center,
  End,
  SpaceAround,
  SpaceBetween,
  SpaceEvenly,
  Start,
  Stretch,
}

export enum AlignSelf {
  Auto,
  Center,
  End,
  Start,
  Stretch,
}

export enum FlexDirection {
  Column,
  ColumnReverse,
  Row,
  RowReverse,
}

export enum FlexWrap {
  NoWrap,
  Wrap,
  WrapReverse,
}

export enum Overflow {
  Auto,
  Hidden,
  Scroll,
  Visible,
}

export enum Display {
  Flex,
  None,
}

export enum Position {
  Absolute,
  Relative,
}

export type LayoutProps = {
  alignContent?: AlignContent;
  alignItems?: AlignItems;
  alignSelf?: AlignSelf;
  aspectRatio?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  borderTopWidth?: number;
  borderWidth?: number;
  bottom?: number;
  columnGap?: number;
  display?: Display;
  flex?: number;
  flexBasis?: number | `${number}%`;
  flexDirection?: FlexDirection;
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: FlexWrap;
  gap?: number;
  height?: number | `${number}%`;
  justifyContent?: JustifyContent;
  left?: number;
  margin?: number;
  marginBottom?: number;
  marginHorizontal?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
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
  boxShadowColor?: string;
  boxShadowOffsetX?: number;
  boxShadowOffsetY?: number;
  boxShadowRadius?: number;
  opacity?: number;
};

export type ExactDecorativeProps = Required<DecorativeProps>;

export type TextStyleProps = {
  color: string;
  fontName: string;
  fontSize?: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
} & LayoutProps;

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
  overflow: Overflow.Visible,
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

const defaultDecorativeProps: DecorativeProps = {
  backgroundColor: "transparent",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  borderColor: "transparent",
  borderRadius: 0,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  boxShadowColor: "#000",
  boxShadowOffsetX: 0,
  boxShadowOffsetY: 0,
  boxShadowRadius: 0,
  opacity: 1,
};

export function normalizeLayoutProps<T extends LayoutProps>(input: LayoutProps): T {
  const result = { ...defaultLayoutProps, ...input } as T;

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

  result.overflowX = input.overflowX ?? input.overflow;
  result.overflowY = input.overflowY ?? input.overflow;

  return result;
}

export function normalizeDecorativeProps<T extends DecorativeProps>(input: DecorativeProps): T {
  const result = { ...defaultDecorativeProps, ...input } as T;

  result.borderTopLeftRadius = input.borderTopLeftRadius ?? input.borderRadius;
  result.borderTopRightRadius = input.borderTopRightRadius ?? input.borderRadius;
  result.borderBottomLeftRadius = input.borderBottomLeftRadius ?? input.borderRadius;
  result.borderBottomRightRadius = input.borderBottomRightRadius ?? input.borderRadius;

  return result;
}
