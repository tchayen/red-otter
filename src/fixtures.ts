import { View } from "./View";
import { LayoutProps, ViewStyleProps } from "./types";

const redStyle = {
  backgroundColor: "#ff0000",
  height: 50,
  width: 30,
} as ViewStyleProps;

const greenStyle = {
  backgroundColor: "#00ff00",
  height: 50,
  width: 40,
} as ViewStyleProps;

const blueStyle = {
  backgroundColor: "#0000ff",
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
