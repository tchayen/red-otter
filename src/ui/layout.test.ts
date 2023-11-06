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
  flexDirectionReverse,
  flexRowAndColumn,
  flexValue,
  flexWrap,
  inheritingSizes,
  marginsAndPaddings,
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

  it("flexDirection reverse", () => {
    const root = flexDirectionReverse();
    layout(root, lookups, new Vec2(1024, 768));

    const first = root.firstChild?.firstChild;
    const second = first?.next;
    const third = second?.next;
    const fifth = root.firstChild?.next?.firstChild;
    const sixth = fifth?.next;
    const seventh = sixth?.next;

    const nodes = [first, second, third, fifth, sixth, seventh];

    const expectedValues = [
      new Vec2(250, 0),
      new Vec2(180, 0),
      new Vec2(130, 0),
      new Vec2(0, 250),
      new Vec2(0, 180),
      new Vec2(0, 130),
    ];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.metrics.x).toBe(expectedValues[i].x);
      expect(nodes[i]?._state.metrics.y).toBe(expectedValues[i].y);
    }
  });

  it("flexWrap", () => {
    const root = flexWrap();
    layout(root, lookups, new Vec2(1024, 768));

    const first = root.firstChild?.firstChild;
    const second = first?.next;
    const third = second?.next;
    const fourth = third?.next;
    const fifth = fourth?.next;

    const expectedPositions = [
      new Vec2(100, 10),
      new Vec2(150, 10),
      new Vec2(211, 10),
      new Vec2(108, 48),
      new Vec2(100, 94),
    ];

    const nodes = [first, second, third, fourth, fifth];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.metrics.x).toBe(expectedPositions[i].x);
      expect(nodes[i]?._state.metrics.y).toBe(expectedPositions[i].y);
    }
  });

  it("margins and paddings", () => {
    const root = marginsAndPaddings();
    layout(root, lookups, new Vec2(1024, 768));

    const expectedValues = [
      [new Vec2(0, 0), new Vec2(270, 120)],
      [new Vec2(20, 10), new Vec2(100, 100)],
      [new Vec2(25, 25), new Vec2(50, 50)],
      [new Vec2(170, 10), new Vec2(50, 50)],
    ];

    const box = root.firstChild;
    const first = box?.firstChild;
    const inFirst = first?.firstChild;
    const second = first?.next;
    const nodes = [box, first, inFirst, second];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.metrics.x).toBe(expectedValues[i][0].x);
      expect(nodes[i]?._state.metrics.y).toBe(expectedValues[i][0].y);
      expect(nodes[i]?._state.metrics.width).toBe(expectedValues[i][1].x);
      expect(nodes[i]?._state.metrics.height).toBe(expectedValues[i][1].y);
    }
  });

  it("offsets", () => {
    const root = offsets();
    layout(root, lookups, new Vec2(1024, 768));

    const expectedPositions = [
      new Vec2(30, 30),
      new Vec2(60, 20),
      new Vec2(50, 100),
      new Vec2(0, 120),
      new Vec2(0, 200),
      new Vec2(50, 200),
      new Vec2(70, 230),
      new Vec2(10, 220),
    ];

    const first = root.firstChild;
    const second = first?.next;
    const third = second?.next;
    const fourth = third?.next;
    const box = fourth?.next;
    const fifth = box?.firstChild;
    const sixth = fifth?.next;
    const seventh = sixth?.next;
    const eighth = seventh?.next;

    const nodes = [first, second, third, fourth, fifth, sixth, seventh, eighth];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.metrics.x).toBe(expectedPositions[i].x);
      expect(nodes[i]?._state.metrics.y).toBe(expectedPositions[i].y);
    }
  });

  it("inheriting sizes", () => {
    const root = inheritingSizes();
    layout(root, lookups, new Vec2(1024, 768));

    const passThrough = root.firstChild;
    const inside = passThrough?.firstChild;
    const innermost = inside?.firstChild;
    const first = innermost?.firstChild;
    const minSize = passThrough?.next;
    const maxSize = minSize?.next;
    const maxSizeFirst = maxSize?.firstChild;
    const maxSizeSecond = maxSizeFirst?.next;

    expect(passThrough?.props.testID).toBe("passThrough");
    expect(inside?.props.testID).toBe("inside");
    expect(innermost?.props.testID).toBe("innermost");
    expect(first?.props.testID).toBe("first");
    expect(minSize?.props.testID).toBe("minSize");
    expect(maxSize?.props.testID).toBe("maxSize");
    expect(maxSizeFirst?.props.testID).toBe("maxSizeFirst");
    expect(maxSizeSecond?.props.testID).toBe("maxSizeSecond");

    const expectedSizes = [
      new Vec2(240, 150),
      new Vec2(240, 75),
      new Vec2(240, 75),
      new Vec2(80, 38),
      new Vec2(30, 30),
      new Vec2(40, 40),
      new Vec2(50, 50),
    ];

    const nodes = [passThrough, inside, innermost, first, minSize, maxSize, maxSizeSecond];

    for (let i = 0; i < nodes.length; i++) {
      console.log(i);
      expect(nodes[i]?._state.metrics.width).toBe(expectedSizes[i].x);
      expect(nodes[i]?._state.metrics.height).toBe(expectedSizes[i].y);
    }
  });
});
