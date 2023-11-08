import { Text } from "./Text";
import { View } from "./View";
import { Lookups } from "./font/types";
import { LayoutProps, TextStyleProps, ViewStyleProps } from "./types";
import { invariant } from "./utils/invariant";

let lookups: Lookups | null = null;

export function setLookups(l: Lookups) {
  lookups = l;
}

const colorCount = 10;
const startingOffset = 20;
const step = (100 - startingOffset) / (colorCount - 1);

const colors = Array.from({ length: colorCount }, (_, i) => {
  const value = Math.round(startingOffset + i * step);
  return `hsl(220, 100%, ${value}%)`;
});

export function flexValue() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
    testID: "flexValue",
  });

  const row = new View({ style: { flexDirection: "row", marginLeft: 50, width: 250 } });
  root.add(row);
  const row0 = new View({ style: { backgroundColor: colors[1], flex: 0, height: 50 } });
  row.add(row0);
  const row1 = new View({ style: { backgroundColor: colors[2], flex: 1, height: 50 } });
  row.add(row1);
  const row2 = new View({ style: { backgroundColor: colors[3], flex: 2, height: 50 } });
  row.add(row2);
  const rowFixed = new View({ style: { backgroundColor: colors[4], height: 50, width: 50 } });
  row.add(rowFixed);

  const column = new View({ style: { flex: 1, flexDirection: "column" }, testID: "column" });
  root.add(column);
  const column0 = new View({ style: { backgroundColor: colors[5], flex: 0, width: 50 } });
  column.add(column0);
  const column1 = new View({ style: { backgroundColor: colors[6], flex: 1, width: 50 } });
  column.add(column1);
  const column2 = new View({ style: { backgroundColor: colors[7], flex: 2, width: 50 } });
  column.add(column2);
  const columnFixed = new View({ style: { backgroundColor: colors[8], height: 50, width: 50 } });
  column.add(columnFixed);

  return root;
}

export function flexRowAndColumn() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  const rows = new View({
    style: {
      flexDirection: "column",
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
        flexDirection: "row",
        justifyContent: attribute,
        width: "100%",
      },
    });
    rows.add(view);
    view.add(new View({ style: firstStyle }));
    view.add(new View({ style: secondStyle }));
    view.add(new View({ style: thirdStyle }));
  }

  generateFlexRow("flex-start");
  generateFlexRow("flex-end");
  generateFlexRow("center");
  generateFlexRow("space-evenly");
  generateFlexRow("space-around");
  generateFlexRow("space-between");

  const columns = new View({
    style: {
      flexDirection: "row",
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
        flexDirection: "column",
        height: "100%",
        justifyContent: attribute,
      },
    });
    columns.add(view);
    view.add(new View({ style: firstStyle }));
    view.add(new View({ style: secondStyle }));
    view.add(new View({ style: thirdStyle }));
  }

  generateFlexColumn("flex-start");
  generateFlexColumn("flex-end");
  generateFlexColumn("center");
  generateFlexColumn("space-evenly");
  generateFlexColumn("space-around");
  generateFlexColumn("space-between");

  return root;
}

export function alignItemsAndSelf() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      flexDirection: "column",
      height: 300,
      width: 300,
    },
  });

  const mainAxisValue = 26;
  const crossAxisValue = 48;

  const rows = new View({
    style: {
      flexDirection: "row",
      height: 300 - mainAxisValue * 8,
      marginLeft: 300 - mainAxisValue * 8,
    },
    testID: "rows",
  });
  root.add(rows);

  function addRow(alignItems: LayoutProps["alignItems"], last?: LayoutProps, all?: LayoutProps) {
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
        flexDirection: "row",
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

  addRow("flex-start", { alignSelf: "center" });
  addRow("flex-end", { alignSelf: "flex-start" });
  addRow("center", { alignSelf: "stretch", height: undefined });
  addRow("stretch", { alignSelf: "flex-end", height: crossAxisValue }, { height: undefined });

  const columns = new View({
    style: {
      flexDirection: "column",
      width: 300 - mainAxisValue * 8,
    },
    testID: "columns",
  });
  root.add(columns);

  function addColumn(alignItems: LayoutProps["alignItems"], last?: LayoutProps, all?: LayoutProps) {
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
        flexDirection: "column",
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

  addColumn("flex-start", { alignSelf: "center" });
  addColumn("flex-end", { alignSelf: "flex-start" });
  addColumn("center", { alignSelf: "stretch", width: undefined });
  addColumn("stretch", { alignSelf: "flex-end", width: crossAxisValue }, { width: undefined });

  return root;
}

export function flexDirectionReverse() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  const rows = new View({
    style: {
      flexDirection: "column",
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
        flexDirection: "row-reverse",
        justifyContent: attribute,
        width: "100%",
      },
    });
    rows.add(view);
    view.add(new View({ style: firstStyle }));
    view.add(new View({ style: secondStyle }));
    view.add(new View({ style: thirdStyle }));
  }

  generateFlexRow("flex-start");
  generateFlexRow("flex-end");
  generateFlexRow("center");
  generateFlexRow("space-evenly");
  generateFlexRow("space-around");
  generateFlexRow("space-between");

  const columns = new View({
    style: {
      flexDirection: "row",
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
        flexDirection: "column-reverse",
        height: "100%",
        justifyContent: attribute,
      },
    });
    columns.add(view);
    view.add(new View({ style: firstStyle }));
    view.add(new View({ style: secondStyle }));
    view.add(new View({ style: thirdStyle }));
  }

  generateFlexColumn("flex-start");
  generateFlexColumn("flex-end");
  generateFlexColumn("center");
  generateFlexColumn("space-evenly");
  generateFlexColumn("space-around");
  generateFlexColumn("space-between");

  return root;
}

