import {
  Context,
  Font,
  Layout,
  Style,
  TextStyle,
} from "../../packages/red-otter";

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

// TODO:
// restructure it so each example is an object instead of this weird function
// with title and description.

export function textExample(context: Context, font: Font) {
  const layout = new Layout(context);
  const text =
    "Turtle żółw черепаха želva sköldpadda süß Æøñ@ø№→⏎⁂➆§∑¾¤ - - – —";

  // NOTE: this showcases calling layout.text(), which is a direct API. You can
  // alternatively do:
  // ```
  // <text style={{ fontFamily: font, fontSize: 64, color: "#fff" }}>{text}</text>
  // ```
  layout.text(text, font, 64, "#fff", 0, 0);
  layout.text(text, font, 32, "#fff", 0, 60);
  layout.text(text, font, 16, "#fff", 0, 100);
  layout.text(text, font, 12, "#fff", 0, 130);
  layout.text(text, font, 10, "#fff", 0, 150);
  return layout;
}

export function justifyContentExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    gap: 20,
    padding: 20,
    alignItems: "stretch",
  };

  const row: Style = {
    flexDirection: "row",
    gap: 20,
  };

  const text: TextStyle = {
    fontFamily: font,
  };

  const red = { width: 80, height: 80, backgroundColor: "#eb584e" };
  const orange = { width: 80, height: 80, backgroundColor: "#ef8950" };
  const yellow = { width: 80, height: 80, backgroundColor: "#efaf50" };

  layout.add(
    <view style={container}>
      <text style={text}>justifyContent: "start"</text>
      <view style={[row, { justifyContent: "flex-start" }]}>
        <view style={red} />
        <view style={orange} />
        <view style={yellow} />
      </view>
      <text style={text}>justifyContent: "center"</text>
      <view style={[row, { justifyContent: "center" }]}>
        <view style={red} />
        <view style={orange} />
        <view style={yellow} />
      </view>
      <text style={text}>justifyContent: "end"</text>
      <view style={[row, { justifyContent: "flex-end" }]}>
        <view style={red} />
        <view style={orange} />
        <view style={yellow} />
      </view>
      <text style={text}>justifyContent: "space-between"</text>
      <view style={[row, { justifyContent: "space-between" }]}>
        <view style={red} />
        <view style={orange} />
        <view style={yellow} />
      </view>
    </view>
  );

  return layout;
}

export function alignItemsExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    alignItems: "stretch",
    gap: 20,
    padding: 20,
  };

  const row: Style = {
    flexDirection: "row",
    gap: 20,
  };

  const text: TextStyle = {
    fontFamily: font,
  };

  layout.add(
    <view style={container}>
      <text style={text}>alignItems: "start"</text>
      <view style={[row, { alignItems: "flex-start" }]}>
        <view style={{ flex: 1, backgroundColor: "#eb584e", height: 40 }} />
        <view style={{ flex: 1, backgroundColor: "#ef8950", height: 60 }} />
        <view style={{ flex: 1, backgroundColor: "#efaf50", height: 80 }} />
      </view>
      <text style={text}>alignItems: "center"</text>
      <view style={[row, { alignItems: "center" }]}>
        <view style={{ flex: 1, backgroundColor: "#eb584e", height: 40 }} />
        <view style={{ flex: 1, backgroundColor: "#ef8950", height: 60 }} />
        <view style={{ flex: 1, backgroundColor: "#efaf50", height: 80 }} />
      </view>
      <text style={text}>alignItems: "end"</text>
      <view style={[row, { alignItems: "flex-end" }]}>
        <view style={{ flex: 1, backgroundColor: "#eb584e", height: 40 }} />
        <view style={{ flex: 1, backgroundColor: "#ef8950", height: 60 }} />
        <view style={{ flex: 1, backgroundColor: "#efaf50", height: 80 }} />
      </view>
      <text style={text}>alignItems: "stretch"</text>
      <view style={[row, { alignItems: "stretch" }]}>
        <view style={{ flex: 1, backgroundColor: "#eb584e", height: 40 }} />
        <view style={{ flex: 1, padding: 20, backgroundColor: "#ef8950" }}>
          <text style={{ fontFamily: font }}>height: undefined</text>
        </view>
        <view
          style={{
            flex: 1,
            padding: 20,
            backgroundColor: "#efaf50",
            height: 80,
          }}
        >
          <text style={{ fontFamily: font }}>height: 80</text>
        </view>
      </view>
    </view>
  );

  return layout;
}

