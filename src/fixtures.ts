import { Text } from "./layout/Text";
import { View } from "./layout/View";
import type { Lookups } from "./font/types";
import type { LayoutProps, TextStyleProps, ViewStyleProps } from "./layout/styling";
import {
  AlignContent,
  AlignItems,
  AlignSelf,
  FlexDirection,
  FlexWrap,
  JustifyContent,
  Overflow,
  Position,
  TextAlign,
} from "./layout/styling";
import { invariant } from "./utils/invariant";
import { Input } from "./widgets/Input";

let lookups: Lookups | null = null;

export function setLookups(l: Lookups) {
  lookups = l;
}

const colorCount = 10;
const startingOffset = 20;
const step = (100 - startingOffset) / (colorCount - 1);

const colors = Array.from({ length: colorCount }, (_, i) => {
  const value = Math.round(startingOffset + i * step);
  return `hsl(10, 78%, ${value}%)`;
});

const rootStyle = {
  backgroundColor: "#000",
  height: 300,
  overflow: Overflow.Hidden,
  width: 300,
} as ViewStyleProps;

export function flexValue() {
  const root = new View({ style: rootStyle, testID: "flexValue" });

  const row = new View({
    style: { flexDirection: FlexDirection.Row, marginLeft: 50, width: 250 },
  });
  root.add(row);
  const row0 = new View({ style: { backgroundColor: colors[1], flex: 0, height: 50 } });
  row.add(row0);
  const row1 = new View({ style: { backgroundColor: colors[2], flex: 1, height: 50 } });
  row.add(row1);
  const row2 = new View({ style: { backgroundColor: colors[3], flex: 2, height: 50 } });
  row.add(row2);
  const rowFixed = new View({ style: { backgroundColor: colors[4], height: 50, width: 50 } });
  row.add(rowFixed);

  const column = new View({
    style: { flex: 1, flexDirection: FlexDirection.Column },
    testID: "column",
  });
  root.add(column);
  const column0 = new View({ style: { backgroundColor: colors[5], flex: 0, width: 50 } });
  column.add(column0);
  const column1 = new View({ style: { backgroundColor: colors[6], flex: 1, width: 50 } });
  column.add(column1);
  const column2 = new View({ style: { backgroundColor: colors[7], flex: 2, width: 50 } });
  column.add(column2);
  const columnFixed = new View({
    style: { backgroundColor: colors[8], height: 50, width: 50 },
  });
  column.add(columnFixed);

  return root;
}

export function flexRowAndColumn() {
  const root = new View({ style: rootStyle });

  const rows = new View({
    style: {
      flexDirection: FlexDirection.Column,
      height: "50%",
      width: "100%",
    },
  });
  root.add(rows);

  function generateFlexRow(attribute: LayoutProps["justifyContent"]) {
    const firstStyle = {
      backgroundColor: colors[1],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: colors[2],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: colors[3],
      height: 25,
      width: 50,
    } as ViewStyleProps;
    const view = new View({
      style: {
        flexDirection: FlexDirection.Row,
        justifyContent: attribute,
        width: "100%",
      },
    });
    rows.add(view);
    view.add(new View({ style: firstStyle }));
    view.add(new View({ style: secondStyle }));
    view.add(new View({ style: thirdStyle }));
  }

  generateFlexRow(JustifyContent.Start);
  generateFlexRow(JustifyContent.End);
  generateFlexRow(JustifyContent.Center);
  generateFlexRow(JustifyContent.SpaceEvenly);
  generateFlexRow(JustifyContent.SpaceAround);
  generateFlexRow(JustifyContent.SpaceBetween);

  const columns = new View({
    style: {
      flexDirection: FlexDirection.Row,
      height: "50%",
      width: "100%",
    },
  });
  root.add(columns);

  function generateFlexColumn(attribute: LayoutProps["justifyContent"]) {
    const firstStyle = {
      backgroundColor: colors[1],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: colors[2],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: colors[3],
      height: 25,
      width: 50,
    } as ViewStyleProps;
    const view = new View({
      style: {
        flexDirection: FlexDirection.Column,
        height: "100%",
        justifyContent: attribute,
      },
    });
    columns.add(view);
    view.add(new View({ style: firstStyle }));
    view.add(new View({ style: secondStyle }));
    view.add(new View({ style: thirdStyle }));
  }

  generateFlexColumn(JustifyContent.Start);
  generateFlexColumn(JustifyContent.End);
  generateFlexColumn(JustifyContent.Center);
  generateFlexColumn(JustifyContent.SpaceEvenly);
  generateFlexColumn(JustifyContent.SpaceAround);
  generateFlexColumn(JustifyContent.SpaceBetween);

  return root;
}