export function flexWrapRow() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  function box(backgroundColor: string, width: number, height: number, style?: ViewStyleProps) {
    return new View({
      style: { backgroundColor, height, width, ...style },
    });
  }

  const row = new View({
    style: {
      alignItems: "center",
      backgroundColor: colors[0],
      columnGap: 5,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
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
      width: 300,
    },
  });

  function box(backgroundColor: string, width: number, height: number, style?: ViewStyleProps) {
    return new View({
      style: { backgroundColor, height, width, ...style },
    });
  }

  const column = new View({
    style: {
      alignItems: "flex-end",
      backgroundColor: colors[0],
      columnGap: 10,
      flexDirection: "column",
      flexWrap: "wrap-reverse",
      height: "100%",
      paddingHorizontal: 10,
      rowGap: 5,
    },
    testID: "column-wrap",
  });
  root.add(column);
  column.add(box(colors[1], 25, 60));
  column.add(box(colors[2], 33, 40));
  column.add(box(colors[3], 25, 70, { marginTop: 11 }));
  column.add(box(colors[4], 41, 90, { marginTop: 8 }));
  column.add(box(colors[5], 19, 210));

  return root;
}

export function alignContent() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      flexWrap: "wrap",
      height: 300,
      width: 300,
    },
  });

  function container(backgroundColor: string, alignContent: LayoutProps["alignContent"]) {
    const c = new View({
      style: {
        alignContent,
        backgroundColor,
        flexDirection: "row",
        flexWrap: "wrap",
        // gap: 10,
        height: 75,
        // justifyContent: "space-between",
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

  function box(backgroundColor: string, width: number, height: number, style?: ViewStyleProps) {
    return new View({
      style: { backgroundColor, height, width, ...style },
    });
  }

  container(colors[0], "flex-start");
  container(colors[1], "center");
  container(colors[0], "flex-end");
  container(colors[1], "space-between");

  container(colors[1], "space-around");
  container(colors[0], "space-evenly");
  container(colors[1], "stretch");

  return root;
}

export function flexShrinkAndGrow() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  return root;
}

// TODO @tchayen: add borders.
export function marginsAndPaddingsAndBorders() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  const box = new View({
    style: {
      backgroundColor: colors[0],
      flexDirection: "row",
      padding: 10,
    },
  });
  root.add(box);

  const first = new View({
    style: {
      backgroundColor: colors[1],
      height: 100,
      marginLeft: 10,
      marginRight: 20,
      padding: 5,
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
      flexDirection: "row",
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
      position: "absolute",
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
      position: "absolute",
      width: 50,
    },
  });
  box.add(absolute2);

  return root;
}

export function percentageAndMinMaxSizes() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  const passThrough = new View({
    style: { backgroundColor: colors[0] },
    testID: "passThrough",
  });
  root.add(passThrough);
  const inside = new View({
    style: {
      backgroundColor: colors[1],
      flexDirection: "row",
      height: "50%",
    },
    testID: "inside",
  });
  passThrough.add(inside);
  const innermost = new View({
    style: {
      backgroundColor: colors[2],
      flexDirection: "row",
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
      flexDirection: "row",
      maxHeight: 40,
      maxWidth: 40,
    },
    testID: "maxSize",
  });
  root.add(maxSize);

  const maxSizeFirst = new View({
    style: {
      backgroundColor: colors[8],
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

export function displayAndOverflow() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  return root;
}

export function zIndex() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  return root;
}

export function formUI() {
  invariant(lookups, "Lookups must be set.");

  const inputGroupStyle = {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  } as ViewStyleProps;

  const inputStyle = {
    backgroundColor: "#444",
    borderColor: "#666",
    borderRadius: 6,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    paddingHorizontal: 10,
    width: 40,
  } as ViewStyleProps;

  const textStyle = {
    color: "#fff",
    fontName: "Inter",
    fontSize: 14,
  } as TextStyleProps;

  const root = new View({
    style: {
      alignItems: "center",
      backgroundColor: "#000",
      height: 300,
      justifyContent: "center",
      width: 300,
    },
  });

  const inner = new View({
    style: {
      alignSelf: "center",
      backgroundColor: "#222",
      flexDirection: "row",
      gap: 20,
      justifyContent: "center",
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
  const xValue = new Text("0", { lookups, style: textStyle, testID: "xValue" });
  xInput.add(xValue);

  const yInputSection = new View({ style: inputGroupStyle });
  inner.add(yInputSection);
  const y = new Text("Y", { lookups, style: textStyle, testID: "yLabel" });
  yInputSection.add(y);
  const yInput = new View({ style: inputStyle });
  yInputSection.add(yInput);
  const yValue = new Text("0", { lookups, style: textStyle, testID: "yValue" });
  yInput.add(yValue);

  const zInputSection = new View({ style: inputGroupStyle });
  inner.add(zInputSection);
  const z = new Text("Z", { lookups, style: textStyle, testID: "zLabel" });
  zInputSection.add(z);
  const zInput = new View({ style: inputStyle });
  zInputSection.add(zInput);
  const zValue = new Text("0", { lookups, style: textStyle, testID: "zValue" });
  zInput.add(zValue);

  return root;
}