export function alignSelfExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    alignItems: "stretch",
    gap: 20,
    padding: 20,
  };

  const row: Style = {
    flexDirection: "row",
    gap: 20,
    height: 120,
    alignItems: "flex-start",
  };

  const text: TextStyle = {
    fontFamily: font,
  };

  layout.add(
    <view style={container}>
      <view style={row}>
        <view
          style={{
            flex: 1,
            padding: 20,
            backgroundColor: "#eb584e",
            height: 60,
          }}
        />
        <view
          style={{
            flex: 1,
            padding: 20,
            backgroundColor: "#ef8950",
            height: 60,
            justifyContent: "center", // TODO: this is ignored because of the stretch.
            alignSelf: "stretch",
          }}
        >
          <text style={text}>alignSelf: "stretch"</text>
        </view>
        <view
          style={{
            flex: 1,
            paddingLeft: 20,
            backgroundColor: "#efaf50",
            height: 60,
            justifyContent: "center",
            alignSelf: "flex-end",
          }}
        >
          <text style={text}>alignSelf: "end"</text>
        </view>
      </view>
    </view>
  );

  return layout;
}

export function flexExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    alignItems: "stretch",
    gap: 20,
    padding: 20,
  };

  const row: Style = {
    flexDirection: "row",
    gap: 20,
  };

  const text: TextStyle = {
    fontFamily: font,
  };

  layout.add(
    <view style={container}>
      <text style={text}>flex: 1</text>
      <view style={row}>
        <view style={{ height: 100, flex: 1, backgroundColor: "#eb584e" }} />
        <view style={{ height: 100, flex: 1, backgroundColor: "#ef8950" }} />
        <view style={{ height: 100, flex: 1, backgroundColor: "#efaf50" }} />
      </view>
      <text style={text}>flex: 1, 2, 3</text>
      <view style={row}>
        <view style={{ height: 100, flex: 1, backgroundColor: "#eb584e" }} />
        <view style={{ height: 100, flex: 2, backgroundColor: "#ef8950" }} />
        <view style={{ height: 100, flex: 3, backgroundColor: "#efaf50" }} />
      </view>
      <text style={text}>width: 200, flex: 1, 2</text>
      <view style={row}>
        <view style={{ height: 100, width: 200, backgroundColor: "#eb584e" }} />
        <view style={{ height: 100, flex: 2, backgroundColor: "#ef8950" }} />
        <view style={{ height: 100, flex: 1, backgroundColor: "#efaf50" }} />
      </view>
    </view>
  );
  return layout;
}

export function percentageSizeExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    padding: 20,
    gap: 20,
  };

  const text: TextStyle = {
    fontFamily: font,
  };

  layout.add(
    <view style={container}>
      <view
        style={{
          padding: 5,
          width: 120,
          height: "50%",
          backgroundColor: "#eb584e",
        }}
      >
        <text style={text}>height: "50%"</text>
      </view>
      <view
        style={{
          padding: 5,
          width: 120,
          height: "30%",
          backgroundColor: "#ef8950",
        }}
      >
        <text style={text}>height: "30%"</text>
      </view>
      <view
        style={{
          padding: 5,
          width: 120,
          height: "5%",
          backgroundColor: "#efaf50",
        }}
      >
        <text style={text}>height: "5%"</text>
      </view>
    </view>
  );

  return layout;
}

export function positionRelativeExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    padding: 20,
  };

  const text: TextStyle = {
    fontFamily: font,
  };

  layout.add(
    <view style={container}>
      <view style={{ backgroundColor: zinc[900] }}>
        <view style={{ padding: 20, backgroundColor: zinc[800] }}>
          <text style={text}>Hello, welcome to my layout</text>
        </view>
        <view style={{ padding: 20, backgroundColor: zinc[700] }}>
          <text style={text}>Components have automatic layout</text>
        </view>
        <view
          style={{
            flexDirection: "row",
            padding: 20,
            backgroundColor: zinc[600],
          }}
        >
          <view style={{ padding: 20, backgroundColor: "#eb584e" }}>
            <text style={text}>One</text>
          </view>
          <view style={{ padding: 20, backgroundColor: "#ef8950" }}>
            <text style={text}>Two</text>
          </view>
          <view style={{ padding: 20, backgroundColor: "#efaf50" }}>
            <text style={text}>Three</text>
          </view>
        </view>
      </view>
    </view>
  );

  return layout;
}

export function positionAbsoluteAndZIndexExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    padding: 20,
  };

  const text: TextStyle = {
    fontFamily: font,
    color: "#fff",
  };

  const box: Style = {
    width: 120,
    height: 120,
    padding: 20,
  };

  layout.add(
    <view style={container}>
      <view
        style={{
          flexDirection: "row",
          gap: 40,
          padding: 40,
          backgroundColor: zinc[700],
        }}
      >
        <view style={[box, { backgroundColor: "#eb584e" }]}>
          <text style={text}>1</text>
        </view>
        <view
          style={[
            box,
            {
              backgroundColor: "#ef8950",
              position: "absolute",
              zIndex: 1,
              right: 0,
              bottom: 0,
            },
          ]}
        >
          <text style={text}>2</text>
        </view>
        <view style={[box, { backgroundColor: "#efaf50" }]}>
          <text style={text}>3</text>
        </view>
      </view>
    </view>
  );

  return layout;
}

export function mappingOverArrayExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    padding: 20,
  };

  const data = [
    { id: 1, name: "One", createdAt: "2021-01-01" },
    { id: 2, name: "Two", createdAt: "2021-01-02" },
    { id: 3, name: "Three", createdAt: "2021-01-03" },
    { id: 4, name: "Four", createdAt: "2021-01-04" },
    { id: 5, name: "Five", createdAt: "2021-01-05" },
  ];

  const columns: { key: keyof (typeof data)[0]; title: string }[] = [
    { key: "id", title: "ID" },
    { key: "name", title: "Name" },
    { key: "createdAt", title: "Created" },
  ];

  layout.add(
    <view style={container}>
      <view style={{ flexDirection: "row" }}>
        {columns.map(({ key, title }) => {
          return (
            <view style={{ alignItems: "stretch" }}>
              <view
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: zinc[700],
                }}
              >
                <text style={{ fontFamily: font, fontSize: 14, color: "#fff" }}>
                  {title}
                </text>
              </view>
              {data.map((item, rowIndex) => {
                let content = String(item[key]);
                if (key === "createdAt") {
                  content = new Date(content).toLocaleDateString();
                }

                return (
                  <view
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor:
                        rowIndex % 2 === 0 ? zinc[800] : zinc[900],
                    }}
                  >
                    <text
                      style={{
                        fontFamily: font,
                        color: zinc[400],
                        fontSize: 14,
                      }}
                    >
                      {content}
                    </text>
                  </view>
                );
              })}
            </view>
          );
        })}
      </view>
    </view>
  );
  return layout;
}

