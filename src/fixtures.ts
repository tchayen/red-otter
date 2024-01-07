/* eslint-disable no-inner-declarations */
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
import { Button } from "./widgets/Button";

let lookups: Lookups | null = null;

export function setLookups(l: Lookups) {
  lookups = l;
}

const colorCount = 10;
const startingOffset = 20;
const step = (100 - startingOffset) / (colorCount - 1);

const orange = Array.from({ length: colorCount }, (_, i) => {
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
  const row0 = new View({ style: { backgroundColor: orange[1], flex: 0, height: 50 } });
  row.add(row0);
  const row1 = new View({ style: { backgroundColor: orange[2], flex: 1, height: 50 } });
  row.add(row1);
  const row2 = new View({ style: { backgroundColor: orange[3], flex: 2, height: 50 } });
  row.add(row2);
  const rowFixed = new View({ style: { backgroundColor: orange[4], height: 50, width: 50 } });
  row.add(rowFixed);

  const column = new View({
    style: { flex: 1, flexDirection: FlexDirection.Column },
    testID: "column",
  });
  root.add(column);
  const column0 = new View({ style: { backgroundColor: orange[5], flex: 0, width: 50 } });
  column.add(column0);
  const column1 = new View({ style: { backgroundColor: orange[6], flex: 1, width: 50 } });
  column.add(column1);
  const column2 = new View({ style: { backgroundColor: orange[7], flex: 2, width: 50 } });
  column.add(column2);
  const columnFixed = new View({
    style: { backgroundColor: orange[8], height: 50, width: 50 },
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
      backgroundColor: orange[1],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: orange[2],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: orange[3],
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
      backgroundColor: orange[1],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: orange[2],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: orange[3],
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
      backgroundColor: orange[1],
      height: crossAxisValue,
      width: mainAxisValue,
    } as ViewStyleProps;
    const secondStyle = {
      backgroundColor: orange[2],
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
      backgroundColor: orange[1],
      height: mainAxisValue,
      width: crossAxisValue,
    } as ViewStyleProps;
    const secondStyle = {
      backgroundColor: orange[2],
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
      backgroundColor: orange[1],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: orange[2],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: orange[3],
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
      backgroundColor: orange[1],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: orange[2],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: orange[3],
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
      backgroundColor: orange[0],
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
  row.add(box(orange[1], 60, 25));
  row.add(box(orange[2], 40, 33));
  row.add(box(orange[3], 70, 25, { marginLeft: 11 }));
  row.add(box(orange[4], 90, 41, { marginLeft: 8 }));
  row.add(box(orange[5], 210, 19));

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
      backgroundColor: orange[0],
      columnGap: 10,
      flexDirection: FlexDirection.Column,
      flexWrap: FlexWrap.WrapReverse,
      height: "100%",
      paddingHorizontal: 10,
      paddingVertical: 15,
      rowGap: 5,
    },
    testID: "column-wrap",
  });
  root.add(column);
  column.add(box(orange[1]!, 25, 60));
  column.add(box(orange[2]!, 33, 40));
  column.add(box(orange[3]!, 25, 70, { marginTop: 11 }));
  column.add(box(orange[4]!, 41, 90, { marginTop: 8 }));
  column.add(box(orange[5]!, 19, 210));

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
    c.add(box(orange[3], 40, 20));
    c.add(box(orange[4], 40, 20));
    c.add(box(orange[3], 40, 20));
    c.add(box(orange[4], 40, 20));
    c.add(box(orange[3], 40, 20));
  }

  function box(
    backgroundColor: string | undefined,
    width: number,
    height: number,
    style?: Partial<ViewStyleProps>,
  ) {
    return new View({ style: { backgroundColor, height, width, ...style } });
  }

  container(orange[0], AlignContent.Start);
  container(orange[1], AlignContent.Center);
  container(orange[0], AlignContent.End);
  container(orange[1], AlignContent.SpaceBetween);

  container(orange[1], AlignContent.SpaceAround);
  container(orange[0], AlignContent.SpaceEvenly);
  container(orange[1], AlignContent.Stretch);

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
  first.add(box(orange[0], 120, 100, { flexShrink: 0 }));
  first.add(box(orange[1], 120, 100, { flexShrink: 1 }));
  first.add(box(orange[2], 120, 100, { flexShrink: 0 }));

  const second = row();
  root.add(second);
  second.add(box(orange[3], 60, 100));
  second.add(box(orange[4], 120, 100, { flexGrow: 1 }));
  second.add(box(orange[5], 20, 100, { flexBasis: 60 }));

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
      backgroundColor: orange[0],
      flexDirection: FlexDirection.Row,
      padding: 10,
    },
  });
  root.add(box);

  const first = new View({
    style: {
      backgroundColor: orange[1],
      borderColor: orange[5],
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
      backgroundColor: orange[3],
      height: 50,
      marginTop: 10,
      width: 50,
    },
  });
  first.add(inFirst);

  const second = new View({
    style: {
      backgroundColor: orange[4],
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
      backgroundColor: orange[0],
      height: 50,
      left: 30,
      top: 30,
      width: 50,
    },
  });
  root.add(topLeft);

  const bottomRight = new View({
    style: {
      backgroundColor: orange[1],
      bottom: 30,
      height: 50,
      right: -60,
      width: 50,
    },
  });
  root.add(bottomRight);

  const stretched = new View({
    style: {
      backgroundColor: orange[2],
      height: 50,
      left: 50,
      right: 50,
    },
  });
  root.add(stretched);

  const bottom = new View({
    style: {
      backgroundColor: orange[3],
      bottom: 30,
      height: 50,
      width: 50,
    },
  });
  root.add(bottom);

  const box = new View({
    style: {
      backgroundColor: orange[4],
      flexDirection: FlexDirection.Row,
      height: 100,
      width: 120,
    },
  });
  root.add(box);

  const small = new View({
    style: {
      backgroundColor: orange[5],
      height: 50,
      width: 50,
    },
  });
  box.add(small);
  const small2 = new View({
    style: {
      backgroundColor: orange[6],
      height: 50,
      width: 50,
    },
  });
  box.add(small2);

  const absolute1 = new View({
    style: {
      backgroundColor: orange[7],
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
      backgroundColor: orange[8],
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
    style: { backgroundColor: orange[0] },
    testID: "passThrough",
  });
  root.add(passThrough);
  const inside = new View({
    style: {
      backgroundColor: orange[1],
      flexDirection: FlexDirection.Row,
      height: "50%",
    },
    testID: "inside",
  });
  passThrough.add(inside);
  const innermost = new View({
    style: {
      backgroundColor: orange[2],
      flexDirection: FlexDirection.Row,
      height: "100%",
    },
    testID: "innermost",
  });
  inside.add(innermost);

  const first = new View({
    style: {
      backgroundColor: orange[3],
      height: "50%",
      width: 40,
    },
    testID: "first",
  });
  innermost.add(first);
  const second = new View({
    style: {
      backgroundColor: orange[4],
      height: "50%",
      width: 40,
    },
  });
  innermost.add(second);
  const third = new View({
    style: {
      backgroundColor: orange[5],
      height: "50%",
      width: 40,
    },
  });
  innermost.add(third);

  const minSize = new View({
    style: {
      backgroundColor: orange[6],
      minHeight: 30,
      minWidth: 30,
    },
    testID: "minSize",
  });
  root.add(minSize);
  const maxSize = new View({
    style: {
      backgroundColor: orange[7],
      flexDirection: FlexDirection.Row,
      maxHeight: 40,
      maxWidth: 40,
    },
    testID: "maxSize",
  });
  root.add(maxSize);

  const maxSizeFirst = new View({
    style: {
      backgroundColor: orange[8],
      flex: 1,
      height: 50,
      width: 50,
    },
    testID: "maxSizeFirst",
  });
  maxSize.add(maxSizeFirst);
  const maxSizeSecond = new View({
    style: {
      backgroundColor: orange[9],
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
      backgroundColor: orange[0],
      height: 300,
      overflow: Overflow.Scroll,
      width: "100%",
    },
    testID: "D-outer",
  });

  const tooTall = new View({
    style: {
      backgroundColor: orange[1],
      overflow: Overflow.Scroll,
      width: 180,
    },
    testID: "D-halfWidth",
  });
  overflow.add(tooTall);
  for (let i = 0; i < 6; i++) {
    tooTall.add(
      new View({
        style: { backgroundColor: orange[i + 2], height: 60, width: 180 - i * 20 },
        testID: `D-inside-${i}`,
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
      backgroundColor: orange[0],
      height: 50,
      width: 100,
      zIndex: 1,
    },
  });
  root.add(left);

  const leftChild = new View({
    style: {
      backgroundColor: orange[1],
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
      backgroundColor: orange[2],
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
      backgroundColor: "#111",
      gap: 12,
      height: 300,
      justifyContent: JustifyContent.Center,
      overflow: Overflow.Hidden,
      width: 300,
    },
  });

  const button = new Button({
    label: "Confirm",
    lookups,
    onClick: () => {
      console.log("Clicked!");
    },
    style: {
      backgroundColor: "#2870BD",
      height: 40,
      justifyContent: JustifyContent.Center,
      paddingHorizontal: 12,
    },
    testID: "button",
  });
  root.add(button);

  const input = new Input({
    lookups,
    onChange: (value) => {
      console.log("Input value changed to", value);
    },
    placeholder: "Type here...",
    style: {
      backgroundColor: "#333",
      height: 40,
      justifyContent: JustifyContent.Center,
      paddingHorizontal: 0,
      paddingLeft: 10,
    },
  });
  root.add(input);

  const secondInput = new Input({
    lookups,
    onChange: (value) => {
      console.log("Input value changed to", value);
    },
    placeholder: "Type here...",
    style: {
      backgroundColor: "#333",
      height: 40,
      justifyContent: JustifyContent.Center,
      paddingHorizontal: 0,
      paddingLeft: 10,
    },
  });
  root.add(secondInput);

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
      backgroundColor: orange[0],
      flexDirection: FlexDirection.Row,
      height: 100,
      width: "100%",
    },
  });
  root.add(row);

  const first = new View({
    style: {
      backgroundColor: orange[1],
      flex: 1,
      height: 50,
      maxWidth: 50,
    },
  });
  row.add(first);

  return root;
}