export function alignItemsAndSelf() {
  const root = new View({ style: rootStyle });

  const mainAxisValue = 26;
  const crossAxisValue = 48;

  const rows = new View({
    style: {
      flexDirection: FlexDirection.Row,
      height: 300 - mainAxisValue * 8,
      marginLeft: 300 - mainAxisValue * 8,
    },
    testID: "rows",
  });
  root.add(rows);

  function addRow(
    alignItems: LayoutProps["alignItems"],
    last?: Partial<LayoutProps>,
    all?: Partial<LayoutProps>,
  ) {
    const firstStyle = {
      backgroundColor: colors[1],
      height: crossAxisValue,
      width: mainAxisValue,
    } as ViewStyleProps;
    const secondStyle = {
      backgroundColor: colors[2],
      height: crossAxisValue,
      width: mainAxisValue,
    } as ViewStyleProps;

    const row = new View({
      style: {
        alignItems,
        flexDirection: FlexDirection.Row,
        height: "100%",
      },
      testID: "row",
    });
    rows.add(row);

    const first = new View({ style: { ...firstStyle, ...all } });
    row.add(first);
    const second = new View({ style: { ...secondStyle, ...all, ...last } });
    row.add(second);
  }

  addRow(AlignItems.Start, { alignSelf: AlignSelf.Center });
  addRow(AlignItems.End, { alignSelf: AlignSelf.Start });
  addRow(AlignItems.Center, { alignSelf: AlignSelf.Stretch, height: undefined });
  addRow(
    AlignItems.Stretch,
    { alignSelf: AlignSelf.End, height: crossAxisValue },
    { height: undefined },
  );

  const columns = new View({
    style: {
      flexDirection: FlexDirection.Column,
      width: 300 - mainAxisValue * 8,
    },
    testID: "columns",
  });
  root.add(columns);

  function addColumn(
    alignItems: LayoutProps["alignItems"],
    last?: Partial<LayoutProps>,
    all?: Partial<LayoutProps>,
  ) {
    const firstStyle = {
      backgroundColor: colors[1],
      height: mainAxisValue,
      width: crossAxisValue,
    } as ViewStyleProps;
    const secondStyle = {
      backgroundColor: colors[2],
      height: mainAxisValue,
      width: crossAxisValue,
    } as ViewStyleProps;

    const column = new View({
      style: {
        alignItems,
        flexDirection: FlexDirection.Column,
        width: "100%",
      },
      testID: "column",
    });
    columns.add(column);

    const first = new View({ style: { ...firstStyle, ...all } });
    column.add(first);
    const second = new View({ style: { ...secondStyle, ...all, ...last } });
    column.add(second);
  }

  addColumn(AlignItems.Start, { alignSelf: AlignSelf.Center });
  addColumn(AlignItems.End, { alignSelf: AlignSelf.Start });
  addColumn(AlignItems.Center, { alignSelf: AlignSelf.Stretch, width: undefined });
  addColumn(
    AlignItems.Stretch,
    { alignSelf: AlignSelf.End, width: crossAxisValue },
    { width: undefined },
  );

  return root;
}

