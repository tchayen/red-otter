import { Text } from "./Text";
import { UIRenderer } from "./UIRenderer";
import { View } from "./View";
import { Lookups } from "./font/types";
import { layout } from "./ui/layout";
import { Vec2 } from "./math/Vec2";
import { TextStyleProps, ViewStyleProps } from "./types";
import { invariant } from "./utils/invariant";
import * as fixtures from "./fixtures";

export let lookups: Lookups;

export function ui(renderer: UIRenderer): View {
  lookups = renderer.fontLookups;
  invariant(lookups, "Lookups must be set.");

  // NOTE:
  // This screen is built within the library so if anything fundamental get
  // broken when e.g. debugging some problem, a good trick to enable moving
  // forward is to turn off all the tests but the one being worked on.

  const columnStyle = {
    flexDirection: "column",
    height: "100%",
    width: 300,
  } as ViewStyleProps;

  const textStyle = {
    color: "#fff",
    fontName: "Inter",
    fontSize: 14,
    marginVertical: 10,
  } as TextStyleProps;

  const container = new View({
    style: {
      backgroundColor: "#333",
      flexDirection: "row",
      gap: 10,
      height: window.innerHeight,
      paddingHorizontal: 10,
      width: window.innerWidth,
    },
  });

  function text(value: string) {
    return new Text(value, { lookups, style: textStyle });
  }

  const column1 = new View({ style: columnStyle });
  container.add(column1);

  column1.add(text("flex value"));
  column1.add(fixtures.flexValue());
  column1.add(text("flexDirection row and column"));
  column1.add(fixtures.flexRowAndColumn());
  column1.add(text("alignItems and alignSelf"));
  column1.add(fixtures.alignItemsAndSelf());

  const column2 = new View({ style: columnStyle });
  container.add(column2);

  column2.add(text("flexDirection reverse"));
  column2.add(fixtures.flexDirectionReverse());
  column2.add(text("flexWrap"));
  column2.add(fixtures.flexWrap());
  column2.add(text("alignContent"));
  column2.add(fixtures.alignContent());

  const column3 = new View({ style: columnStyle });
  container.add(column3);

  column3.add(text("margins and paddings"));
  column3.add(fixtures.marginsAndPaddings());
  column3.add(text("left, top, right, bottom"));
  column3.add(fixtures.offsets());
  column3.add(text("inheriting sizes"));
  column3.add(fixtures.inheritingSizes());

  const column4 = new View({ style: columnStyle });
  container.add(column4);
  column4.add(text("form UI"));
  column4.add(fixtures.formUI());

  // const scroll = testScroll();
  // container.add(scroll);

  // container.add(
  //   new Text(
  // eslint-disable-next-line comment-length/limit-single-line-comments
  //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ultrices auctor lectus accumsan tincidunt. Etiam ut augue in turpis accumsan ornare. Maecenas viverra vitae mauris nec pretium. Suspendisse dignissim eleifend lorem, nec luctus magna sollicitudin ac. Sed velit velit, porta non mattis et, ullamcorper ac erat. Vestibulum ultrices nisl metus, varius auctor magna feugiat id. Fusce dapibus metus non nibh ornare ultricies. Aliquam pharetra quis nunc sed vestibulum. Curabitur ut dignissim urna. Quisque vitae hendrerit lacus. Aliquam sollicitudin, orci a mollis luctus, massa ligula vulputate mi, et volutpat metus ex ac turpis. Nullam elementum congue euismod. Mauris vestibulum lectus risus, at dignissim enim facilisis commodo. Etiam tincidunt malesuada leo eget efficitur. Praesent eleifend neque ac tellus dictum sodales. Nam sed imperdiet nibh. Nunc sagittis, felis et dapibus molestie, quam neque venenatis odio, sit amet cursus justo arcu at metus. Cras pharetra risus blandit, efficitur lacus eu, sollicitudin nunc. Cras in tellus nisl. Integer vitae est pellentesque, imperdiet nunc sit amet, condimentum lacus. Suspendisse a dolor sed tellus vulputate ultricies non sed turpis. Curabitur ullamcorper massa risus, vitae fringilla mi volutpat id. Curabitur cursus pellentesque elit, at tincidunt ipsum vehicula eget. Maecenas pulvinar eu mauris non commodo. Etiam a fermentum lorem, eget venenatis elit. Quisque convallis, ligula eget sagittis venenatis, velit metus dignissim enim, id cursus risus ligula vitae mauris. Proin congue ornare ligula at hendrerit. Nam id ipsum mattis, consectetur ante quis, placerat lacus. Sed lacinia, sem at sollicitudin pulvinar, augue felis faucibus odio, vitae sodales justo libero vitae arcu. Sed finibus felis quis dictum finibus. Aliquam mattis interdum fringilla. Mauris nisl nunc, dignissim eget porta sed, vestibulum ac neque. Nunc vehicula tempor lectus, sit amet pretium tortor. Aliquam arcu ligula, viverra in sapien non, consequat luctus nisi. Proin suscipit metus eget magna rutrum imperdiet sit amet eget dui.",
  //     { lookups, style: { color: "#999", fontName: "Inter", fontSize: 13 } }
  //   )
  // );

  const start = performance.now();
  layout(container, lookups, new Vec2(window.innerWidth, window.innerHeight));
  const end = performance.now();

  console.log(`Layout took ${(end - start).toFixed(2)}ms.`);

  // console.log(debugPrintTree(scroll));
  return container;
}

function testScroll() {
  const root = new View({
    style: {
      backgroundColor: "#000",
      height: 300,
      width: 600,
    },
    testID: "root",
  });

  const inner = new View({
    style: {
      backgroundColor: "#50ff50",
      height: 100,
      overflow: "scroll",
      width: 100,
    },
    testID: "inner",
  });
  root.add(inner);

  const obstructed = new View({
    style: {
      backgroundColor: "#ff5050",
      height: 50,
      marginLeft: 70,
      width: 50,
    },
    testID: "obstructed",
  });
  inner.add(obstructed);

  return root;
}

function debugPrintTree(tree: View | Text, level: number = 0) {
  let c = tree.firstChild;
  if (!c) {
    return "";
  }

  const type = c instanceof Text ? "Text" : "View";

  const { metrics, scrollOffset, scrollableContentSize } = c._state;
  let info =
    `- [${c?.props.testID ?? type}]\n  metrics: (${metrics.x}, ${metrics.y}, ${
      metrics.width
    }, ${metrics.height})\n  scrollOffset: (${scrollOffset.x}, ${
      scrollOffset.y
    })\n  scrollableContentSize: (${scrollableContentSize.x}, ${
      scrollableContentSize.y
    })\n` ?? "";
  /*
   * let info =
   *   JSON.stringify(
   *     c?._state,
   *     (key: string, value: any) => {
   *       if (key === "metrics") {
   *         return `(${value.x}, ${value.y}, ${value.width}, ${value.height})`;
   *       }
   *       if (key === "scrollOffset") {
   *         return `(${value.x}, ${value.y})`;
   *       }
   *       if (key === "scrollableContentSize") {
   *         return `(${value.x}, ${value.y})`;
   *       }
   *       return value;
   *     },
   *     2
   *   ) + "\n" ?? "";
   */

  while (c) {
    info += debugPrintTree(c, level + 1)
      .split("\n")
      .map((line) => "  ".repeat(level + 1) + line)
      .join("\n");
    c = c.next;
  }

  return info;
}
