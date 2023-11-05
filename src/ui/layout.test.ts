import { describe, it, expect } from "vitest";

import interTTF from "../../public/interTTF.json";
import { prepareLookups } from "../font/prepareLookups";
import { TTF } from "../font/parseTTF";
import { layout } from "./layout";
import { Vec2 } from "../math/Vec2";
import { View } from "../View";
import { Text } from "../Text";
import { TextStyleProps, ViewStyleProps } from "../types";
import {
  alignItemsAndSelf,
  flexRowAndColumn,
  flexValue,
  margins,
  offsets,
} from "../fixtures";

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
  it.skip("should layout inputs", () => {
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
      height: 300,
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
    const first = root.firstChild?._state.metrics.x;
    layout(root, lookups, new Vec2(1024, 768));
    const second = root.firstChild?._state.metrics.x;
    layout(root, lookups, new Vec2(1024, 768));
    const third = root.firstChild?._state.metrics.x;

    expect(first === second && second === third).toBe(true);

    expect(inner._state.metrics.width).toBe(351);
    expect(zValue._state.metrics.y).toBe(145);
  });

  it("flex value", () => {
    const root = flexValue();
    layout(root, lookups, new Vec2(1024, 768));

    const first = root.firstChild?.firstChild;
    const second = first?.next;
    const third = second?.next;
    const fourth = third?.next;
    const fifth = root.firstChild?.next?.firstChild;
    const sixth = fifth?.next;
    const seventh = sixth?.next;
    const eighth = seventh?.next;

    const expectedValues = [
      [new Vec2(50, 0), new Vec2(0, 50)],
      [new Vec2(50, 0), new Vec2(67, 50)],
      [new Vec2(117, 0), new Vec2(133, 50)],
      [new Vec2(250, 0), new Vec2(50, 50)],
      [new Vec2(0, 50), new Vec2(50, 0)],
      [new Vec2(0, 50), new Vec2(50, 67)],
      [new Vec2(0, 117), new Vec2(50, 133)],
      [new Vec2(0, 250), new Vec2(50, 50)],
    ];

    const nodes = [first, second, third, fourth, fifth, sixth, seventh, eighth];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.metrics.x).toBe(expectedValues[i][0].x);
      expect(nodes[i]?._state.metrics.y).toBe(expectedValues[i][0].y);
      expect(nodes[i]?._state.metrics.width).toBe(expectedValues[i][1].x);
      expect(nodes[i]?._state.metrics.height).toBe(expectedValues[i][1].y);
    }
  });

  it("flex row and column", () => {
    const root = flexRowAndColumn();
    layout(root, lookups, new Vec2(1024, 768));

    // Three items per row.
    const expectedRowPositions = [
      [new Vec2(0, 0), new Vec2(30, 0), new Vec2(70, 0)],
      [new Vec2(180, 25), new Vec2(210, 25), new Vec2(250, 25)],
      [new Vec2(90, 50), new Vec2(120, 50), new Vec2(160, 50)],
      [new Vec2(45, 75), new Vec2(120, 75), new Vec2(205, 75)],
      [new Vec2(30, 100), new Vec2(120, 100), new Vec2(220, 100)],
      [new Vec2(0, 125), new Vec2(120, 125), new Vec2(250, 125)],
    ];

    let c: View | Text | null | undefined = null;
    let box: View | Text | null | undefined = root.firstChild?.firstChild;

    for (let i = 0; i < expectedRowPositions.length; i++) {
      c = box?.firstChild;
      for (const expected of expectedRowPositions[i]) {
        expect(c?._state.metrics.x).toBe(expected.x);
        expect(c?._state.metrics.y).toBe(expected.y);
        c = c?.next;
      }
      box = box?.next;
    }

    const expectedColumnPositions = [
      [new Vec2(0, 150), new Vec2(0, 175), new Vec2(0, 200)],
      [new Vec2(50, 225), new Vec2(50, 250), new Vec2(50, 275)],
      [new Vec2(100, 188), new Vec2(100, 213), new Vec2(100, 238)],
      [new Vec2(150, 169), new Vec2(150, 213), new Vec2(150, 256)],
      [new Vec2(200, 163), new Vec2(200, 213), new Vec2(200, 263)],
      [new Vec2(250, 150), new Vec2(250, 213), new Vec2(250, 275)],
    ];

    box = root.firstChild?.next?.firstChild;

    for (let i = 0; i < expectedColumnPositions.length; i++) {
      c = box?.firstChild;
      for (const expected of expectedColumnPositions[i]) {
        expect(c?._state.metrics.x).toBe(expected.x);
        expect(c?._state.metrics.y).toBe(expected.y);
        c = c?.next;
      }
      box = box?.next;
    }
  });

  it("alignItemsAndSelf", () => {
    const root = alignItemsAndSelf();
    layout(root, lookups, new Vec2(1024, 768));

    let c: View | Text | null | undefined = null;
    let box: View | Text | null | undefined = root.firstChild?.firstChild;

    const expectedRowPositions = [
      [new Vec2(92, 0), new Vec2(118, 22)],
      [new Vec2(144, 44), new Vec2(170, 0)],
      [new Vec2(196, 22), new Vec2(222, 0)],
      [new Vec2(248, 0), new Vec2(274, 44)],
    ];

    for (let i = 0; i < expectedRowPositions.length; i++) {
      c = box?.firstChild;
      for (const expected of expectedRowPositions[i]) {
        expect(c?._state.metrics.x).toBe(expected.x);
        expect(c?._state.metrics.y).toBe(expected.y);
        c = c?.next;
      }
      box = box?.next;
    }

    const expectedColumnPositions = [
      [new Vec2(0, 92), new Vec2(22, 118)],
      [new Vec2(44, 144), new Vec2(0, 170)],
      [new Vec2(22, 196), new Vec2(0, 222)],
      [new Vec2(0, 248), new Vec2(44, 274)],
    ];

    box = root.firstChild?.next?.firstChild;

    for (let i = 0; i < expectedColumnPositions.length; i++) {
      c = box?.firstChild;
      for (const expected of expectedColumnPositions[i]) {
        expect(c?._state.metrics.x).toBe(expected.x);
        expect(c?._state.metrics.y).toBe(expected.y);
        c = c?.next;
      }
      box = box?.next;
    }
  });

  it("margins", () => {
    const root = margins();
    layout(root, lookups, new Vec2(1024, 768));

    const expectedPositions = [
      [new Vec2(5, 5), new Vec2(40, 0), new Vec2(80, 0)],
      [new Vec2(175, 55), new Vec2(210, 50), new Vec2(250, 50)],
      [new Vec2(90, 105), new Vec2(125, 100), new Vec2(165, 100)],
      [new Vec2(48, 155), new Vec2(125, 150), new Vec2(208, 150)],
      [new Vec2(33, 205), new Vec2(125, 200), new Vec2(222, 200)],
      [new Vec2(5, 255), new Vec2(125, 250), new Vec2(250, 250)],
    ];

    let c: View | Text | null | undefined = null;
    let row: View | Text | null | undefined = root.firstChild;

    for (let i = 0; i < expectedPositions.length; i++) {
      c = row?.firstChild;
      for (const expected of expectedPositions[i]) {
        expect(c?._state.metrics.x).toBe(expected.x);
        expect(c?._state.metrics.y).toBe(expected.y);
        c = c?.next;
      }
      row = row?.next;
    }
  });

  it("offsets", () => {
    const root = offsets();
    layout(root, lookups, new Vec2(1024, 768));

    const expectedPositions = [
      new Vec2(30, 30),
      new Vec2(50, 50),
      new Vec2(0, 70),
      new Vec2(0, 150),
      new Vec2(50, 150),
      new Vec2(70, 180),
      new Vec2(10, 190),
    ];

    const first = root.firstChild;
    const second = first?.next;
    const third = second?.next;
    const box = third?.next;
    const fourth = box?.firstChild;
    const fifth = fourth?.next;
    const sixth = fifth?.next;
    const seventh = sixth?.next;

    const nodes = [first, second, third, fourth, fifth, sixth, seventh];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.metrics.x).toBe(expectedPositions[i].x);
      expect(nodes[i]?._state.metrics.y).toBe(expectedPositions[i].y);
    }
  });
});