export function flexDirectionReverse() {
  const root = new View({ style: rootStyle });

  const rows = new View({
    style: {
      flexDirection: FlexDirection.Column,
      height: "50%",
      width: "100%",
    },
  });
  root.add(rows);

  function generateFlexRow(attribute: LayoutProps["justifyContent"]) {
    const firstStyle = {
      backgroundColor: colors[1],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: colors[2],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: colors[3],
      height: 25,
      width: 50,
    } as ViewStyleProps;
    const view = new View({
      style: {
        flexDirection: FlexDirection.RowReverse,
        justifyContent: attribute,
        width: "100%",
      },
    });
    rows.add(view);
    view.add(new View({ style: firstStyle }));
    view.add(new View({ style: secondStyle }));
    view.add(new View({ style: thirdStyle }));
  }

  generateFlexRow(JustifyContent.Start);
  generateFlexRow(JustifyContent.End);
  generateFlexRow(JustifyContent.Center);
  generateFlexRow(JustifyContent.SpaceEvenly);
  generateFlexRow(JustifyContent.SpaceAround);
  generateFlexRow(JustifyContent.SpaceBetween);

  const columns = new View({
    style: {
      flexDirection: FlexDirection.Row,
      height: "50%",
      width: "100%",
    },
  });
  root.add(columns);

  function generateFlexColumn(attribute: LayoutProps["justifyContent"]) {
    const firstStyle = {
      backgroundColor: colors[1],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: colors[2],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: colors[3],
      height: 25,
      width: 50,
    } as ViewStyleProps;
    const view = new View({
      style: {
        flexDirection: FlexDirection.ColumnReverse,
        height: "100%",
        justifyContent: attribute,
      },
    });
    columns.add(view);
    view.add(new View({ style: firstStyle }));
    view.add(new View({ style: secondStyle }));
    view.add(new View({ style: thirdStyle }));
  }

  generateFlexColumn(JustifyContent.Start);
  generateFlexColumn(JustifyContent.End);
  generateFlexColumn(JustifyContent.Center);
  generateFlexColumn(JustifyContent.SpaceEvenly);
  generateFlexColumn(JustifyContent.SpaceAround);
  generateFlexColumn(JustifyContent.SpaceBetween);

  return root;
}

export function flexWrapRow() {
  const root = new View({ style: rootStyle });

  function box(
    backgroundColor: string | undefined,
    width: number,
    height: number,
    style?: Partial<ViewStyleProps>,
  ) {
    return new View({ style: { backgroundColor, height, width, ...style } });
  }

  const row = new View({
    style: {
      alignItems: AlignItems.Center,
      backgroundColor: colors[0],
      columnGap: 5,
      flexDirection: FlexDirection.Row,
      flexWrap: FlexWrap.Wrap,
      justifyContent: JustifyContent.Start,
      paddingVertical: 10,
      rowGap: 10,
      width: "100%",
    },
    testID: "row-wrap",
  });
  root.add(row);
  row.add(box(colors[1], 60, 25));
  row.add(box(colors[2], 40, 33));
  row.add(box(colors[3], 70, 25, { marginLeft: 11 }));
  row.add(box(colors[4], 90, 41, { marginLeft: 8 }));
  row.add(box(colors[5], 210, 19));

  return root;
}

export function flexWrapColumn() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      overflow: Overflow.Hidden,
      width: 300,
    },
  });

  function box(
    backgroundColor: string,
    width: number,
    height: number,
    style?: Partial<ViewStyleProps>,
  ) {
    return new View({ style: { backgroundColor, height, width, ...style } });
  }

  const column = new View({
    style: {
      alignItems: AlignItems.End,
      backgroundColor: colors[0],
      columnGap: 10,
      flexDirection: FlexDirection.Column,
      flexWrap: FlexWrap.WrapReverse,
      height: "100%",
      paddingHorizontal: 10,
      rowGap: 5,
    },
    testID: "column-wrap",
  });
  root.add(column);
  column.add(box(colors[1]!, 25, 60));
  column.add(box(colors[2]!, 33, 40));
  column.add(box(colors[3]!, 25, 70, { marginTop: 11 }));
  column.add(box(colors[4]!, 41, 90, { marginTop: 8 }));
  column.add(box(colors[5]!, 19, 210));

  return root;
}

export function alignContent() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      flexWrap: FlexWrap.Wrap,
      height: 300,
      overflow: Overflow.Hidden,
      width: 300,
    },
  });

  function container(
    backgroundColor: string | undefined,
    alignContent: LayoutProps["alignContent"],
  ) {
    const c = new View({
      style: {
        alignContent,
        backgroundColor,
        flexDirection: FlexDirection.Row,
        flexWrap: FlexWrap.Wrap,
        height: 75,
        width: 150,
      },
      testID: "alignContent",
    });
    root.add(c);
    c.add(box(colors[3], 40, 20));
    c.add(box(colors[4], 40, 20));
    c.add(box(colors[3], 40, 20));
    c.add(box(colors[4], 40, 20));
    c.add(box(colors[3], 40, 20));
  }

  function box(
    backgroundColor: string | undefined,
    width: number,
    height: number,
    style?: Partial<ViewStyleProps>,
  ) {
    return new View({ style: { backgroundColor, height, width, ...style } });
  }

  container(colors[0], AlignContent.Start);
  container(colors[1], AlignContent.Center);
  container(colors[0], AlignContent.End);
  container(colors[1], AlignContent.SpaceBetween);

  container(colors[1], AlignContent.SpaceAround);
  container(colors[0], AlignContent.SpaceEvenly);
  container(colors[1], AlignContent.Stretch);

  return root;
}

