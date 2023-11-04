import { describe, it, expect } from "vitest";

import interTTF from "../public/interTTF.json";
import { prepareLookups } from "./font/prepareLookups";
import { TTF } from "./font/parseTTF";
import { layout } from "./layout";
import { Vec2 } from "./math/Vec2";
import { View } from "./View";
import { Text } from "./Text";
import { TextStyleProps, ViewStyleProps } from "./types";

const lookups = prepareLookups(
  [{ buffer: new ArrayBuffer(0), name: "Inter", ttf: interTTF as TTF }],
  {
    // 108 was max for Inter+Bold on 4096x4096.
    alphabet:
      "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890 ,.:•-–()[]{}!?@#$%^&*+=/\\|<>`~’'\";_",
    fontSize: 150,
  }
);

function v(style: ViewStyleProps): View {
  return new View({ style });
}

function t(value: string, style: TextStyleProps): Text {
  return new Text(value, { lookups, style });
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
    } as ViewStyleProps;

    const inputStyle = {
      backgroundColor: "#444",
      height: 30,
      justifyContent: "center",
      paddingHorizontal: 10,
      width: 60,
    } as ViewStyleProps;

    const textStyle = {
      color: "#fff",
      fontName: "Inter",
      fontSize: 14,
    } as TextStyleProps;

    const root = v({
      alignItems: "center",
      backgroundColor: "#000",
      height: 400,
      justifyContent: "center",
      width: 600,
    });

    const inner = v({
      backgroundColor: "#222",
      flexDirection: "row",
      gap: 20,
      justifyContent: "center",
      paddingHorizontal: 40,
      paddingVertical: 20,
    });
    root.add(inner);

    const xInputSection = v(inputGroupStyle);
    inner.add(xInputSection);
    const x = t("X", textStyle);
    xInputSection.add(x);
    const xInput = v(inputStyle);
    xInputSection.add(xInput);
    const xValue = t("0", textStyle);
    xInput.add(xValue);

    const yInputSection = v(inputGroupStyle);
    inner.add(yInputSection);
    const y = t("Y", textStyle);
    yInputSection.add(y);
    const yInput = v(inputStyle);
    yInputSection.add(yInput);
    const yValue = t("0", textStyle);
    yInput.add(yValue);

    const zInputSection = v(inputGroupStyle);
    inner.add(zInputSection);
    const z = t("Z", textStyle);
    zInputSection.add(z);
    const zInput = v(inputStyle);
    zInputSection.add(zInput);
    const zValue = t("0", textStyle);
    zInput.add(zValue);

    layout(root, lookups, new Vec2(1024, 768));
    const first = root.firstChild?.__state.metrics.x;
    layout(root, lookups, new Vec2(1024, 768));
    const second = root.firstChild?.__state.metrics.x;
    layout(root, lookups, new Vec2(1024, 768));
    const third = root.firstChild?.__state.metrics.x;

    expect(first === second && second === third).toBe(true);

    expect(inner.__state.metrics.width).toBe(351);
    expect(zValue.__state.metrics.y).toBe(195);
  });
});
