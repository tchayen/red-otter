import { BaseEditor } from "../components/BaseEditor";

export function ExamplePicker() {
  return (
    <>
      <BaseEditor
        files={{
          "/index.ts": { code: starterCode },
        }}
      />
    </>
  );
}

const starterCode = `import {
  invariant,
  renderFontAtlas,
  Vec2,
  Vec4,
  parseTTF,
  prepareLookups,
  WebGPURenderer,
  View,
  Button,
  Input,
  Overflow,
  JustifyContent,
  AlignSelf,
} from "./dist/index";
import type {
  ViewStyleProps,
  TextStyleProps,
} from "./dist/index";

document.body.style.margin = "0";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const parent = canvas.parentElement;
invariant(parent, "No parent element found.");
const WIDTH = parent.clientWidth;
const HEIGHT = parent.clientHeight;


const settings = {
  sampleCount: 4,
  windowHeight: HEIGHT,
  windowWidth: WIDTH,
  rectangleBufferSize: 16 * 4096,
  textBufferSize: 16 * 100_000,
};

canvas.width = WIDTH * window.devicePixelRatio;
canvas.height = HEIGHT * window.devicePixelRatio;
canvas.setAttribute("style", "width: 100%; height: 100%;");

async function run() {
  const interTTF = await fetch("https://tchayen.com/assets/Inter.ttf").then((response) => response.arrayBuffer());

  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const entry = navigator.gpu;
  console.log(invariant);
  invariant(entry, "WebGPU is not supported in this browser.");

  const context = canvas.getContext("webgpu");
  invariant(context, "WebGPU is not supported in this browser.");

  const adapter = await entry.requestAdapter();
  invariant(adapter, "No GPU found on this system.");

  const device = await adapter.requestDevice();

  context.configure({
    alphaMode: "opaque",
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  const lookups = prepareLookups([{ buffer: interTTF, name: "Inter", ttf: parseTTF(interTTF) }], {
    alphabet,
    fontSize: 150,
  });

  const fontAtlas = await renderFontAtlas(lookups, { useSDF: true });

  const colorTexture = device.createTexture({
    format: "bgra8unorm",
    label: "color",
    sampleCount: settings.sampleCount,
    size: { height: canvas.height, width: canvas.width },
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });
  const colorTextureView = colorTexture.createView({ label: "color" });

  const renderer = new WebGPURenderer(
    device,
    context,
    colorTextureView,
    settings,
    lookups,
    fontAtlas,
  );

  function ui() {
    const labelStyle = {
      color: colors.gray[10],
      fontName: "Inter",
      fontSize: 12,
    } as TextStyleProps;
    const headerStyle = {
      color: colors.gray[11],
      fontName: "InterBold",
      fontSize: 20,
    } as TextStyleProps;
    const boxStyle = {
      backgroundColor: colors.gray[2],
      borderColor: colors.gray[4],
      borderRadius: 6,
      borderWidth: 1,
      margin: 100,
    } as ViewStyleProps;
    const inputGroupStyle = {
      gap: 6,
    } as ViewStyleProps;
    const inputStyle = {
      alignSelf: AlignSelf.Stretch,
      backgroundColor: colors.gray[0],
      borderColor: colors.gray[4],
      borderRadius: 6,
      borderWidth: 1,
      height: 28,
      justifyContent: JustifyContent.Center,
      paddingHorizontal: 10,
    } as ViewStyleProps;
    const buttonRow = {
      flexDirection: FlexDirection.Row,
      gap: 12,
      justifyContent: JustifyContent.End,
    } as ViewStyleProps;
    const secondaryButton = {
      backgroundColor: colors.gray[6],
      borderColor: colors.gray[7],
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
    const pickerHeader = new Text("Browse games", { lookups, style: { ...headerStyle } });
    const headerWrapper = new View({
      style: {
        alignSelf: AlignSelf.Stretch,
        gap: 8,
        padding: 20,
      },
    });
    const description = new Text("See available lobbies.", {
      lookups,
      style: {
        color: colors.gray[9],
        fontName: "Inter",
        fontSize: 14,
      },
    });
    headerWrapper.add(pickerHeader);
    headerWrapper.add(description);
    pickerBox.add(headerWrapper);

    const scrollArea = new View({
      style: {
        alignSelf: AlignSelf.Stretch,
        backgroundColor: colors.gray[1],
        flexDirection: FlexDirection.Row,
        height: 240,
        overflowY: Overflow.Scroll,
      },
    });
    pickerBox.add(scrollArea);

    const columns = ["name", "players", "mode", "password"] as const;

    const list = [
      { mode: "FFA", name: "Random map", password: false, players: { current: 3, limit: 8 } },
      { mode: "FFA", name: "Black forest", password: false, players: { current: 3, limit: 8 } },
      { mode: "FFA", name: "Arabia", password: false, players: { current: 3, limit: 8 } },
      { mode: "2v2", name: "Danube River", password: false, players: { current: 2, limit: 4 } },
      { mode: "2v2v2v2", name: "Alaska", password: false, players: { current: 3, limit: 8 } },
      { mode: "1v1", name: "Amazon Tunnel", password: true, players: { current: 1, limit: 2 } },
      { mode: "1v1", name: "Random map", password: false, players: { current: 2, limit: 2 } },
      { mode: "1v1", name: "Random map", password: false, players: { current: 2, limit: 2 } },
      { mode: "1v1", name: "Amazon Tunnel", password: true, players: { current: 1, limit: 2 } },
      { mode: "1v1", name: "Random map", password: false, players: { current: 2, limit: 2 } },
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
            cell.add(text(item as string, 14, "#B4B4B4"));
            break;
          case "name":
            cell.add(text(item as string, 14, "#B4B4B4"));
            break;
          case "password":
            cell.add(text(item ? "Yes" : "No", 14, "#B4B4B4"));
            break;
          case "players":
            if (
              typeof item !== "boolean" &&
              typeof item !== "string" &&
              "current" in item &&
              "limit" in item
            ) {
              cell.add(text(\`\${item.current}/\${item.limit}\`, 14, "#B4B4B4"));
            }
            break;
        }
      }
    }

    const pickerButtonRow = new View({
      style: {
        alignSelf: AlignSelf.Stretch,
        justifyContent: JustifyContent.End,
        ...buttonRow,
        padding: 20,
      },
    });
    pickerBox.add(pickerButtonRow);

    const pickerCancelButton = new Button({
      label: "Cancel",
      lookups,
      onClick: () => {
        root.remove(pickerBox);
        root.add(signInBox);
        layout(parent, lookups, new Vec2(window.innerWidth, window.innerHeight));
      },
      style: secondaryButton,
    });
    pickerButtonRow.add(pickerCancelButton);

    const pickerSubmitButton = new Button({
      label: "Join",
      lookups,
      onClick: () => {
        root.remove(pickerBox);
      },
      style: primaryButton,
    });
    pickerButtonRow.add(pickerSubmitButton);

    const signInBox = new View({ style: { ...boxStyle, gap: 20, padding: 20 } });
    root.add(signInBox);
    const signInHeader = new Text("Sign in", { lookups, style: headerStyle });
    signInBox.add(signInHeader);

    const usernameGroup = new View({ style: inputGroupStyle });
    signInBox.add(usernameGroup);

    const emailLabel = new Text("Email", { lookups, style: labelStyle });
    usernameGroup.add(emailLabel);

    const usernameInput = new Input({ lookups, placeholder: "Username", style: inputStyle });
    usernameGroup.add(usernameInput);

    const passwordGroup = new View({ style: inputGroupStyle });
    signInBox.add(passwordGroup);

    const passwordLabel = new Text("Password", { lookups, style: labelStyle });
    passwordGroup.add(passwordLabel);

    const passwordInput = new Input({ lookups, placeholder: "Password", style: inputStyle });
    passwordGroup.add(passwordInput);

    const loginButtonRow = new View({ style: buttonRow });
    signInBox.add(loginButtonRow);

    const loginCancelButton = new Button({
      label: "Cancel",
      lookups,
      onClick: () => {
        root.remove(signInBox);
      },
      style: secondaryButton,
    });
    loginButtonRow.add(loginCancelButton);

    const loginSubmitButton = new Button({
      label: "Submit",
      lookups,
      onClick: () => {
        root.remove(signInBox);
        root.add(pickerBox);
        layout(parent, lookups, new Vec2(window.innerWidth, window.innerHeight));
      },
      style: primaryButton,
    });
    loginButtonRow.add(loginSubmitButton);

    return root;
  }

  const root = new View({
    style: {
      backgroundColor: "#000",
      height: "100%",
      overflow: Overflow.Scroll,
      width: "100%",
    },
    testID: "root",
  });

  root.add(ui());
  layout(root, lookups, new Vec2(window.innerWidth, window.innerHeight));

  function render() {
    const commandEncoder = device.createCommandEncoder();
    renderer.render(commandEncoder);
    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(render);
  }
}

run();
`;