export function flexShrinkAndGrow() {
  const root = new View({ style: rootStyle, testID: "shrink" });

  function row(testID?: string) {
    return new View({ style: { flexDirection: FlexDirection.Row, width: "100%" }, testID });
  }

  function box(
    backgroundColor: string | undefined,
    width: number,
    height: number,
    style?: Partial<ViewStyleProps>,
  ) {
    return new View({ style: { backgroundColor, height, width, ...style } });
  }

  const first = row();
  root.add(first);
  first.add(box(colors[0], 120, 100, { flexShrink: 0 }));
  first.add(box(colors[1], 120, 100, { flexShrink: 1 }));
  first.add(box(colors[2], 120, 100, { flexShrink: 0 }));

  const second = row();
  root.add(second);
  second.add(box(colors[3], 60, 100));
  second.add(box(colors[4], 120, 100, { flexGrow: 1 }));
  second.add(box(colors[5], 20, 100, { flexBasis: 60 }));

  return root;
}

export function marginsAndPaddingsAndBorders() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      overflow: Overflow.Hidden,
      width: 300,
    },
  });

  const box = new View({
    style: {
      backgroundColor: colors[0],
      flexDirection: FlexDirection.Row,
      padding: 10,
    },
  });
  root.add(box);

  const first = new View({
    style: {
      backgroundColor: colors[1],
      borderColor: colors[5],
      borderWidth: 4,
      height: 100,
      marginLeft: 10,
      marginRight: 20,
      padding: 10,
      width: 100,
    },
  });
  box.add(first);

  const inFirst = new View({
    style: {
      backgroundColor: colors[3],
      height: 50,
      marginTop: 10,
      width: 50,
    },
  });
  first.add(inFirst);

  const second = new View({
    style: {
      backgroundColor: colors[4],
      height: 50,
      marginLeft: 30,
      marginRight: 40,
      width: 50,
    },
  });
  box.add(second);

  return root;
}

export function offsets() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      overflow: Overflow.Hidden,
      width: 300,
    },
  });

  const topLeft = new View({
    style: {
      backgroundColor: colors[0],
      height: 50,
      left: 30,
      top: 30,
      width: 50,
    },
  });
  root.add(topLeft);

  const bottomRight = new View({
    style: {
      backgroundColor: colors[1],
      bottom: 30,
      height: 50,
      right: -60,
      width: 50,
    },
  });
  root.add(bottomRight);

  const stretched = new View({
    style: {
      backgroundColor: colors[2],
      height: 50,
      left: 50,
      right: 50,
    },
  });
  root.add(stretched);

  const bottom = new View({
    style: {
      backgroundColor: colors[3],
      bottom: 30,
      height: 50,
      width: 50,
    },
  });
  root.add(bottom);

  const box = new View({
    style: {
      backgroundColor: colors[4],
      flexDirection: FlexDirection.Row,
      height: 100,
      width: 120,
    },
  });
  root.add(box);

  const small = new View({
    style: {
      backgroundColor: colors[5],
      height: 50,
      width: 50,
    },
  });
  box.add(small);
  const small2 = new View({
    style: {
      backgroundColor: colors[6],
      height: 50,
      width: 50,
    },
  });
  box.add(small2);

  const absolute1 = new View({
    style: {
      backgroundColor: colors[7],
      bottom: 40,
      position: Position.Absolute,
      right: 0,
      top: 30,
      width: 50,
    },
  });
  box.add(absolute1);

  const absolute2 = new View({
    style: {
      backgroundColor: colors[8],
      bottom: 30,
      height: 50,
      left: 10,
      position: Position.Absolute,
      width: 50,
    },
  });
  box.add(absolute2);

  return root;
}

