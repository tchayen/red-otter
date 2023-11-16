import { Text } from "./Text";
import { ScrollableRenderer } from "./ScrollableRenderer";
import { View } from "./View";
import { Lookups } from "./font/types";
import { layout } from "./ui/layout";
import { Vec2 } from "./math/Vec2";
import { TextStyleProps, ViewStyleProps } from "./types";
import { invariant } from "./utils/invariant";
import * as fixtures from "./fixtures";
import { measure } from "./measure";

export let lookups: Lookups;

export function ui(renderer: ScrollableRenderer): View {
  lookups = renderer.fontLookups;
  invariant(lookups, "Lookups must be set.");

  fixtures.setLookups(lookups);

  // NOTE:
  // This screen is built within the library so if anything fundamental get  broken when e.g.
  // debugging some problem, a good trick to enable moving  forward is to turn off all the tests but
  // the one being worked on.

  const columnStyle = {
    flexDirection: "column",
    width: 300,
  } as ViewStyleProps;

  const textStyle = {
    color: "#fff",
    fontName: "Inter",
    fontSize: 14,
    marginVertical: 10,
  } as TextStyleProps;

  const root = new View({
    style: {
      height: "100%",
      overflow: "scroll",
      width: "100%",
    },
    testID: "root",
  });

  const container = new View({
    style: {
      backgroundColor: "#333",
      flexDirection: "column",
      gap: 10,
      paddingHorizontal: 10,
      width: "100%",
    },
    testID: "container",
  });
  root.add(container);
  console.debug(root);

  function text(value: string) {
    return new Text(value, { lookups, style: textStyle, testID: "text" });
  }

  container.add(
    text(
      "NOTE:\nthe examples are not enumerating all features but rather try to catch as many edge cases as they can fit. So don't interpret them as direct representation of their description."
    )
  );

  const examples = new View({
    style: {
      flex: 1,
      flexDirection: "row",
      gap: 10,
      width: "100%",
    },
  });
  container.add(examples);

  const column1 = new View({ style: columnStyle });
  examples.add(column1);

  column1.add(text("flex value"));
  column1.add(fixtures.flexValue());
  column1.add(text("flexDirection row and column"));
  column1.add(fixtures.flexRowAndColumn());
  column1.add(text("alignItems and alignSelf"));
  column1.add(fixtures.alignItemsAndSelf());

  const column2 = new View({ style: columnStyle });
  examples.add(column2);

  column2.add(text("flexDirection reverse"));
  column2.add(fixtures.flexDirectionReverse());
  column2.add(text("flexWrap row"));
  column2.add(fixtures.flexWrapRow());
  column2.add(text("flexWrap reverse and column"));
  column2.add(fixtures.flexWrapColumn());

  const column3 = new View({ style: columnStyle });
  examples.add(column3);

  column3.add(text("alignContent"));
  column3.add(fixtures.alignContent());
  column3.add(text("flexShrink and flexGrow"));
  column3.add(fixtures.flexShrinkAndGrow());
  column3.add(text("margins, paddings, borders"));
  column3.add(fixtures.marginsAndPaddingsAndBorders());

  const column4 = new View({ style: columnStyle });
  examples.add(column4);

  column4.add(text("left, top, right, bottom"));
  column4.add(fixtures.offsets());
  column4.add(text("percentage sizes and min/max"));
  column4.add(fixtures.percentageAndMinMaxSizes());
  column4.add(text("display and overflow"));
  column4.add(fixtures.displayAndOverflow());

  const column5 = new View({ style: columnStyle });
  examples.add(column5);

  column5.add(text("zIndex"));
  column5.add(fixtures.zIndex());
  column5.add(text("text"));
  column5.add(fixtures.text());
  column5.add(text("aspectRatio"));
  column5.add(fixtures.aspectRatio());

  const column6 = new View({ style: columnStyle });
  examples.add(column6);

  column6.add(text("form UI"));
  column6.add(fixtures.formUI());

  const column7 = new View({ style: columnStyle });
  examples.add(column7);

  column7.add(text("scrollable"));
  column7.add(fixtures.scrollable());
  column7.add(text("interactive button"));
  column7.add(fixtures.interactiveButton());
  column7.add(text("trying to break things"));
  column7.add(fixtures.tryingToBreakThings());

  const tooTall = new View({
    style: {
      backgroundColor: "#ff0000",
      height: 2000,
      width: 300,
    },
    testID: "red",
  });

  column6.add(tooTall);

  ///////

  // const scroll = testScroll();
  // container.add(scroll);

  container.add(
    new Text(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ultrices auctor lectus accumsan tincidunt. Etiam ut augue in turpis accumsan ornare. Maecenas viverra vitae mauris nec pretium. Suspendisse dignissim eleifend lorem, nec luctus magna sollicitudin ac. Sed velit velit, porta non mattis et, ullamcorper ac erat. Vestibulum ultrices nisl metus, varius auctor magna feugiat id. Fusce dapibus metus non nibh ornare ultricies. Aliquam pharetra quis nunc sed vestibulum. Curabitur ut dignissim urna. Quisque vitae hendrerit lacus. Aliquam sollicitudin, orci a mollis luctus, massa ligula vulputate mi, et volutpat metus ex ac turpis. Nullam elementum congue euismod. Mauris vestibulum lectus risus, at dignissim enim facilisis commodo. Etiam tincidunt malesuada leo eget efficitur. Praesent eleifend neque ac tellus dictum sodales. Nam sed imperdiet nibh. Nunc sagittis, felis et dapibus molestie, quam neque venenatis odio, sit amet cursus justo arcu at metus. Cras pharetra risus blandit, efficitur lacus eu, sollicitudin nunc. Cras in tellus nisl. Integer vitae est pellentesque, imperdiet nunc sit amet, condimentum lacus. Suspendisse a dolor sed tellus vulputate ultricies non sed turpis. Curabitur ullamcorper massa risus, vitae fringilla mi volutpat id. Curabitur cursus pellentesque elit, at tincidunt ipsum vehicula eget. Maecenas pulvinar eu mauris non commodo. Etiam a fermentum lorem, eget venenatis elit. Quisque convallis, ligula eget sagittis venenatis, velit metus dignissim enim, id cursus risus ligula vitae mauris. Proin congue ornare ligula at hendrerit. Nam id ipsum mattis, consectetur ante quis, placerat lacus. Sed lacinia, sem at sollicitudin pulvinar, augue felis faucibus odio, vitae sodales justo libero vitae arcu. Sed finibus felis quis dictum finibus. Aliquam mattis interdum fringilla. Mauris nisl nunc, dignissim eget porta sed, vestibulum ac neque. Nunc vehicula tempor lectus, sit amet pretium tortor. Aliquam arcu ligula, viverra in sapien non, consequat luctus nisi. Proin suscipit metus eget magna rutrum imperdiet sit amet eget dui.",
      { lookups, style: { color: "#999", fontName: "Inter", fontSize: 13 } }
    )
  );

  measure("Layout", () => {
    layout(root, lookups, new Vec2(window.innerWidth, window.innerHeight));
  });

  console.debug(debugPrintTree(root));
  return root;
}

function debugPrintTree(tree: View | Text, level: number = 0) {
  if (!tree) {
    return "";
  }

  const type = tree instanceof Text ? "Text" : "View";

  const { metrics, scrollOffset, scrollableContentSize } = tree._state;
  let info =
    `- [${tree?.props.testID ?? type}]\n  metrics: (${metrics.x}, ${metrics.y}, ${metrics.width}, ${
      metrics.height
    })\n  scrollOffset: (${scrollOffset.x}, ${scrollOffset.y})\n  scrollableContentSize: (${
      scrollableContentSize.x
    }, ${scrollableContentSize.y})\n` ?? "";

  let c = tree.firstChild;
  while (c) {
    info += debugPrintTree(c, level + 1)
      .split("\n")
      .map((line) => "  ".repeat(level + 1) + line)
      .join("\n");
    c = c.next;
  }

  return info;
}
