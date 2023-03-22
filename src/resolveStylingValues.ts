import { Style } from "./Style";

export function resolveStylingValues(input: Style): Style {
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
