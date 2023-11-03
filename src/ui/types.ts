import { Vec2 } from "../math/Vec2";
import { Vec4 } from "../math/Vec4";

export type RectangleStyleSheet = {
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  alignSelf?: "flex-start" | "center" | "flex-end" | "stretch";
  backgroundColor?: string;
  borderBottomWidth?: number;
  borderColor?: string;
  borderLeftWidth?: number;
  borderRadius?: number;
  borderRadiusBottom?: number;
  borderRadiusBottomLeft?: number;
  borderRadiusBottomRight?: number;
  borderRadiusTop?: number;
  borderRadiusTopLeft?: number;
  borderRadiusTopRight?: number;
  borderRightWidth?: number;
  borderTopWidth?: number;
  borderWidth?: number;
  bottom?: number;
  boxShadow?: BoxShadow;
  display?: "flex" | "none";
  flex?: number;
  flexDirection?: "row" | "column";
  gap?: number;
  height?: number | `${number}%` | undefined;
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
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
  overflow?: "visible" | "hidden" | "scroll";
  padding?: number;
  paddingBottom?: number;
  paddingHorizontal?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingVertical?: number;
  position?: "absolute" | "relative";
  right?: number;
  /**
   * Unimplemented.
   */
  scrollbar?: {
    backgroundColor?: string;

    borderColor?: string;
    borderRadius?: number;

    borderWidth?: number;
    thickness?: number;

    thumbBorderColor?: string;
    thumbBorderRadius?: number;
    thumbBorderWidth?: number;
    thumbColor?: string;
  };
  top?: number;
  width?: number | `${number}%` | undefined;
  // TODO: implement.
  zIndex?: number;
};

export type BoxShadow = {
  color: string;
  sigma: number;
  x: number;
  y: number;
};

export type TextStyle = {
  color: string;
  fontName: string;
  fontSize: number;
  lineHeight?: number;
  maxWidth?: number;
  trimEnd?: Vec2;
  trimStart?: Vec2;
};

export type RectangleStyling = {
  backgroundColor: Vec4;
  borderColor: Vec4;
  borderRadius: Vec4;
  borderWidth: Vec4;
  boxShadow: Omit<BoxShadow, "color"> & { color: Vec4 };
};

/**
 * Fixed rectangle is a rectangle with all layout properties resolved.
 */
export type FixedRectangle =
  | {
      input: RectangleStyleSheet;
      styles: RectangleStyling;
      zIndex: number;
    }
  | {
      input: RectangleStyleSheet;
      text: string;
      textStyle: Omit<TextStyle, "color"> & { color: Vec4 };
      zIndex: number;
    };

export type ResolvedInput = {
  [K in keyof RectangleStyleSheet]-?: NonNullable<RectangleStyleSheet[K]>;
};

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
