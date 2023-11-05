import { Text } from "./Text";
import { View } from "./View";
import { LayoutProps, TextStyleProps, ViewStyleProps } from "./types";
import { lookups } from "./ui";

const colors = [
  "hsl(220, 100%, 20%)",
  "hsl(220, 100%, 30%)",
  "hsl(220, 100%, 40%)",
  "hsl(220, 100%, 50%)",
  "hsl(220, 100%, 60%)",
  "hsl(220, 100%, 70%)",
  "hsl(220, 100%, 80%)",
  "hsl(220, 100%, 90%)",
  "hsl(220, 100%, 100%)",
];

export function flexValue() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  const row = new View({
    style: { flexDirection: "row", marginLeft: 50, width: 250 },
  });
  root.add(row);
  const row0 = new View({
    style: { backgroundColor: colors[0], flex: 0, height: 50 },
  });
  row.add(row0);
  const row1 = new View({
    style: { backgroundColor: colors[1], flex: 1, height: 50 },
  });
  row.add(row1);
  const row2 = new View({
    style: { backgroundColor: colors[2], flex: 2, height: 50 },
  });
  row.add(row2);
  const rowFixed = new View({
    style: { backgroundColor: colors[3], height: 50, width: 50 },
  });
  row.add(rowFixed);

  const column = new View({
    style: { flex: 1, flexDirection: "column" },
  });
  root.add(column);
  const column0 = new View({
    style: { backgroundColor: colors[4], flex: 0, width: 50 },
  });
  column.add(column0);
  const column1 = new View({
    style: { backgroundColor: colors[5], flex: 1, width: 50 },
  });
  column.add(column1);
  const column2 = new View({
    style: { backgroundColor: colors[6], flex: 2, width: 50 },
  });
  column.add(column2);
  const columnFixed = new View({
    style: { backgroundColor: colors[7], height: 50, width: 50 },
  });
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
      backgroundColor: colors[0],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: colors[1],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: colors[2],
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
      backgroundColor: colors[0],
      height: 25,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: colors[1],
      height: 25,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: colors[2],
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

  function addRow(
    alignItems: LayoutProps["alignItems"],
    last?: LayoutProps,
    all?: LayoutProps
  ) {
    const firstStyle = {
      backgroundColor: colors[0],
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
  addRow(
    "stretch",
    { alignSelf: "flex-end", height: crossAxisValue },
    { height: undefined }
  );

  const columns = new View({
    style: {
      flexDirection: "column",
      width: 300 - mainAxisValue * 8,
    },
    testID: "columns",
  });
  root.add(columns);

  function addColumn(
    alignItems: LayoutProps["alignItems"],
    last?: LayoutProps,
    all?: LayoutProps
  ) {
    const firstStyle = {
      backgroundColor: colors[0],
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
  addColumn(
    "stretch",
    { alignSelf: "flex-end", width: crossAxisValue },
    { width: undefined }
  );

  return root;
}

// TODO: @tchayen: add paddings here.
export function margins() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  function generateFlexColumn(attribute: LayoutProps["justifyContent"]) {
    const firstStyle = {
      backgroundColor: colors[0],
      height: 50,
      width: 30,
    } as ViewStyleProps;

    const secondStyle = {
      backgroundColor: colors[1],
      height: 50,
      width: 40,
    } as ViewStyleProps;

    const thirdStyle = {
      backgroundColor: colors[2],
      height: 50,
      width: 50,
    } as ViewStyleProps;

    const view = new View({
      style: {
        flexDirection: "row",
        justifyContent: attribute,
        width: "100%",
      },
    });
    root.add(view);
    view.add(new View({ style: { ...firstStyle, height: 40, margin: 5 } }));
    view.add(new View({ style: { ...secondStyle, height: 40 } }));
    view.add(new View({ style: { ...thirdStyle, height: 40 } }));
  }

  generateFlexColumn("flex-start");
  generateFlexColumn("flex-end");
  generateFlexColumn("center");
  generateFlexColumn("space-evenly");
  generateFlexColumn("space-around");
  generateFlexColumn("space-between");

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

  const view = new View({
    style: {
      backgroundColor: colors[0],
      height: 50,
      left: 30,
      top: 30,
      width: 50,
    },
  });
  root.add(view);

  const stretched = new View({
    style: {
      backgroundColor: colors[1],
      height: 50,
      left: 50,
      right: 50,
    },
  });
  root.add(stretched);

  const bottom = new View({
    style: {
      backgroundColor: colors[2],
      bottom: 30,
      height: 50,
      width: 50,
    },
  });
  root.add(bottom);

  const box = new View({
    style: {
      backgroundColor: "#222",
      flexDirection: "row",
      height: 120,
      width: 120,
    },
  });
  root.add(box);

  const small = new View({
    style: {
      backgroundColor: colors[3],
      height: 50,
      width: 50,
    },
  });
  box.add(small);
  const small2 = new View({
    style: {
      backgroundColor: colors[4],
      height: 50,
      width: 50,
    },
  });
  box.add(small2);

  const absolute1 = new View({
    style: {
      backgroundColor: colors[5],
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
      backgroundColor: colors[6],
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

export function formUI() {
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
  const x = new Text("X", { lookups, style: textStyle });
  xInputSection.add(x);
  const xInput = new View({ style: inputStyle });
  xInputSection.add(xInput);
  const xValue = new Text("0", { lookups, style: textStyle });
  xInput.add(xValue);

  const yInputSection = new View({ style: inputGroupStyle });
  inner.add(yInputSection);
  const y = new Text("Y", { lookups, style: textStyle });
  yInputSection.add(y);
  const yInput = new View({ style: inputStyle });
  yInputSection.add(yInput);
  const yValue = new Text("0", { lookups, style: textStyle });
  yInput.add(yValue);

  const zInputSection = new View({ style: inputGroupStyle });
  inner.add(zInputSection);
  const z = new Text("Z", { lookups, style: textStyle });
  zInputSection.add(z);
  const zInput = new View({ style: inputStyle });
  zInputSection.add(zInput);
  const zValue = new Text("0", { lookups, style: textStyle });
  zInput.add(zValue);

  return root;
}
