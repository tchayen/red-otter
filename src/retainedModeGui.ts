import { Text } from "./Text";
import { UIRenderer } from "./UIRenderer";
import { View } from "./View";
import { Lookups } from "./font/types";
import { layout } from "./layout";
import { Vec2 } from "./math/Vec2";
import { TextStyleProps, ViewStyleProps } from "./types";
import { invariant } from "./utils/invariant";

export let lookups: Lookups;

export function retainedModeGui(ui: UIRenderer): View {
  lookups = ui.fontLookups;
  invariant(lookups, "Lookups must be set.");

  const container = new View({
    style: {
      backgroundColor: "#222",
      gap: 10,
      height: window.innerHeight,
      padding: 20,
      width: 800,
    },
  });

  const view = new View({
    style: {
      backgroundColor: "#333",
      padding: 50,
    },
  });

  container.add(view);

  const button = new View({
    onClick() {
      console.log("Clicked!");
      this.style.backgroundColor = "#ff0000";
    },
    style: {
      backgroundColor: "#666",
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
  });

  view.add(button);

  const text = new Text("Join lobby", {
    lookups,
    style: {
      color: "#fff",
      fontName: "InterBold",
      fontSize: 15,
    },
  });
  button.add(text);

  // Test 1
  {
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
      width: 60,
    } as ViewStyleProps;

    const textStyle = {
      color: "#fff",
      fontName: "Inter",
      fontSize: 14,
    } as TextStyleProps;

    const root = new View({
      style: {
        backgroundColor: "#000",
        height: 400,
        justifyContent: "center",
        width: 600,
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

    container.add(root);
  }

  // Test 2
  {
    const root = new View({
      style: {
        backgroundColor: "#000",
        height: 400,
        width: 600,
      },
    });

    const inner = new View({
      style: {
        backgroundColor: "#50ff50",
        height: 300,
        width: 300,
      },
    });
    root.add(inner);

    const obstructed = new View({
      style: {
        backgroundColor: "#ff5050",
        height: 200,
        marginLeft: 200,
        width: 200,
      },
    });
    inner.add(obstructed);

    container.add(root);
  }

  container.add(
    new Text(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ultrices auctor lectus accumsan tincidunt. Etiam ut augue in turpis accumsan ornare. Maecenas viverra vitae mauris nec pretium. Suspendisse dignissim eleifend lorem, nec luctus magna sollicitudin ac. Sed velit velit, porta non mattis et, ullamcorper ac erat. Vestibulum ultrices nisl metus, varius auctor magna feugiat id. Fusce dapibus metus non nibh ornare ultricies. Aliquam pharetra quis nunc sed vestibulum. Curabitur ut dignissim urna. Quisque vitae hendrerit lacus. Aliquam sollicitudin, orci a mollis luctus, massa ligula vulputate mi, et volutpat metus ex ac turpis. Nullam elementum congue euismod. Mauris vestibulum lectus risus, at dignissim enim facilisis commodo. Etiam tincidunt malesuada leo eget efficitur. Praesent eleifend neque ac tellus dictum sodales. Nam sed imperdiet nibh. Nunc sagittis, felis et dapibus molestie, quam neque venenatis odio, sit amet cursus justo arcu at metus. Cras pharetra risus blandit, efficitur lacus eu, sollicitudin nunc. Cras in tellus nisl. Integer vitae est pellentesque, imperdiet nunc sit amet, condimentum lacus. Suspendisse a dolor sed tellus vulputate ultricies non sed turpis. Curabitur ullamcorper massa risus, vitae fringilla mi volutpat id. Curabitur cursus pellentesque elit, at tincidunt ipsum vehicula eget. Maecenas pulvinar eu mauris non commodo. Etiam a fermentum lorem, eget venenatis elit. Quisque convallis, ligula eget sagittis venenatis, velit metus dignissim enim, id cursus risus ligula vitae mauris. Proin congue ornare ligula at hendrerit. Nam id ipsum mattis, consectetur ante quis, placerat lacus. Sed lacinia, sem at sollicitudin pulvinar, augue felis faucibus odio, vitae sodales justo libero vitae arcu. Sed finibus felis quis dictum finibus. Aliquam mattis interdum fringilla. Mauris nisl nunc, dignissim eget porta sed, vestibulum ac neque. Nunc vehicula tempor lectus, sit amet pretium tortor. Aliquam arcu ligula, viverra in sapien non, consequat luctus nisi. Proin suscipit metus eget magna rutrum imperdiet sit amet eget dui.",
      { lookups, style: { color: "#999", fontName: "Inter", fontSize: 13 } }
    )
  );

  layout(container, lookups, new Vec2(window.innerWidth, window.innerHeight));

  return container;
}