export function paddingInAlignSelf() {
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
      backgroundColor: orange[0],
      height: 100,
      padding: 10,
      width: "100%",
    },
  });
  root.add(row);

  const first = new View({
    style: {
      alignSelf: AlignSelf.Stretch,
      backgroundColor: orange[3],
      height: 50,
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
      backgroundColor: orange[0],
      width: 60,
    },
  });
  root.add(first);
  const second = new View({
    style: {
      aspectRatio: 16 / 9,
      backgroundColor: orange[1],
      minWidth: 72,
      width: 40,
    },
  });
  root.add(second);
  const third = new View({
    style: {
      aspectRatio: 16 / 9,
      backgroundColor: orange[2],
      height: 60,
      width: 60,
    },
  });
  root.add(third);
  const fourth = new View({
    style: {
      aspectRatio: 16 / 9,
      backgroundColor: orange[3],
      minHeight: 72,
    },
  });
  root.add(fourth);
  const fifth = new View({
    style: {
      aspectRatio: 16 / 9,
      backgroundColor: orange[4],
      minHeight: 72,
      minWidth: 144,
    },
  });
  root.add(fifth);

  return root;
}

export function lobbyPicker() {
  invariant(lookups, "Lookups must be set.");

  const gray = [
    "#111111",
    "#191919",
    "#222222",
    "#2A2A2A",
    "#313131",
    "#3A3A3A",
    "#484848",
    "#606060",
    "#6E6E6E",
    "#7B7B7B",
    "#B4B4B4",
    "#EEEEEE",
  ] as const;

  const headerStyle = {
    color: gray[11],
    fontName: "Inter",
    fontSize: 20,
  } as TextStyleProps;
  const boxStyle = {
    backgroundColor: gray[2],
    borderColor: gray[4],
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 70,
    marginTop: 70,
  } as ViewStyleProps;
  const buttonRow = {
    alignSelf: AlignSelf.Stretch,
    flexDirection: FlexDirection.Row,
    gap: 12,
  } as ViewStyleProps;
  const buttonText = {
    fontName: "Inter",
    fontSize: 14,
  } as TextStyleProps;
  const secondaryButton = {
    backgroundColor: gray[6],
    borderColor: gray[7],
    borderRadius: 6,
    borderTopWidth: 1,
    height: 28,
    paddingHorizontal: 12,
    paddingTop: 7,
  } as ViewStyleProps;
  const primaryButton = {
    backgroundColor: "#2870BD",
    borderColor: "#0090FF",
    borderRadius: 6,
    borderTopWidth: 1,
    height: 28,
    paddingHorizontal: 12,
    paddingTop: 7,
  } as ViewStyleProps;

  const root = new View({ style: { height: "100%", width: "100%" } });

  const pickerBox = new View({ style: { ...boxStyle, width: 600 } });
  const pickerHeader = new Text("Browse games", {
    lookups,
    style: { ...headerStyle },
  });
  const headerWrapper = new View({
    style: {
      alignItems: AlignItems.Center,
      alignSelf: AlignSelf.Stretch,
      flexDirection: FlexDirection.Row,
      gap: 8,
      padding: 20,
    },
  });
  const search = new Input({
    lookups,
    onBlur: () => {
      console.log("Lost focus");
    },
    onFocus: () => {
      console.log("Focused");
    },
    placeholder: "Search",
    style: {
      backgroundColor: gray[1],
      borderColor: gray[4],
      borderRadius: 6,
      borderWidth: 1,
      flex: 1,
      height: 28,
      justifyContent: JustifyContent.Center,
      paddingHorizontal: 10,
    },
  });
  headerWrapper.add(pickerHeader);
  headerWrapper.add(search);
  pickerBox.add(headerWrapper);

  const scrollArea = new View({
    style: {
      alignSelf: AlignSelf.Stretch,
      backgroundColor: gray[1],
      flexDirection: FlexDirection.Row,
      height: 240,
      overflowY: Overflow.Scroll,
    },
    testID: "scrollArea",
  });
  pickerBox.add(scrollArea);

  const columns = ["name", "players", "mode", "password"] as const;

  const list = [
    {
      mode: "FFA",
      name: "Random map",
      password: false,
      players: { current: 3, limit: 8 },
    },
    {
      mode: "FFA",
      name: "Black forest",
      password: false,
      players: { current: 3, limit: 8 },
    },
    {
      mode: "FFA",
      name: "Arabia",
      password: false,
      players: { current: 3, limit: 8 },
    },
    {
      mode: "2v2",
      name: "Danube River",
      password: false,
      players: { current: 2, limit: 4 },
    },
    {
      mode: "2v2v2v2",
      name: "Alaska",
      password: false,
      players: { current: 3, limit: 8 },
    },
    {
      mode: "1v1",
      name: "Amazon Tunnel",
      password: true,
      players: { current: 1, limit: 2 },
    },
    {
      mode: "1v1",
      name: "Random map",
      password: false,
      players: { current: 2, limit: 2 },
    },
    {
      mode: "1v1",
      name: "Random map",
      password: false,
      players: { current: 2, limit: 2 },
    },
    {
      mode: "1v1",
      name: "Amazon Tunnel",
      password: true,
      players: { current: 1, limit: 2 },
    },
    {
      mode: "1v1",
      name: "Random map",
      password: false,
      players: { current: 2, limit: 2 },
    },
  ];

  for (let i = 0; i < columns.length; i++) {
    const column = new View({
      style: { flex: 1 },
    });
    scrollArea.add(column);

    for (let j = 0; j < list.length; j++) {
      const item = list[j]![columns[i]!];

      const cell = new View({
        style: {
          alignSelf: AlignSelf.Stretch,
          backgroundColor: j % 2 === 0 ? "#111111" : "#191919",
          height: 28,
          justifyContent: JustifyContent.Center,
          paddingHorizontal: 12,
        },
      });
      column.add(cell);

      switch (columns[i]) {
        case "mode":
          cell.add(
            new Text(item as string, {
              lookups,
              style: { color: "#B4B4B4", fontName: "Inter", fontSize: 14 },
            }),
          );
          break;
        case "name":
          cell.add(
            new Text(item as string, {
              lookups,
              style: { color: "#B4B4B4", fontName: "Inter", fontSize: 14 },
            }),
          );
          break;
        case "password":
          cell.add(
            new Text(item ? "Yes" : "No", {
              lookups,
              style: { color: "#B4B4B4", fontName: "Inter", fontSize: 14 },
            }),
          );
          break;
        case "players":
          if (
            typeof item !== "boolean" &&
            typeof item !== "string" &&
            "current" in item &&
            "limit" in item
          ) {
            cell.add(
              new Text(`${item.current}/${item.limit}`, {
                lookups,
                style: { color: "#B4B4B4", fontName: "Inter", fontSize: 14 },
              }),
            );
          }
          break;
      }
    }
  }

  const pickerButtonRow = new View({
    style: {
      ...buttonRow,
      justifyContent: JustifyContent.End,
      padding: 20,
    },
  });
  pickerBox.add(pickerButtonRow);

  const pickerCancelButton = new Button({
    label: "Cancel",
    lookups,
    onClick: () => {
      //
    },
    style: secondaryButton,
    textStyle: buttonText,
  });
  pickerButtonRow.add(pickerCancelButton);

  const pickerSubmitButton = new Button({
    label: "Join",
    lookups,
    onClick: () => {
      //
    },
    style: primaryButton,
    textStyle: buttonText,
  });
  pickerButtonRow.add(pickerSubmitButton);

  root.add(pickerBox);

  return root;
}

