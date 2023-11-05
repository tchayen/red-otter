import { Text } from "./Text";
import { View } from "./View";
import { LayoutProps, TextStyleProps, ViewStyleProps } from "./types";
import { lookups } from "./ui";

const colors = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
];

const redStyle = {
  backgroundColor: colors[0],
  height: 50,
  width: 30,
} as ViewStyleProps;

const greenStyle = {
  backgroundColor: colors[1],
  height: 50,
  width: 40,
} as ViewStyleProps;

const blueStyle = {
  backgroundColor: colors[2],
  height: 50,
  width: 50,
} as ViewStyleProps;

export function flexRow() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  function generateFlexRow(attribute: LayoutProps["justifyContent"]) {
    const view = new View({
      style: {
        flexDirection: "row",
        justifyContent: attribute,
        width: "100%",
      },
    });
    root.add(view);
    view.add(new View({ style: redStyle }));
    view.add(new View({ style: greenStyle }));
    view.add(new View({ style: blueStyle }));
  }

  generateFlexRow("flex-start");
  generateFlexRow("flex-end");
  generateFlexRow("center");
  generateFlexRow("space-evenly");
  generateFlexRow("space-around");
  generateFlexRow("space-between");

  return root;
}

export function flexColumn() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      flexDirection: "row",
      height: 300,
      width: 300,
    },
  });

  function generateFlexColumn(attribute: LayoutProps["justifyContent"]) {
    const view = new View({
      style: {
        flexDirection: "column",
        height: "100%",
        justifyContent: attribute,
      },
    });
    root.add(view);
    view.add(new View({ style: redStyle }));
    view.add(new View({ style: greenStyle }));
    view.add(new View({ style: blueStyle }));
  }

  generateFlexColumn("flex-start");
  generateFlexColumn("flex-end");
  generateFlexColumn("center");
  generateFlexColumn("space-evenly");
  generateFlexColumn("space-around");
  generateFlexColumn("space-between");

  return root;
}

export function margins() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 300,
    },
  });

  function generateFlexColumn(attribute: LayoutProps["justifyContent"]) {
    const view = new View({
      style: {
        flexDirection: "row",
        justifyContent: attribute,
        width: "100%",
      },
    });
    root.add(view);
    view.add(new View({ style: { ...redStyle, height: 40, margin: 5 } }));
    view.add(new View({ style: { ...greenStyle, height: 40 } }));
    view.add(new View({ style: { ...blueStyle, height: 40 } }));
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

  const absolute = new View({
    style: {
      backgroundColor: colors[5],
      bottom: 40,
      height: 50,
      position: "absolute",
      right: 0,
      width: 50,
    },
  });
  box.add(absolute);

  return root;
}

export function formUI() {
  const inputGroupStyle = {
    // alignItems: "center",
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
      paddingHorizontal: 40,
      paddingVertical: 20,
    },
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
