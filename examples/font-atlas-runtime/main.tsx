import {
  Context,
  Font,
  FontAtlas,
  Layout,
  Style,
  TextStyle,
  TTF,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jsx,
} from "../../src";

const zinc = {
  50: "#fafafa",
  100: "#f4f4f5",
  200: "#e4e4e7",
  300: "#d4d4d8",
  400: "#a1a1aa",
  500: "#71717a",
  600: "#52525b",
  700: "#3f3f46",
  800: "#27272a",
  900: "#18181b",
} as const;

async function loadFont(): Promise<Font> {
  const start = performance.now();

  // Add font to the document so we will use browser to rasterize the font.
  const fontFace = new FontFace("Inter", 'url("/inter.ttf")');
  await fontFace.load();
  document.fonts.add(fontFace);

  // Download font file for parsing.
  const file = await fetch("/inter.ttf");
  const buffer = await file.arrayBuffer();

  const ttf = new TTF(buffer);
  if (!ttf.ok) {
    throw new Error("Failed to parse font file.");
  }

  // Render font atlas.
  const atlas = new FontAtlas(ttf);
  const { canvas, spacing } = atlas.render();

  const image = new Image();
  image.src = canvas.toDataURL();

  const font = new Font(spacing, image);
  console.debug(`Loaded font client-side in ${performance.now() - start}ms.`);
  return font;
}

loadFont().then((font) => {
  const canvas = document.createElement("canvas");
  canvas.width = 800 * window.devicePixelRatio;
  canvas.height = 600 * window.devicePixelRatio;

  const div = document.getElementById("app");
  if (!div) {
    throw new Error("Missing #app div.");
  }

  div.appendChild(canvas);

  const context = new Context(canvas, font);
  context.clear();
  const layout = new Layout(context, { readCSSVariables: true });

  const container: Style = {
    width: "100%",
    height: "100%",
    backgroundColor: zinc[900],
  };

  const menu: Style = {
    flexDirection: "row",
    gap: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: zinc[800],
    alignSelf: "stretch",
    borderBottomWidth: 1,
    borderColor: zinc[700],
  };

  const content: Style = {
    padding: 24,
    gap: 16,
    flex: 1,
  };

  const headerText: TextStyle = {
    color: "#fff",
    fontFamily: font,
    fontSize: 24,
  };

  const text: TextStyle = {
    color: zinc[400],
    fontFamily: font,
    fontSize: 14,
  };

  const overlay: Style = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  };

  const dialog: Style = {
    backgroundColor: zinc[800],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: zinc[700],
  };

  const headerLine: Style = {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    alignItems: "center",
  };

  const closeButton: Style = {
    backgroundColor: zinc[700],
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: zinc[600],
  };

  const separator: Style = {
    backgroundColor: zinc[700],
    height: 1,
    alignSelf: "stretch",
  };

  const paragraphs: Style = {
    gap: 16,
    padding: 24,
  };

  const row: Style = {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    alignSelf: "flex-end",
  };

  const buttonSecondary: Style = {
    backgroundColor: zinc[600],
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    height: 32,
    borderWidth: 1,
    borderColor: zinc[500],
  };

  const buttonText: TextStyle = {
    color: zinc[100],
    fontFamily: font,
    fontSize: 15,
  };

  const buttonPrimary: Style = {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    height: 32,
    borderWidth: 1,
    borderColor: "#3b82f6",
  };

  const buttonPrimaryText: TextStyle = {
    color: "#fff",
    fontFamily: font,
    fontSize: 15,
  };

  const checkboxLine: Style = {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  };

  const checkbox: Style = {
    height: 20,
    width: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
    backgroundColor: "#2563eb",
    borderWidth: 1,
    borderColor: "#3b82f6",
  };

  const footer: Style = {
    flexDirection: "row",
    gap: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: zinc[800],
    alignSelf: "stretch",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderColor: zinc[700],
  };

  layout.add(
    <view style={container}>
      <view style={menu}>
        <text style={text}>File</text>
        <text style={text}>Edit</text>
        <text style={text}>Run</text>
        <text style={text}>Terminal</text>
        <text style={text}>Window</text>
        <text style={text}>Help↗</text>
      </view>
      <view style={content}>
        <text style={headerText}>Welcome to Red Otter!</text>
        <text style={text}>
          I am a self-contained WebGL flexbox layout engine. I can render
          rectangles, letters and polygons.
        </text>
        <text style={text}>
          I can do flexbox layout, position: absolute, z-index. Everything you
          would expect from a layout engine!
        </text>
        <text style={text}>
          I am also quite not bad at styling: as you can see I can handle
          rounded corners and borders.
        </text>
      </view>
      <view style={footer}>
        <text style={text}>main*</text>
        <text style={text}>Ln: 1257, Col 38</text>
        <text style={text}>UTF-8</text>
        <text style={text}>LF</text>
        <text style={text}>TypeScript</text>
      </view>
      <view style={overlay}>
        <view style={dialog}>
          <view style={headerLine}>
            <text style={headerText}>This is a modal</text>
            <view style={closeButton}>
              <shape
                type="polygon"
                color={"#fff"}
                points={[
                  [3, 4],
                  [4, 3],
                  [8, 7],
                  [12, 3],
                  [13, 4],
                  [9, 8],
                  [13, 12],
                  [12, 13],
                  [8, 9],
                  [4, 13],
                  [3, 12],
                  [7, 8],
                ]}
              />
            </view>
          </view>
          <view style={separator} />
          <view style={paragraphs}>
            <text style={text}>
              All elements here take part in automatic layout.
            </text>
            <text style={text}>No manually typed sizes or positions.</text>
            <text style={text}>Everything is rendered by the library.</text>
            <view style={checkboxLine}>
              <view style={checkbox}>
                <shape
                  type="polygon"
                  color="#fff"
                  points={[
                    [3.5, 7],
                    [6.5, 10],
                    [12.5, 4],
                    [14, 5.5],
                    [6.5, 13],
                    [2, 8.5],
                  ]}
                />
              </view>
              <text style={text}>Even the tick icon.</text>
            </view>
          </view>
          <view style={separator} />
          <view style={row}>
            <view style={buttonSecondary}>
              <text style={buttonText}>Cancel</text>
            </view>
            <view style={buttonPrimary}>
              <text style={buttonPrimaryText}>Confirm</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  );

  layout.render();
  context.flush();
});