export function monoFontForm() {
  invariant(lookups, "Lookups must be set.");
  const root = new View({ style: {} });

  const gray = [
    "#111111",
    "#191919",
    "#222222",
    "#2A2A2A",
    "#313131",
    "#3A3A3A",
    "#484848",
    "#606060",
    "#6E6E6E",
    "#7B7B7B",
    "#B4B4B4",
    "#EEEEEE",
  ] as const;

  {
    const tagStyle = {
      backgroundColor: "rgba(0, 255, 56, 0.45)",
      borderRadius: 10,
      paddingBottom: 6,
      paddingHorizontal: 8,
      paddingTop: 4,
    } as ViewStyleProps;
    const greenForm = new View({
      style: {
        backgroundColor: "#000",
        flexDirection: FlexDirection.Row,
        gap: 12,
        overflow: Overflow.Hidden,
        padding: 20,
      },
    });
    root.add(greenForm);

    const column = new View({
      style: {
        gap: 12,
        width: 265,
      },
    });
    greenForm.add(column);

    const input = new Input({
      cursorColor: "rgb(0, 255, 26)",
      lookups,
      placeholder: "Type here...",
      selectionColor: "rgba(0, 255, 26, 0.2)",
      style: {
        alignSelf: AlignSelf.Stretch,
        backgroundColor: "#000",
        borderColor: "#3A3A3A",
        borderRadius: 2,
        borderWidth: 2,
        height: 40,
        paddingHorizontal: 10,
      },
      textStyle: {
        fontName: "JetBrainsMono",
        fontSize: 16,
      },
    });
    column.add(input);

    const tagRow = new View({
      style: {
        alignSelf: AlignSelf.Stretch,
        flexDirection: FlexDirection.Row,
        flexWrap: FlexWrap.Wrap,
        gap: 8,
      },
    });
    column.add(tagRow);

    for (const value of ["Tag", "Another", "More", "@@@@", "Different"]) {
      const tag = new View({ style: tagStyle });
      tag.add(
        new Text(value, {
          lookups: lookups!,
          style: { color: "#fff", fontName: "JetBrainsMono", fontSize: 14 },
        }),
      );
      tagRow.add(tag);
    }

    const row = new View({
      style: {
        alignSelf: AlignSelf.Stretch,
        flexDirection: FlexDirection.Row,
        gap: 8,
        paddingBottom: 5,
      },
    });
    column.add(row);

    row.add(
      new Text("Want to start over?", {
        lookups,
        style: {
          color: "#fff",
          fontName: "JetBrainsMono",
          fontSize: 16,
        },
      }),
    );
    row.add(
      new Text("Reset", {
        lookups,
        style: { color: "#00FF1A", fontName: "JetBrainsMono", fontSize: 16 },
      }),
    );

    const button = new Button({
      label: "Submit",
      lookups,
      onClick: () => {
        //
      },
      style: {
        backgroundColor: "rgb(0, 255, 26)",
        borderRadius: 2,
        height: 40,
        paddingHorizontal: 12,
        paddingTop: 12,
      },
      textStyle: {
        color: "#000",
        fontName: "JetBrainsMono",
        fontSize: 18,
      },
    });
    greenForm.add(button);
  }

  {
    const categoryTextStyle = {
      color: gray[11],
      fontName: "Inter",
      fontSize: 14,
    } as TextStyleProps;
    const capsuleStyle = {
      alignItems: AlignItems.Center,
      backgroundColor: gray[5],
      borderRadius: 9,
      height: 18,
      justifyContent: JustifyContent.Center,
      paddingHorizontal: 6,
    } as ViewStyleProps;
    const capsuleTextStyle = {
      color: gray[10],
      fontName: "Inter",
      fontSize: 12,
    } as TextStyleProps;
    const optionRowStyle = {
      alignItems: AlignItems.Center,
      alignSelf: AlignSelf.Stretch,
      borderRadius: 4,
      flexDirection: FlexDirection.Row,
      height: 28,
      paddingHorizontal: 8,
    } as ViewStyleProps;

    const grayForm = new View({
      style: { backgroundColor: gray[1], padding: 40, paddingRight: 200 },
    });
    root.add(grayForm);

    const list = new View({
      style: {
        backgroundColor: gray[2],
        borderColor: gray[5],
        borderRadius: 8,
        borderWidth: 1,
        width: 265,
      },
    });
    grayForm.add(list);

    const listHeader = new View({
      style: {
        alignItems: AlignItems.Center,
        flexDirection: FlexDirection.Row,
        flexWrap: FlexWrap.Wrap,
        gap: 8,
        padding: 8,
      },
    });
    list.add(listHeader);

    for (const [name, value] of [
      ["All", 37],
      ["Controls", 2],
      ["Other", 11],
      ["Plugins", 8],
    ] as const) {
      const wrapper = new View({
        style: {
          alignItems: AlignItems.Center,
          flexDirection: FlexDirection.Row,
          gap: 4,
        },
      });
      const category = new Text(name, { lookups, style: categoryTextStyle });
      wrapper.add(category);
      const capsule = new View({ style: capsuleStyle });
      capsule.add(new Text(value.toString(), { lookups, style: capsuleTextStyle }));
      wrapper.add(capsule);
      listHeader.add(wrapper);
    }

    const options = new View({
      style: {
        alignSelf: AlignSelf.Stretch,
        backgroundColor: gray[2],
        borderBottomWidth: 1,
        borderColor: gray[5],
        borderTopWidth: 1,
        padding: 4,
      },
    });
    list.add(options);

    const selected = "Export";
    for (const option of ["New file", "Save", "Export", "Exit"]) {
      const optionRow = new View({
        style: {
          ...optionRowStyle,
          backgroundColor: selected === option ? "#2870BD" : "transparent",
          justifyContent: JustifyContent.SpaceBetween,
        },
      });
      options.add(optionRow);
      optionRow.add(
        new Text(option, {
          lookups,
          style: {
            color: selected === option ? "#fff" : gray[11],
            fontName: "Inter",
            fontSize: 16,
          },
        }),
      );

      if (option === "Export") {
        optionRow.add(
          new Text("▶", {
            lookups,
            style: {
              color: "#fff",
              fontName: "Inter",
              fontSize: 10,
            },
          }),
        );
      }
    }

    function addKey(parent: View, value: string) {
      invariant(lookups, "Lookups must be set.");

      const outer = new View({
        style: {
          backgroundColor: gray[5],
          borderColor: gray[6],
          borderRadius: 6,
          borderWidth: 1,
          height: 24,
        },
      });
      const inner = new View({
        style: {
          alignItems: AlignItems.Center,
          backgroundColor: gray[5],
          borderBottomWidth: 2,
          borderColor: gray[3],
          borderRadius: 4,
          height: 22,
          justifyContent: JustifyContent.Center,
          paddingHorizontal: 6,
        },
      });
      inner.add(
        new Text(value, {
          lookups,
          style: { color: gray[11], fontName: "InterBold", fontSize: 10 },
        }),
      );
      outer.add(inner);
      parent.add(outer);
    }

    const keybinds = new View({
      style: {
        alignItems: AlignItems.Center,
        alignSelf: AlignSelf.Stretch,
        flexDirection: FlexDirection.Row,
        gap: 8,
        justifyContent: JustifyContent.SpaceBetween,
        padding: 8,
      },
    });
    list.add(keybinds);

    const left = new View({
      style: {
        alignItems: AlignItems.Center,
        flexDirection: FlexDirection.Row,
        gap: 8,
      },
    });

    addKey(left, "W");
    addKey(left, "S");
    left.add(
      new Text("Navigate", {
        lookups,
        style: { color: gray[10], fontName: "Inter", fontSize: 14 },
      }),
    );

    const right = new View({
      style: {
        alignItems: AlignItems.Center,
        flexDirection: FlexDirection.Row,
        gap: 8,
      },
    });
    addKey(right, "ENTER");
    right.add(
      new Text("Select", { lookups, style: { color: gray[10], fontName: "Inter", fontSize: 14 } }),
    );

    keybinds.add(left);
    keybinds.add(right);

    const subList = new View({
      style: {
        backgroundColor: gray[2],
        borderColor: gray[5],
        borderRadius: 8,
        borderWidth: 1,
        left: 309,
        padding: 4,
        position: Position.Absolute,
        top: 129,
      },
    });
    grayForm.add(subList);

    for (const option of ["PNG", "SVG", "JSON"]) {
      const selected = "SVG";
      const optionRow = new View({
        style: {
          ...optionRowStyle,
          backgroundColor: selected === option ? "#2870BD" : "transparent",
        },
      });
      subList.add(optionRow);
      optionRow.add(
        new Text(option, {
          lookups,
          style: {
            color: selected === option ? "#fff" : gray[11],
            fontName: "Inter",
            fontSize: 16,
          },
        }),
      );
    }
  }

  {
    const headerStyle = {
      color: "#000",
      fontName: "InterBold",
      fontSize: 20,
    } as TextStyleProps;
    const descriptionStyle = {
      color: "#888",
      fontName: "Inter",
      fontSize: 14,
    } as TextStyleProps;
    const buttonRow = {
      alignSelf: AlignSelf.Stretch,
      flexDirection: FlexDirection.Row,
      gap: 12,
    } as ViewStyleProps;
    const buttonText = {
      fontName: "InterBold",
      fontSize: 14,
    } as TextStyleProps;
    const secondaryButton = {
      backgroundColor: "#CCC",
      borderBottomWidth: 1,
      borderColor: "#777",
      borderRadius: 6,
      height: 28,
      paddingHorizontal: 12,
      paddingTop: 7,
    } as ViewStyleProps;
    const primaryButton = {
      backgroundColor: "#2870BD",
      borderBottomWidth: 1,
      borderColor: "#104D87",
      borderRadius: 6,
      height: 28,
      paddingHorizontal: 12,
      paddingTop: 7,
    } as ViewStyleProps;

    const background = new View({ style: { backgroundColor: "#CCC", padding: 40 } });
    const pickerBox = new View({ style: { marginLeft: 20, width: 440 } });
    background.add(pickerBox);
    const headerWrapper = new View({
      style: {
        alignSelf: AlignSelf.Stretch,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderColor: "#CCC",
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        gap: 8,
        padding: 12,
      },
    });
    headerWrapper.add(new Text("Members", { lookups, style: { ...headerStyle } }));
    headerWrapper.add(
      new Text("Browse through members of your organization.", {
        lookups,
        style: descriptionStyle,
      }),
    );
    pickerBox.add(headerWrapper);

    const scrollArea = new View({
      style: {
        alignSelf: AlignSelf.Stretch,
        backgroundColor: "#FFF",
        flexDirection: FlexDirection.Row,
        height: 155,
        overflowY: Overflow.Scroll,
      },
      testID: "scrollArea",
    });
    pickerBox.add(scrollArea);

    const columns = ["email", "role", "joined"] as const;
    const list = [
      {
        email: "john@test.com",
        joined: "Today",
        role: "User",
      },
      {
        email: "mary@test.com",
        joined: "2023/12/10",
        role: "User",
      },
      {
        email: "philip@test.com",
        joined: "2023/07/04",
        role: "User",
      },
      {
        email: "tom@test.com",
        joined: "2018",
        role: "Admin",
      },
      {
        email: "_john@test.com",
        joined: "2014",
        role: "User",
      },
      {
        email: "test@test.com",
        joined: "1997",
        role: "User",
      },
    ];

    for (let i = 0; i < columns.length; i++) {
      const column = new View({
        style: { flex: 1 },
      });
      scrollArea.add(column);

      for (let j = 0; j < list.length; j++) {
        const item = list[j]![columns[i]!];

        const cell = new View({
          style: {
            alignSelf: AlignSelf.Stretch,
            backgroundColor: j % 2 === 0 ? "#EEE" : "#FFF",
            height: 28,
            justifyContent: JustifyContent.Center,
            paddingHorizontal: 12,
          },
        });
        column.add(cell);

        switch (columns[i]) {
          case "email":
            cell.add(
              new Text(item as string, {
                lookups,
                style: { color: "#000", fontName: "Inter", fontSize: 14 },
              }),
            );
            break;
          case "role":
            cell.add(
              new Text(item as string, {
                lookups,
                style: { color: "#000", fontName: "Inter", fontSize: 14 },
              }),
            );
            break;
          case "joined":
            cell.add(
              new Text(item as string, {
                lookups,
                style: { color: "#000", fontName: "Inter", fontSize: 14 },
              }),
            );
            break;
        }
      }
    }

    const pickerButtonRow = new View({
      style: {
        ...buttonRow,
        backgroundColor: "#FFF",
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        borderColor: "#CCC",
        borderTopWidth: 1,
        justifyContent: JustifyContent.End,
        padding: 12,
      },
    });
    pickerBox.add(pickerButtonRow);

    const pickerCloseButton = new Button({
      label: "Close",
      lookups,
      onClick: () => {
        //
      },
      style: secondaryButton,
      textStyle: { ...buttonText, color: "#000" },
    });
    pickerButtonRow.add(pickerCloseButton);

    const pickerSubmitButton = new Button({
      label: "Invite",
      lookups,
      onClick: () => {
        //
      },
      style: primaryButton,
      textStyle: buttonText,
    });
    pickerButtonRow.add(pickerSubmitButton);

    root.add(background);
  }

  return root;
}
