import { describe, it, expect } from "vitest";

import interTTF from "../../public/interTTF.json"; // This is a 1.8MB JSON file (95kB gzipped).
import { prepareLookups } from "../font/prepareLookups";
import { TTF } from "../font/parseTTF";
import { layout } from "./layout";
import { Vec2 } from "../math/Vec2";
import { View } from "../View";
import { Text } from "../Text";
import * as fixtures from "../fixtures";
import { getByTestId } from "./getByTestId";

// Silence console.debug() output during tests.
console.debug = () => {};

const alphabet =
  "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890 ,.:•-–()[]{}!?@#$%^&*+=/\\|<>`~’'\";_";
const lookups = prepareLookups(
  [{ buffer: new ArrayBuffer(0), name: "Inter", ttf: interTTF as TTF }],
  { alphabet, fontSize: 150 }
);

fixtures.setLookups(lookups);

// NOTE:
// Layout is run twice to ensure that the second run doesn't change anything, i.e. it's idempotent.

describe("Layout", () => {
  it("flex value", () => {
    const root = fixtures.flexValue();
    layout(root, lookups, new Vec2(1024, 768));
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
      expect(nodes[i]?._state.x).toBe(expectedValues[i]![0]?.x);
      expect(nodes[i]?._state.y).toBe(expectedValues[i]![0]?.y);
      expect(nodes[i]?._state.clientWidth).toBe(expectedValues[i]![1]?.x);
      expect(nodes[i]?._state.clientHeight).toBe(expectedValues[i]![1]?.y);
    }
  });

  it("flexDirection row and column", () => {
    const root = fixtures.flexRowAndColumn();
    layout(root, lookups, new Vec2(1024, 768));
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
      for (const expected of expectedRowPositions[i]!) {
        expect(c?._state.x).toBe(expected.x);
        expect(c?._state.y).toBe(expected.y);
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
      for (const expected of expectedColumnPositions[i]!) {
        expect(c?._state.x).toBe(expected.x);
        expect(c?._state.y).toBe(expected.y);
        c = c?.next;
      }
      box = box?.next;
    }
  });

  it("alignItems and alignSelf", () => {
    const root = fixtures.alignItemsAndSelf();
    layout(root, lookups, new Vec2(1024, 768));
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
      for (const expected of expectedRowPositions[i]!) {
        expect(c?._state.x).toBe(expected.x);
        expect(c?._state.y).toBe(expected.y);
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
      for (const expected of expectedColumnPositions[i]!) {
        expect(c?._state.x).toBe(expected.x);
        expect(c?._state.y).toBe(expected.y);
        c = c?.next;
      }
      box = box?.next;
    }
  });

  it("flexDirection reverse", () => {
    const root = fixtures.flexDirectionReverse();
    layout(root, lookups, new Vec2(1024, 768));
    layout(root, lookups, new Vec2(1024, 768));

    // Three items per row.
    const expectedRowPositions = [
      [new Vec2(270, 0), new Vec2(230, 0), new Vec2(180, 0)],
      [new Vec2(90, 25), new Vec2(50, 25), new Vec2(0, 25)],
      [new Vec2(180, 50), new Vec2(140, 50), new Vec2(90, 50)],
      [new Vec2(225, 75), new Vec2(140, 75), new Vec2(45, 75)],
      [new Vec2(240, 100), new Vec2(140, 100), new Vec2(30, 100)],
      [new Vec2(270, 125), new Vec2(140, 125), new Vec2(0, 125)],
    ];

    let c: View | Text | null | undefined = null;
    let box: View | Text | null | undefined = root.firstChild?.firstChild;

    for (let i = 0; i < expectedRowPositions.length; i++) {
      c = box?.firstChild;
      for (const expected of expectedRowPositions[i]!) {
        expect(c?._state.x).toBe(expected.x);
        expect(c?._state.y).toBe(expected.y);
        c = c?.next;
      }
      box = box?.next;
    }

    const expectedColumnPositions = [
      [new Vec2(0, 275), new Vec2(0, 250), new Vec2(0, 225)],
      [new Vec2(50, 200), new Vec2(50, 175), new Vec2(50, 150)],
      [new Vec2(100, 238), new Vec2(100, 213), new Vec2(100, 188)],
      [new Vec2(150, 256), new Vec2(150, 213), new Vec2(150, 169)],
      [new Vec2(200, 263), new Vec2(200, 213), new Vec2(200, 163)],
      [new Vec2(250, 275), new Vec2(250, 213), new Vec2(250, 150)],
    ];

    box = root.firstChild?.next?.firstChild;

    for (let i = 0; i < expectedColumnPositions.length; i++) {
      c = box?.firstChild;
      for (const expected of expectedColumnPositions[i]!) {
        expect(c?._state.x).toBe(expected.x);
        expect(c?._state.y).toBe(expected.y);
        c = c?.next;
      }
      box = box?.next;
    }
  });

  it("flexWrap row", () => {
    const root = fixtures.flexWrapRow();
    layout(root, lookups, new Vec2(1024, 768));
    layout(root, lookups, new Vec2(1024, 768));

    const box = root.firstChild;
    const first = box?.firstChild;
    const second = first?.next;
    const third = second?.next;
    const fourth = third?.next;
    const fifth = fourth?.next;

    const nodes = [first, second, third, fourth, fifth];

    expect(box?._state.clientWidth).toBe(300);
    expect(box?._state.clientHeight).toBe(123);

    const expectedPositions = [
      new Vec2(0, 14),
      new Vec2(70, 10),
      new Vec2(131, 14),
      new Vec2(8, 48),
      new Vec2(0, 94),
    ];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.x).toBe(expectedPositions[i]?.x);
      expect(nodes[i]?._state.y).toBe(expectedPositions[i]?.y);
    }
  });

  it("flexWrap column", () => {
    const root = fixtures.flexWrapColumn();
    layout(root, lookups, new Vec2(1024, 768));
    layout(root, lookups, new Vec2(1024, 768));

    const box = root.firstChild;
    const first = box?.firstChild;
    const second = first?.next;
    const third = second?.next;
    const fourth = third?.next;
    const fifth = fourth?.next;

    const nodes = [first, second, third, fourth, fifth];

    expect(box?._state.clientWidth).toBe(123);
    expect(box?._state.clientHeight).toBe(300);

    const expectedPositions = [
      new Vec2(88, 0),
      new Vec2(80, 70),
      new Vec2(88, 131),
      new Vec2(34, 8),
      new Vec2(10, 0),
    ];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.x).toBe(expectedPositions[i]?.x);
      expect(nodes[i]?._state.y).toBe(expectedPositions[i]?.y);
    }
  });

  it("alignContent", () => {
    const root = fixtures.alignContent();
    layout(root, lookups, new Vec2(1024, 768));
    layout(root, lookups, new Vec2(1024, 768));

    const flexStart = root.firstChild;
    const startFirst = flexStart?.firstChild;
    const startFourth = startFirst?.next?.next?.next;

    const flexCenter = flexStart?.next;
    const centerFirst = flexCenter?.firstChild;
    const centerFourth = centerFirst?.next?.next?.next;

    const flexEnd = flexCenter?.next;
    const endFirst = flexEnd?.firstChild;
    const endFourth = endFirst?.next?.next?.next;

    const spaceBetween = flexEnd?.next;
    const spaceBetweenFirst = spaceBetween?.firstChild;
    const spaceBetweenFourth = spaceBetweenFirst?.next?.next?.next;

    const spaceAround = spaceBetween?.next;
    const spaceAroundFirst = spaceAround?.firstChild;
    const spaceAroundFourth = spaceAroundFirst?.next?.next?.next;

    const spaceEvenly = spaceAround?.next;
    const spaceEvenlyFirst = spaceEvenly?.firstChild;
    const spaceEvenlyFourth = spaceEvenlyFirst?.next?.next?.next;

    const stretch = spaceEvenly?.next;
    const stretchFirst = stretch?.firstChild;
    const stretchFourth = stretchFirst?.next?.next?.next;

    const nodes = [
      startFirst,
      startFourth,
      centerFirst,
      centerFourth,
      endFirst,
      endFourth,
      spaceBetweenFirst,
      spaceBetweenFourth,
      spaceAroundFirst,
      spaceAroundFourth,
      spaceEvenlyFirst,
      spaceEvenlyFourth,
      stretchFirst,
      stretchFourth,
    ];

    const expectedPositions = [
      new Vec2(0, 0),
      new Vec2(0, 20),
      new Vec2(0, 93),
      new Vec2(0, 113),
      new Vec2(0, 185),
      new Vec2(0, 205),
      new Vec2(0, 225),
      new Vec2(0, 280),
      new Vec2(150, 9),
      new Vec2(150, 46),
      new Vec2(150, 87),
      new Vec2(150, 118),
      new Vec2(150, 150),
      new Vec2(150, 188),
    ];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.x).toBe(expectedPositions[i]?.x);
      expect(nodes[i]?._state.y).toBe(expectedPositions[i]?.y);
    }
  });

  it("flexShrink and flexGrow", () => {
    const root = fixtures.flexShrinkAndGrow();
    layout(root, lookups, new Vec2(1024, 768));
    layout(root, lookups, new Vec2(1024, 768));

    const firstRow = root.firstChild;
    const firstRowFirst = firstRow?.firstChild;
    const firstRowSecond = firstRowFirst?.next;
    const firstRowThird = firstRowSecond?.next;
    const secondRow = firstRow?.next;
    const secondRowFirst = secondRow?.firstChild;
    const secondRowSecond = secondRowFirst?.next;
    const secondRowThird = secondRowSecond?.next;

    const expectedWidths = [120, 60, 120, 60, 180, 60];
    const nodes = [
      firstRowFirst,
      firstRowSecond,
      firstRowThird,
      secondRowFirst,
      secondRowSecond,
      secondRowThird,
    ];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.clientWidth).toBe(expectedWidths[i]);
    }
  });

  it("margins, paddings, borders", () => {
    const root = fixtures.marginsAndPaddingsAndBorders();
    layout(root, lookups, new Vec2(1024, 768));
    layout(root, lookups, new Vec2(1024, 768));

    const expectedValues = [
      [new Vec2(0, 0), new Vec2(270, 120)],
      [new Vec2(20, 10), new Vec2(100, 100)],
      [new Vec2(30, 30), new Vec2(50, 50)],
      [new Vec2(170, 10), new Vec2(50, 50)],
    ];

    const box = root.firstChild;
    const first = box?.firstChild;
    const inFirst = first?.firstChild;
    const second = first?.next;
    const nodes = [box, first, inFirst, second];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.x).toBe(expectedValues[i]![0]?.x);
      expect(nodes[i]?._state.y).toBe(expectedValues[i]![0]?.y);
      expect(nodes[i]?._state.clientWidth).toBe(expectedValues[i]![1]?.x);
      expect(nodes[i]?._state.clientHeight).toBe(expectedValues[i]![1]?.y);
    }
  });

  it("left, top, right, bottom", () => {
    const root = fixtures.offsets();
    layout(root, lookups, new Vec2(1024, 768));
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
      expect(nodes[i]?._state.x).toBe(expectedPositions[i]?.x);
      expect(nodes[i]?._state.y).toBe(expectedPositions[i]?.y);
    }
  });

  it("percentage sizes and min/max", () => {
    const root = fixtures.percentageAndMinMaxSizes();
    layout(root, lookups, new Vec2(1024, 768));
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
      new Vec2(120, 150),
      new Vec2(120, 75),
      new Vec2(120, 150),
      new Vec2(40, 75),
      new Vec2(30, 30),
      new Vec2(40, 40),
      new Vec2(50, 50),
    ];

    const nodes = [passThrough, inside, innermost, first, minSize, maxSize, maxSizeSecond];

    for (let i = 0; i < nodes.length; i++) {
      expect(nodes[i]?._state.clientWidth).toBe(expectedSizes[i]?.x);
      expect(nodes[i]?._state.clientHeight).toBe(expectedSizes[i]?.y);
    }
  });

  it("display and overflow", () => {
    // TODO @tchayen: add after implemented.
  });

  it("zIndex", () => {
    // TODO @tchayen: add after implemented.
  });

  it("aspectRatio", () => {
    const root = fixtures.aspectRatio();
    layout(root, lookups, new Vec2(1024, 768));
    layout(root, lookups, new Vec2(1024, 768));

    const first = root.firstChild;
    const second = first?.next;
    const third = second?.next;
    const fourth = third?.next;
    const fifth = fourth?.next;

    const expectedSizes = [
      new Vec2(60, 34),
      new Vec2(72, 41),
      new Vec2(107, 60),
      new Vec2(128, 72),
      new Vec2(144, 81),
    ];

    const nodes = [first, second, third, fourth, fifth];

    for (let i = 0; i < nodes.length; i++) {
      const width = nodes[i]?._state.clientWidth ?? 0;
      const height = nodes[i]?._state.clientHeight ?? 0;

      expect(width / height).toBeCloseTo(1.77, 1);
      expect(width).toBe(expectedSizes[i]?.x);
      expect(height).toBe(expectedSizes[i]?.y);
    }
  });

  /**
   * ┌─────────────────────────────┐
   * │   ┌─────────────────────┐   │
   * │   │ ┌───┐  ┌───┐  ┌───┐ │   │
   * │   │X│0  │ Y│0  │ Z│0  │ │   │
   * │   │ └───┘  └───┘  └───┘ │   │
   * │   └─────────────────────┘   │
   * └─────────────────────────────┘
   */
  it("form UI", () => {
    const root = fixtures.formUI();
    layout(root, lookups, new Vec2(1024, 768));
    layout(root, lookups, new Vec2(1024, 768));

    const box = root.firstChild;
    expect(box?._state.x).toBe(25);
    expect(box?._state.y).toBe(125);

    const xLabel = getByTestId(root, "xLabel");
    expect(xLabel?._state.x).toBe(45);
    expect(xLabel?._state.y).toBe(145);

    const xValue = getByTestId(root, "xValue");
    expect(xValue?._state.x).toBe(72);
    expect(xValue?._state.y).toBe(145);
  });
});
