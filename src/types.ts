export enum UserEventType {
  MouseClick,
  MouseMove,
}

export type ClickEvent = {
  type: UserEventType.MouseClick;
  x: number;
  y: number;
};

export type MoveEvent = {
  type: UserEventType.MouseMove;
  x: number;
  y: number;
};

export type UserEvent = ClickEvent | MoveEvent;

export type LayoutProps = {
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  alignSelf?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  bottom?: number;
  columnGap?: number;
  display?: "flex" | "none";
  flex?: number;
  flexBasis?: number;
  flexDirection?: "row" | "column";
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
  gap?: number;
  height?: number | `${number}%`;
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
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
  overflow?: "visible" | "hidden" | "scroll";
  padding?: number;
  paddingBottom?: number;
  paddingHorizontal?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingVertical?: number;
  position?: "relative" | "absolute";
  right?: number;
  rowGap?: number;
  top?: number;
  width?: number | `${number}%`;
  zIndex?: number;
};

/**
 * All shorthand properties are expanded. All properties with defaults are required.
 */
export type ExactLayoutProps = Required<
  Omit<
    LayoutProps,
    | "padding"
    | "paddingHorizontal"
    | "paddingVertical"
    | "margin"
    | "marginHorizontal"
    | "marginVertical"
    | "gap"
    | "bottom"
    | "left"
    | "right"
    | "top"
    | "width"
    | "height"
    | "maxHeight"
    | "maxWidth"
    | "minHeight"
    | "minWidth"
  >
> & {
  bottom: LayoutProps["bottom"];
  height: LayoutProps["height"];
  left: LayoutProps["left"];
  maxHeight: LayoutProps["maxHeight"];
  maxWidth: LayoutProps["maxWidth"];
  minHeight: LayoutProps["minHeight"];
  minWidth: LayoutProps["minWidth"];
  right: LayoutProps["right"];
  top: LayoutProps["top"];
  width: LayoutProps["width"];
};

export type Rectangle = {
  height: number;
  width: number;
  x: number;
  y: number;
};

// TODO: scroll position!
export type LayoutRectangle = {
  rectangle: Rectangle;
  /*
   * Only those are relevant to pass on to drawing.
   */
  style: Pick<LayoutProps, "display" | "zIndex" | "overflow"> & DecorativeProps;
};

export type RenderingQuad = {
  rectangle: Rectangle;
  style: DecorativeProps;
};

export type TextStyleProps = {
  color: string;
  fontName: string;
  fontSize: number;
  lineHeight: number;
  textAlign: "left" | "center" | "right";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
} & LayoutProps;

export type DecorativeProps = {
  backgroundColor: string;
  borderBottomLeftRadius: number;

  borderBottomRightRadius: number;
  borderBottomWidth: number;
  borderColor: string;
  borderLeftWidth: number;

  borderRadius: number;
  borderRightWidth: number;
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderTopWidth: number;
  borderWidth: number;

  boxShadowColor: string;
  boxShadowOffsetX: number;
  boxShadowOffsetY: number;
  boxShadowRadius: number;
  opacity: number;
};

export type ViewStyleProps = ExactLayoutProps & DecorativeProps;

type View = {
  onClick(event: ClickEvent): void;
  pointerEvents: boolean;
  style: ViewStyleProps;
  tabIndex: number;
};

type Text = {
  style: TextStyleProps;
  text: string;
};

const defaultLayoutProps: ExactLayoutProps = {
  alignContent: "flex-start",
  alignItems: "flex-start",
  alignSelf: "flex-start",
  bottom: undefined,
  columnGap: 0,
  display: "flex",
  flex: 0,
  flexBasis: 0,
  flexDirection: "row",
  flexGrow: 0,
  flexShrink: 0,
  flexWrap: "nowrap",
  height: undefined,
  justifyContent: "flex-start",
  left: undefined,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  maxHeight: undefined,
  maxWidth: undefined,
  minHeight: undefined,
  minWidth: undefined,
  overflow: "visible",
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  position: "relative",
  right: undefined,
  rowGap: 0,
  top: undefined,
  width: undefined,
  zIndex: 0,
};

function normalizeLayoutProps(input: LayoutProps): ExactLayoutProps {
  const result: ExactLayoutProps = { ...defaultLayoutProps, ...input };

  result.paddingTop =
    input.paddingTop ?? input.paddingVertical ?? input.padding ?? 0;
  result.paddingBottom =
    input.paddingBottom ?? input.paddingVertical ?? input.padding ?? 0;
  result.paddingLeft =
    input.paddingLeft ?? input.paddingHorizontal ?? input.padding ?? 0;
  result.paddingRight =
    input.paddingRight ?? input.paddingHorizontal ?? input.padding ?? 0;

  result.marginTop =
    input.marginTop ?? input.marginVertical ?? input.margin ?? 0;
  result.marginBottom =
    input.marginBottom ?? input.marginVertical ?? input.margin ?? 0;
  result.marginLeft =
    input.marginLeft ?? input.marginHorizontal ?? input.margin ?? 0;
  result.marginRight =
    input.marginRight ?? input.marginHorizontal ?? input.margin ?? 0;

  result.columnGap = input.columnGap ?? input.gap ?? 0;
  result.rowGap = input.rowGap ?? input.gap ?? 0;

  return result;
}
