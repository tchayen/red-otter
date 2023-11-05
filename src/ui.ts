import { Text } from "./Text";
import { UIRenderer } from "./UIRenderer";
import { View } from "./View";
import { Lookups } from "./font/types";
import { layout } from "./ui/layout";
import { Vec2 } from "./math/Vec2";
import { TextStyleProps, ViewStyleProps } from "./types";
import { invariant } from "./utils/invariant";
import { flexColumn, flexRow, formUI, margins, offsets } from "./fixtures";

export let lookups: Lookups;

export function ui(renderer: UIRenderer): View {
  lookups = renderer.fontLookups;
  invariant(lookups, "Lookups must be set.");

  const columnStyle = {
    flexDirection: "column",
    // gap: 10,
    height: "100%",
    width: 300,
  } as ViewStyleProps;

  const textStyle = {
    color: "#fff",
    fontName: "Inter",
    fontSize: 14,
    margin: 10,
  } as TextStyleProps;

  const container = new View({
    style: {
      backgroundColor: "#333",
      flexDirection: "row",
      gap: 10,
      height: window.innerHeight,
      width: window.innerWidth,
    },
  });

  const column1 = new View({ style: columnStyle });
  container.add(column1);

  column1.add(new Text("flexDirection: row", { lookups, style: textStyle }));
  column1.add(flexRow());
  column1.add(new Text("flexDirection: column", { lookups, style: textStyle }));
  column1.add(flexColumn());
  column1.add(new Text("margins", { lookups, style: textStyle }));
  column1.add(margins());

  const column2 = new View({ style: columnStyle });
  container.add(column2);

  column2.add(
    new Text("left, top, right, bottom", { lookups, style: textStyle })
  );
  column2.add(offsets());
  column2.add(new Text("form UI", { lookups, style: textStyle }));
  column2.add(formUI());

  // const scroll = testScroll();
  // container.add(scroll);

  // container.add(
  //   new Text(
  // eslint-disable-next-line comment-length/limit-single-line-comments
  //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ultrices auctor lectus accumsan tincidunt. Etiam ut augue in turpis accumsan ornare. Maecenas viverra vitae mauris nec pretium. Suspendisse dignissim eleifend lorem, nec luctus magna sollicitudin ac. Sed velit velit, porta non mattis et, ullamcorper ac erat. Vestibulum ultrices nisl metus, varius auctor magna feugiat id. Fusce dapibus metus non nibh ornare ultricies. Aliquam pharetra quis nunc sed vestibulum. Curabitur ut dignissim urna. Quisque vitae hendrerit lacus. Aliquam sollicitudin, orci a mollis luctus, massa ligula vulputate mi, et volutpat metus ex ac turpis. Nullam elementum congue euismod. Mauris vestibulum lectus risus, at dignissim enim facilisis commodo. Etiam tincidunt malesuada leo eget efficitur. Praesent eleifend neque ac tellus dictum sodales. Nam sed imperdiet nibh. Nunc sagittis, felis et dapibus molestie, quam neque venenatis odio, sit amet cursus justo arcu at metus. Cras pharetra risus blandit, efficitur lacus eu, sollicitudin nunc. Cras in tellus nisl. Integer vitae est pellentesque, imperdiet nunc sit amet, condimentum lacus. Suspendisse a dolor sed tellus vulputate ultricies non sed turpis. Curabitur ullamcorper massa risus, vitae fringilla mi volutpat id. Curabitur cursus pellentesque elit, at tincidunt ipsum vehicula eget. Maecenas pulvinar eu mauris non commodo. Etiam a fermentum lorem, eget venenatis elit. Quisque convallis, ligula eget sagittis venenatis, velit metus dignissim enim, id cursus risus ligula vitae mauris. Proin congue ornare ligula at hendrerit. Nam id ipsum mattis, consectetur ante quis, placerat lacus. Sed lacinia, sem at sollicitudin pulvinar, augue felis faucibus odio, vitae sodales justo libero vitae arcu. Sed finibus felis quis dictum finibus. Aliquam mattis interdum fringilla. Mauris nisl nunc, dignissim eget porta sed, vestibulum ac neque. Nunc vehicula tempor lectus, sit amet pretium tortor. Aliquam arcu ligula, viverra in sapien non, consequat luctus nisi. Proin suscipit metus eget magna rutrum imperdiet sit amet eget dui.",
  //     { lookups, style: { color: "#999", fontName: "Inter", fontSize: 13 } }
  //   )
  // );

  layout(container, lookups, new Vec2(window.innerWidth, window.innerHeight));
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