import { View } from "./View";
import { LayoutProps, ViewStyleProps } from "./types";

export function flexAttributes() {
  const redStyle = {
    backgroundColor: "#ff0000",
    height: 50,
    width: 40,
  } as ViewStyleProps;

  const greenStyle = {
    backgroundColor: "#00ff00",
    height: 50,
    width: 60,
  } as ViewStyleProps;

  const blueStyle = {
    backgroundColor: "#0000ff",
    height: 50,
    width: 80,
  } as ViewStyleProps;

  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 400,
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