export function percentageAndMinMaxSizes() {
  const root = new View({ style: rootStyle });

  const passThrough = new View({
    style: { backgroundColor: colors[0] },
    testID: "passThrough",
  });
  root.add(passThrough);
  const inside = new View({
    style: {
      backgroundColor: colors[1],
      flexDirection: FlexDirection.Row,
      height: "50%",
    },
    testID: "inside",
  });
  passThrough.add(inside);
  const innermost = new View({
    style: {
      backgroundColor: colors[2],
      flexDirection: FlexDirection.Row,
      height: "100%",
    },
    testID: "innermost",
  });
  inside.add(innermost);

  const first = new View({
    style: {
      backgroundColor: colors[3],
      height: "50%",
      width: 40,
    },
    testID: "first",
  });
  innermost.add(first);
  const second = new View({
    style: {
      backgroundColor: colors[4],
      height: "50%",
      width: 40,
    },
  });
  innermost.add(second);
  const third = new View({
    style: {
      backgroundColor: colors[5],
      height: "50%",
      width: 40,
    },
  });
  innermost.add(third);

  const minSize = new View({
    style: {
      backgroundColor: colors[6],
      minHeight: 30,
      minWidth: 30,
    },
    testID: "minSize",
  });
  root.add(minSize);
  const maxSize = new View({
    style: {
      backgroundColor: colors[7],
      flexDirection: FlexDirection.Row,
      maxHeight: 40,
      maxWidth: 40,
    },
    testID: "maxSize",
  });
  root.add(maxSize);

  const maxSizeFirst = new View({
    style: {
      backgroundColor: colors[8],
      flex: 1,
      height: 50,
      width: 50,
    },
    testID: "maxSizeFirst",
  });
  maxSize.add(maxSizeFirst);
  const maxSizeSecond = new View({
    style: {
      backgroundColor: colors[9],
      height: 50,
      width: 50,
    },
    testID: "maxSizeSecond",
  });
  maxSize.add(maxSizeSecond);

  return root;
}

export function overflow() {
  const root = new View({ style: rootStyle });

  return root;
}

export function displayAndOverflow() {
  const root = new View({ style: { ...rootStyle } });

  const overflow = new View({
    style: {
      backgroundColor: colors[0],
      height: 300,
      overflow: Overflow.Scroll,
      width: "100%",
    },
    testID: "D-overflow",
  });

  const tooTall = new View({
    style: {
      backgroundColor: colors[1],
      borderRadius: 20,
      overflow: Overflow.Scroll,
      width: 180,
    },
    testID: "D-tooTall",
  });
  overflow.add(tooTall);
  for (let i = 0; i < 6; i++) {
    tooTall.add(
      new View({
        style: { backgroundColor: colors[i + 2], height: 60, width: 180 - i * 20 },
        testID: `D-${i}`,
      }),
    );
  }

  root.add(overflow);

  return root;
}

export function zIndex() {
  const root = new View({ style: rootStyle });

  const left = new View({
    style: {
      backgroundColor: colors[0],
      height: 50,
      width: 100,
      zIndex: 1,
    },
  });
  root.add(left);

  const leftChild = new View({
    style: {
      backgroundColor: colors[1],
      height: 100,
      left: 20,
      top: 20,
      width: 100,
      zIndex: 5,
    },
  });
  left.add(leftChild);

  const right = new View({
    style: {
      backgroundColor: colors[2],
      height: 100,
      width: 100,
      zIndex: 2,
    },
  });
  root.add(right);

  return root;
}

export function text() {
  const root = new View({ style: { ...rootStyle } });

  function text(value: string, style?: Partial<TextStyleProps>) {
    invariant(lookups, "Lookups must be set.");
    root.add(
      new Text(value, {
        lookups,
        style: { color: "#fff", fontName: "Inter", fontSize: 16, ...style },
      }),
    );
  }

  text(
    "Some multiline text that will be wrapped when it runs out of space and it also follows the defined line height.",
  );
  text("This is right aligned text.", { textAlign: TextAlign.Right });
  text("This is centered.", { textAlign: TextAlign.Center });

  return root;
}

