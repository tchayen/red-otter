import { Vec4 } from "./math/Vec4";
import { parseColor } from "./utils/parseColor";
import { RectangleStyleSheet, TextStyle, RectangleStyling } from "./ui/types";

export const rectangleDefaults: RectangleStyleSheet = {
  alignItems: "flex-start",
  display: "flex",
  flexDirection: "column",
  gap: 0,
  justifyContent: "flex-start",
  padding: 0,
  position: "relative",
};

export const fixedRectangleDefaults = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
  zIndex: 0,
};

export const textDefaults: Partial<TextStyle> = {
  color: "#fff",
  fontSize: 14,
};

export const rectangleStylesDefaults: RectangleStyling = {
  backgroundColor: new Vec4(0, 0, 0, 0),
  borderColor: new Vec4(0, 0, 0, 0),
  borderRadius: new Vec4(0, 0, 0, 0),
  borderWidth: new Vec4(0, 0, 0, 0),
  boxShadow: {
    color: new Vec4(0, 0, 0, 0),
    sigma: 0.25,
    x: 0,
    y: 0,
  },
};

export function resolveSpacing(
  input: RectangleStyleSheet
): RectangleStyleSheet {
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

  input.borderRadiusTopLeft =
    input.borderRadiusTopLeft ??
    input.borderRadiusTop ??
    input.borderRadius ??
    0;
  input.borderRadiusTopRight =
    input.borderRadiusTopRight ??
    input.borderRadiusTop ??
    input.borderRadius ??
    0;
  input.borderRadiusBottomLeft =
    input.borderRadiusBottomLeft ??
    input.borderRadiusBottom ??
    input.borderRadius ??
    0;
  input.borderRadiusBottomRight =
    input.borderRadiusBottomRight ??
    input.borderRadiusBottom ??
    input.borderRadius ??
    0;

  input.borderTopWidth = input.borderTopWidth ?? input.borderWidth ?? 0;
  input.borderBottomWidth = input.borderBottomWidth ?? input.borderWidth ?? 0;
  input.borderLeftWidth = input.borderLeftWidth ?? input.borderWidth ?? 0;
  input.borderRightWidth = input.borderRightWidth ?? input.borderWidth ?? 0;

  return input;
}

export function resolveRectangleStyling(
  input: RectangleStyleSheet
): RectangleStyling {
  const boxShadow = {
    color: parseColor(input.boxShadow?.color ?? "transparent"),
    sigma: input.boxShadow?.sigma ?? 0.25,
    x: input.boxShadow?.x ?? 0,
    y: input.boxShadow?.y ?? 0,
  };

  return {
    backgroundColor: parseColor(input.backgroundColor ?? "transparent"),
    borderColor: parseColor(input.borderColor ?? "transparent"),
    borderRadius: new Vec4(
      input.borderRadiusTopLeft ??
        input.borderRadiusTop ??
        input.borderRadius ??
        0,
      input.borderRadiusTopRight ??
        input.borderRadiusTop ??
        input.borderRadius ??
        0,
      input.borderRadiusBottomLeft ??
        input.borderRadiusBottom ??
        input.borderRadius ??
        0,
      input.borderRadiusBottomRight ??
        input.borderRadiusBottom ??
        input.borderRadius ??
        0
    ),
    borderWidth: new Vec4(
      input.borderTopWidth ?? input.borderWidth ?? 0,
      input.borderRightWidth ?? input.borderWidth ?? 0,
      input.borderBottomWidth ?? input.borderWidth ?? 0,
      input.borderLeftWidth ?? input.borderWidth ?? 0
    ),
    boxShadow,
  };
}
