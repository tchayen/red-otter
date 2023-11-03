import { describe, it, expect } from "vitest";
import { Tree } from "./utils/Tree";
import type {
  FixedRectangle,
  RectangleStyleSheet,
  TextStyle,
} from "./ui/types";
import {
  fixedRectangleDefaults,
  rectangleDefaults,
  resolveRectangleStyling,
  resolveSpacing,
  textDefaults,
} from "./styling";
import { parseColor } from "./utils/parseColor";
import { shapeText } from "./font/shapeText";

import interTTF from "../public/interTTF.json";
import { prepareLookups } from "./font/prepareLookups";
import { TTF } from "./font/parseTTF";
import { layout } from "./layout";
import { Vec2 } from "./math/Vec2";

const lookups = prepareLookups(
  [{ buffer: new ArrayBuffer(0), name: "Inter", ttf: interTTF as TTF }],
  {
    // 108 was max for Inter+Bold on 4096x4096.
    alphabet:
      "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890 ,.:•-–()[]{}!?@#$%^&*+=/\\|<>`~’'\";_",
    fontSize: 150,
  }
);

function view(style: RectangleStyleSheet): Tree<FixedRectangle> {
  return new Tree<FixedRectangle>({
    ...fixedRectangleDefaults,
    input: { ...rectangleDefaults, ...resolveSpacing(style) },
    styles: resolveRectangleStyling(style),
  });
}

function text(value: string, style: TextStyle): Tree<FixedRectangle> {
  const shape = shapeText({
    fontName: style.fontName,
    fontSize: style.fontSize,
    lookups,
    text: value,
  });
  const { width, height } = shape.boundingRectangle;

  const input = { ...rectangleDefaults, ...resolveSpacing({}), height, width };

  return new Tree<FixedRectangle>({
    ...fixedRectangleDefaults,
    height,
    input,
    text: value,
    textStyle: { ...textDefaults, ...style, color: parseColor(style.color) },
    width,
  });
}

describe("Layout", () => {
  /**
   * ┌─────────────────────────────┐
   * │   ┌─────────────────────┐   │
   * │   │ ┌───┐  ┌───┐  ┌───┐ │   │
   * │   │X│0  │ Y│0  │ Z│0  │ │   │
   * │   │ └───┘  └───┘  └───┘ │   │
   * │   └─────────────────────┘   │
   * └─────────────────────────────┘
   */
  it("should layout inputs", () => {
    const inputGroupStyle = {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
    } as RectangleStyleSheet;

    const inputStyle = {
      backgroundColor: "#444",
      height: 30,
      justifyContent: "center",
      paddingHorizontal: 10,
      width: 60,
    } as RectangleStyleSheet;

    const textStyle = {
      color: "#fff",
      fontName: "Inter",
      fontSize: 14,
    } as TextStyle;

    const root = view({
      alignItems: "center",
      backgroundColor: "#000",
      height: 400,
      justifyContent: "center",
      width: 600,
    });

    const inner = view({
      backgroundColor: "#222",
      flexDirection: "row",
      gap: 20,
      justifyContent: "center",
      paddingHorizontal: 40,
      paddingVertical: 20,
    });
    root.add(inner);

    const xInputSection = view(inputGroupStyle);
    inner.add(xInputSection);
    const x = text("X", textStyle);
    xInputSection.add(x);
    const xInput = view(inputStyle);
    xInputSection.add(xInput);
    const xValue = text("0", textStyle);
    xInput.add(xValue);

    const yInputSection = view(inputGroupStyle);
    inner.add(yInputSection);
    const y = text("Y", textStyle);
    yInputSection.add(y);
    const yInput = view(inputStyle);
    yInputSection.add(yInput);
    const yValue = text("0", textStyle);
    yInput.add(yValue);

    const zInputSection = view(inputGroupStyle);
    inner.add(zInputSection);
    const z = text("Z", textStyle);
    zInputSection.add(z);
    const zInput = view(inputStyle);
    zInputSection.add(zInput);
    const zValue = text("0", textStyle);
    zInput.add(zValue);

    layout(root, lookups, new Vec2(1024, 768));
    const first = root.firstChild?.value.x;
    layout(root, lookups, new Vec2(1024, 768));
    const second = root.firstChild?.value.x;
    layout(root, lookups, new Vec2(1024, 768));
    const third = root.firstChild?.value.x;

    expect(first === second && second === third).toBe(true);

    expect(inner.value.width).toBe(351);
    expect(zValue.value.y).toBe(195);
  });
});