export function formUI() {
  invariant(lookups, "Lookups must be set.");

  const inputGroupStyle = {
    alignItems: AlignItems.Center,
    flexDirection: FlexDirection.Row,
    gap: 10,
  } as ViewStyleProps;

  const inputStyle = {
    backgroundColor: "#444",
    borderColor: "#666",
    borderRadius: 6,
    borderWidth: 1,
    height: 30,
    justifyContent: JustifyContent.Center,
    paddingHorizontal: 10,
    width: 44,
  } as ViewStyleProps;

  const textStyle = {
    color: "#fff",
    fontName: "Inter",
    fontSize: 14,
  } as TextStyleProps;

  const root = new View({
    style: {
      alignItems: AlignItems.Center,
      backgroundColor: "#000",
      height: 300,
      justifyContent: JustifyContent.Center,
      overflow: Overflow.Hidden,
      width: 300,
    },
    testID: "formUI root",
  });

  const inner = new View({
    style: {
      alignSelf: AlignSelf.Center,
      backgroundColor: "#222",
      flexDirection: FlexDirection.Row,
      gap: 20,
      justifyContent: JustifyContent.Center,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    testID: "inner",
  });
  root.add(inner);

  const xInputSection = new View({ style: inputGroupStyle });
  inner.add(xInputSection);
  const x = new Text("X", { lookups, style: textStyle, testID: "xLabel" });
  xInputSection.add(x);
  const xInput = new View({ style: inputStyle });
  xInputSection.add(xInput);
  const xValue = new Text("1", { lookups, style: textStyle, testID: "xValue" });
  xInput.add(xValue);

  const yInputSection = new View({ style: inputGroupStyle });
  inner.add(yInputSection);
  const y = new Text("Y", { lookups, style: textStyle, testID: "yLabel" });
  yInputSection.add(y);
  const yInput = new View({ style: inputStyle });
  yInputSection.add(yInput);
  const yValue = new Text("2", { lookups, style: textStyle, testID: "yValue" });
  yInput.add(yValue);

  const zInputSection = new View({ style: inputGroupStyle });
  inner.add(zInputSection);
  const z = new Text("Z", { lookups, style: textStyle, testID: "zLabel" });
  zInputSection.add(z);
  const zInput = new View({ style: inputStyle });
  zInputSection.add(zInput);
  const zValue = new Text("3.4", { lookups, style: textStyle, testID: "zValue" });
  zInput.add(zValue);

  return root;
}

export function interactiveButton() {
  invariant(lookups, "Lookups must be set.");

  const root = new View({
    style: {
      alignItems: AlignItems.Center,
      backgroundColor: "#000",
      gap: 20,
      height: 300,
      justifyContent: JustifyContent.Center,
      overflow: Overflow.Hidden,
      width: 300,
    },
  });

  const button = new View({
    onClick: () => {
      window.alert("Clicked!");
    },
    style: {
      backgroundColor: "#fff",
      borderRadius: 6,
      height: 28,
      justifyContent: JustifyContent.Center,
      paddingHorizontal: 16,
    },
    testID: "button",
  });
  root.add(button);
  button.add(
    new Text("Accept", { lookups, style: { color: "#000", fontName: "InterBold", fontSize: 15 } }),
  );

  const input = new Input({
    onKeyDown: (event) => {
      //
    },
    placeholder: "Type here...",
    style: {
      backgroundColor: "#eee",
      borderRadius: 6,
      height: 28,
      justifyContent: JustifyContent.Center,
      paddingHorizontal: 16,
    },
  });
  root.add(input);

  return root;
}

export function tryingToBreakThings() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      overflow: Overflow.Hidden,
      width: 300,
    },
  });

  const row = new View({
    style: {
      backgroundColor: colors[0],
      flexDirection: FlexDirection.Row,
      height: 100,
      width: "100%",
    },
  });
  root.add(row);

  const first = new View({
    style: {
      backgroundColor: colors[1],
      flex: 1,
      height: 50,
      maxWidth: 50,
    },
  });
  row.add(first);

  return root;
}

export function aspectRatio() {
  const root = new View({ style: rootStyle });

  const first = new View({
    style: {
      aspectRatio: 16 / 9,
      backgroundColor: colors[0],
      width: 60,
    },
  });
  root.add(first);
  const second = new View({
    style: {
      aspectRatio: 16 / 9,
      backgroundColor: colors[1],
      minWidth: 72,
      width: 40,
    },
  });
  root.add(second);
  const third = new View({
    style: {
      aspectRatio: 16 / 9,
      backgroundColor: colors[2],
      height: 60,
      width: 60,
    },
  });
  root.add(third);
  const fourth = new View({
    style: {
      aspectRatio: 16 / 9,
      backgroundColor: colors[3],
      minHeight: 72,
    },
  });
  root.add(fourth);
  const fifth = new View({
    style: {
      aspectRatio: 16 / 9,
      backgroundColor: colors[4],
      minHeight: 72,
      minWidth: 144,
    },
  });
  root.add(fifth);

  return root;
}