export function editorUIExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    backgroundColor: zinc[900],
  };

  const pane: Style = {
    width: 300,
    height: "100%",
    padding: 4,
    gap: 4,
    alignItems: "stretch",
  };

  const sectionStyle: Style = {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 4,
    paddingLeft: 8,
  };

  const headerStyle: Style = {
    height: 24,
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 6,
    flexDirection: "row",
  };

  const textPrimary: TextStyle = {
    fontFamily: font,
    fontSize: 12,
    color: zinc[50],
  };

  const textSecondary: TextStyle = {
    fontFamily: font,
    fontSize: 12,
    color: zinc[500],
  };

  const input: Style = {
    height: 24,
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: zinc[900],
    paddingHorizontal: 8,
    width: 48,
  };

  const dropdown: Style = {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: zinc[700],
    paddingHorizontal: 8,
    gap: 8,
    width: "100%",
  };

  const dropdownItem: Style = {
    height: 24,
    justifyContent: "center",
    paddingHorizontal: 8,
    width: "100%",
  };

  const row = () => (
    <view
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      <text style={textSecondary}>X</text>
      <view style={input}>
        <text style={textPrimary}>0.0</text>
      </view>
      <text style={textSecondary}>Y</text>
      <view style={input}>
        <text style={textPrimary}>0.0</text>
      </view>
      <text style={textSecondary}>Z</text>
      <view style={input}>
        <text style={textPrimary}>0.0</text>
      </view>
    </view>
  );

  const triangle = () => (
    <shape
      points={[
        [0, 0],
        [5, 8],
        [10, 0],
      ]}
      color={zinc[500]}
    />
  );

  const header = (title: string) => (
    <view style={headerStyle}>
      {triangle()}
      {/* <Triangle /> */}
      <text style={textPrimary}>{title}</text>
    </view>
  );

  layout.add(
    <view style={container}>
      <view style={pane}>
        <view style={{ backgroundColor: zinc[800] }}>
          {header("Transform")}
          <view style={sectionStyle}>
            <view style={{ gap: 4 }}>
              <view style={{ height: 24, justifyContent: "center" }}>
                <text style={textSecondary}>Translate</text>
              </view>
              <view style={{ height: 24, justifyContent: "center" }}>
                <text style={textSecondary}>Rotate</text>
              </view>
              <view style={{ height: 24, justifyContent: "center" }}>
                <text style={textSecondary}>Scale</text>
              </view>
            </view>
            <view style={{ gap: 4 }}>
              {row()}
              {row()}
              {row()}
            </view>
          </view>
        </view>
        <view style={{ backgroundColor: zinc[800] }}>
          {header("Light")}
          <view
            style={{
              flexDirection: "row",
              width: "100%",
              padding: 4,
              paddingLeft: 8,
              gap: 8,
            }}
          >
            <view style={{ gap: 4 }}>
              <view style={{ height: 24, justifyContent: "center" }}>
                <text style={textSecondary}>Type</text>
              </view>
              <view style={{ height: 24, justifyContent: "center" }}>
                <text style={textSecondary}>Shadows</text>
              </view>
              <view style={{ height: 24, justifyContent: "center" }}>
                <text style={textSecondary}>Method</text>
              </view>
            </view>
            <view style={{ gap: 4, flex: 1 }}>
              <view style={dropdown}>
                <text style={textPrimary}>Directional</text>
                {triangle()}
              </view>
              <view style={dropdown}>
                <text style={textPrimary}>On</text>
                {triangle()}
              </view>
              <view style={dropdown}>
                <text style={textPrimary}>PCSS</text>
                {triangle()}
                <view
                  style={{
                    position: "absolute",
                    zIndex: 1,
                    width: "100%",
                    backgroundColor: zinc[700],
                    top: 25,
                    right: 0,
                  }}
                >
                  <view style={dropdownItem}>
                    <text style={textPrimary}>PFC</text>
                  </view>
                  <view style={[dropdownItem, { backgroundColor: "#2563eb" }]}>
                    <text style={textPrimary}>PCSS</text>
                  </view>
                  <view style={dropdownItem}>
                    <text style={textPrimary}>VSM</text>
                  </view>
                  <view style={dropdownItem}>
                    <text style={textPrimary}>ESM</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view style={{ backgroundColor: zinc[800] }}>
          {header("Export")}
          <view
            style={{
              padding: 4,
              gap: 4,
              flexDirection: "column",
            }}
          >
            <view style={[dropdown, { width: undefined }]}>
              <text style={textPrimary}>1x</text>
              {triangle()}
            </view>
            <view
              style={{
                paddingHorizontal: 12,
                height: 24,
                backgroundColor: zinc[600],
                justifyContent: "center",
              }}
            >
              <text style={textPrimary}>Export</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  );

  return layout;
}

export const fixtures = [
  {
    callback: editorUIExample,
    title: "Editor UI",
    description: "Example of a bit more complex UI.",
  },
  {
    callback: textExample,
    title: "Text",
    description:
      "Simple showcase of text rendering. Note that text is using cap height for measuring text height, so some diacritic marks, or letters like 'g' will be cut off and this is intentional behavior. The biggest text is 33% larger than the source font atlas texture, showing upscaling capabilities.",
  },
  {
    callback: justifyContentExample,
    title: "Justify content",
    description: "Place content along the main axis.",
  },
  {
    callback: alignItemsExample,
    title: "Align items",
    description:
      "Place content along the cross axis. Stretch makes item fill cross axis of parent if <code>width</code>/<code>height</code> is not specified.",
  },
  {
    callback: alignSelfExample,
    title: "Align self",
    description: "Override parent's <code>alignItems</code> property.",
  },
  {
    callback: flexExample,
    title: "Flex",
    description:
      "Example of <code>flex</code> property. Note that flex takes precedence over <code>width</code>.",
  },
  {
    callback: percentageSizeExample,
    title: "Percentage size",
    description:
      "Size can be specified in percentage. It is relative to the parent size and does not take into account padding or gaps.",
  },
  {
    callback: positionRelativeExample,
    title: "Position relative",
    description:
      "By default elements take part in automatic layout calculation.",
  },
  {
    callback: positionAbsoluteAndZIndexExample,
    title: "Position absolute and z index",
    description:
      "Position absolute makes element skip taking part in the layout calculation and positions it relatively to the parent. <code>zIndex</code> is used to declare that element should skip the order and be higher or lower than siblings.",
  },
  {
    callback: mappingOverArrayExample,
    title: "Mapping over array",
    description: "TODO",
  },
];
