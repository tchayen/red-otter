import { NewContext, Context, Font, Layout, Style, TextStyle } from "../../src";

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

export function textExample(canvas: HTMLCanvasElement, font: Font): void {
  const context = new Context(canvas, font);
  context.clear();
  const layout = new Layout(context, { readCSSVariables: true });

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

  layout.render();
  context.flush();
}

export function justifyContentExample(
  canvas: HTMLCanvasElement,
  font: Font
): void {
  const context = new Context(canvas, font);
  context.clear();
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

  const red = {
    width: 80,
    height: 40,
    backgroundColor: "#eb584e",
  };

  const orange = {
    width: 80,
    height: 40,
    backgroundColor: "#ef8950",
  };

  const yellow = {
    width: 80,
    height: 40,
    backgroundColor: "#efaf50",
  };

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
      <text style={text}>justifyContent: "space-around"</text>
      <view style={[row, { justifyContent: "space-around" }]}>
        <view style={red} />
        <view style={orange} />
        <view style={yellow} />
      </view>
      <text style={text}>justifyContent: "space-evenly"</text>
      <view style={[row, { justifyContent: "space-evenly" }]}>
        <view style={[red, { flex: 1 }]} />
        <view style={orange} />
        <view style={yellow} />
      </view>
    </view>
  );

  layout.render();
  context.flush();
}

export function alignItemsExample(canvas: HTMLCanvasElement, font: Font): void {
  const context = new Context(canvas, font);
  context.clear();
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

  layout.render();
  context.flush();
}

export function alignSelfExample(canvas: HTMLCanvasElement, font: Font): void {
  const context = new Context(canvas, font);
  context.clear();
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
            paddingLeft: 20,
            backgroundColor: "#ef8950",
            height: 60,
            justifyContent: "center",
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

  layout.render();
  context.flush();
}

export function flexExample(canvas: HTMLCanvasElement, font: Font): void {
  const context = new Context(canvas, font);
  context.clear();
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

  layout.render();
  context.flush();
}

export function percentageSizeExample(
  canvas: HTMLCanvasElement,
  font: Font
): void {
  const context = new Context(canvas, font);
  context.clear();
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

  layout.render();
  context.flush();
}

export function positionRelativeExample(
  canvas: HTMLCanvasElement,
  font: Font
): void {
  const context = new Context(canvas, font);
  context.clear();
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

  layout.render();
  context.flush();
}

export function paddingMarginAndGapExample(
  canvas: HTMLCanvasElement,
  font: Font
): void {
  const context = new Context(canvas, font);
  context.clear();
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
      <view
        style={{
          backgroundColor: zinc[800],
        }}
      >
        <view
          style={{
            backgroundColor: zinc[500],
            marginHorizontal: 20,
          }}
        >
          <text style={text}>marginHorizontal: 20</text>
        </view>
        <view
          style={{
            backgroundColor: zinc[700],
            marginTop: 40,
            gap: 20,
          }}
        >
          <text style={text}>marginTop: 40</text>
          <text style={text}>gap: 20</text>
          <view style={{ padding: 20, backgroundColor: "#eb584e" }}>
            <text style={text}>padding: 20</text>
          </view>
          <view style={{ padding: 20, backgroundColor: "#ef8950" }}>
            <text style={text}>padding: 20</text>
          </view>
          <view style={{ padding: 20, backgroundColor: "#efaf50" }}>
            <text style={text}>padding: 20</text>
          </view>
        </view>
      </view>
    </view>
  );

  layout.render();
  context.flush();
}
export function positionAbsoluteAndZIndexExample(
  canvas: HTMLCanvasElement,
  font: Font
): void {
  const context = new Context(canvas, font);
  context.clear();
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    padding: 20,
  };

  const wrapper: Style = {
    flexDirection: "row",
    gap: 40,
    padding: 40,
    backgroundColor: zinc[800],
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

  const absoluteBox: Style = {
    backgroundColor: "#ef8950",
    position: "absolute",
    // zIndex: 1,
    right: 0,
    bottom: 0,
  };

  layout.add(
    <view style={container}>
      <view style={wrapper}>
        <view style={[box, { backgroundColor: "#eb584e" }]}>
          <text style={text}>1</text>
        </view>
        <view style={[box, absoluteBox]}>
          <text style={text}>2</text>
        </view>
        <view style={[box, { backgroundColor: "#efaf50" }]}>
          <text style={text}>3</text>
        </view>
      </view>
    </view>
  );

  layout.render();
  context.flush();
}

export function leftRightTopBottomExample(
  canvas: HTMLCanvasElement,
  font: Font
): void {
  const context = new Context(canvas, font);
  context.clear();
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

  const wrapper: Style = {
    flexDirection: "row",
    gap: 20,
    padding: 20,
    backgroundColor: zinc[800],
  };

  const box: Style = {
    width: 120,
    height: 120,
    padding: 20,
    gap: 10,
  };

  layout.add(
    <view style={container}>
      <view style={wrapper}>
        <view style={[box, { backgroundColor: "#eb584e" }]}></view>
        <view
          style={[box, { backgroundColor: "#ef8950", top: -20, left: -20 }]}
        >
          <text style={text}>top: -20</text>
          <text style={text}>left: -20</text>
        </view>
        <view style={[box, { backgroundColor: "#efaf50" }]}></view>
      </view>
      <view
        style={{
          backgroundColor: zinc[700],
          left: 200,
          right: 200,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <text style={text}>left: 200, right: 200, height: 100</text>
      </view>
    </view>
  );

  layout.render();
  context.flush();
}

export function mappingOverArrayExample(
  canvas: HTMLCanvasElement,
  font: Font
): void {
  const context = new Context(canvas, font);
  context.clear();
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    padding: 20,
  };

  const headerCell: Style = {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: zinc[700],
  };

  const headerText: TextStyle = {
    fontFamily: font,
    fontSize: 14,
    color: "#fff",
  };

  const cellText: TextStyle = {
    fontFamily: font,
    color: zinc[400],
    fontSize: 14,
  };

  const data = [
    { id: 1, name: "One", createdAt: "2021-01-01" },
    { id: 2, name: "Two", createdAt: "2021-01-02" },
    { id: 3, name: "Three", createdAt: "2021-01-03" },
    { id: 4, name: "Four", createdAt: "2021-01-04" },
    { id: 5, name: "Five", createdAt: "2021-01-05" },
    { id: 6, name: "Six", createdAt: "2021-01-06" },
    { id: 7, name: "Seven", createdAt: "2021-01-07" },
    { id: 8, name: "Eight", createdAt: "2021-01-08" },
    { id: 9, name: "Nine", createdAt: "2021-01-09" },
    { id: 10, name: "Ten", createdAt: "2021-01-10" },
    { id: 11, name: "Eleven", createdAt: "2021-01-11" },
    { id: 12, name: "Twelve", createdAt: "2021-01-12" },
    { id: 13, name: "Thirteen", createdAt: "2021-01-13" },
    { id: 14, name: "Fourteen", createdAt: "2021-01-14" },
    { id: 15, name: "Fifteen", createdAt: "2021-01-15" },
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
              <view style={headerCell}>
                <text style={headerText}>{title}</text>
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
                    <text style={cellText}>{content}</text>
                  </view>
                );
              })}
            </view>
          );
        })}
      </view>
    </view>
  );

  layout.render();
  context.flush();
}

export async function polygonsExample(
  canvas: HTMLCanvasElement,
  font: Font
): Promise<void> {
  const context = new Context(canvas, font);
  context.clear();
  const response = await fetch("/map.json");
  const map: {
    features: {
      geometry: {
        type: string;
        coordinates: number[][] | number[][][];
      };
      properties: {
        name?: string;
        highway?: string;
        "addr:housenumber"?: string;
      };
    }[];
  } = await response.json();

  const layout = new Layout(context);

  const RADIUS = 6378137.0;

  function degreesToMeters(lat: number, lng: number): { x: number; y: number } {
    return {
      x: (RADIUS * lng * Math.PI) / 180.0,
      y: RADIUS * Math.atanh(Math.sin((lat * Math.PI) / 180.0)),
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const shapes = map.features
    .filter((f) => {
      if (f.geometry.type !== "Polygon" && f.geometry.type !== "LineString") {
        return false;
      }

      return true;
    })
    .map((f) => {
      const isRoad = f.properties.highway !== undefined;

      const coordinates: [number, number][] = isRoad
        ? (f.geometry.coordinates as [number, number][])
        : (f.geometry.coordinates[0] as [number, number][]);

      return {
        name: isRoad ? f.properties.name : f.properties["addr:housenumber"],
        type: isRoad ? "road" : "building",
        points: coordinates.map(([lon, lat]) => {
          const { x, y } = degreesToMeters(lat, lon);
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          return { x, y };
        }),
      };
    })
    .map((polygon) => {
      const points = polygon.points.map(({ x, y }) => {
        return [
          ((x - minX) / (maxX - minX)) * 800,
          (1 - (y - minY) / (maxY - minY)) * 600,
        ] as [number, number];
      });

      return {
        name: polygon.name,
        type: polygon.type,
        center: {
          x: points.reduce((acc, [x]) => acc + x, 0) / points.length,
          y: points.reduce((acc, [, y]) => acc + y, 0) / points.length,
        },
        points,
      };
    });

  const container: Style = {
    width: "100%",
    height: "100%",
    backgroundColor: zinc[800],
  };

  const absolute: Style = {
    position: "absolute",
    width: "100%",
    height: "100%",
  };

  layout.add(
    <view style={container}>
      {shapes.map((shape) => {
        if (shape.type === "building") {
          return (
            <view style={absolute}>
              <view
                style={{
                  position: "absolute",
                  left: Math.min(...shape.points.map((p) => p[0])),
                  top: Math.min(...shape.points.map((p) => p[1])),
                }}
              >
                <shape
                  type="polygon"
                  points={shape.points.reverse()}
                  color={zinc[600]}
                />
              </view>
              <view
                style={{
                  position: "absolute",
                  left: shape.center.x,
                  top: shape.center.y,
                  zIndex: 1,
                }}
              >
                <text style={{ fontFamily: font, color: "#fff", fontSize: 20 }}>
                  {shape.name}
                </text>
              </view>
            </view>
          );
        }

        if (shape.type === "road") {
          return (
            <view style={absolute}>
              <view
                style={{
                  position: "absolute",
                  left: Math.min(...shape.points.map((p) => p[0])),
                  top: Math.min(...shape.points.map((p) => p[1])),
                }}
              >
                <shape
                  type="line"
                  points={shape.points.reverse()}
                  thickness={4}
                  color={zinc[700]}
                />
              </view>
            </view>
          );
        }
      })}
    </view>
  );

  layout.render();
  context.flush();
}

export function landingExample(canvas: HTMLCanvasElement, font: Font): void {
  const context = new NewContext(canvas, font);
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
    borderRadius: 16,
    height: 32,
    borderWidth: 1,
    borderColor: zinc[500],
  };

  const buttonText: TextStyle = {
    color: zinc[100],
    fontFamily: font,
    fontSize: 16,
  };

  const buttonPrimary: Style = {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "--yellow",
    borderRadius: 16,
    height: 32,
  };

  const buttonPrimaryText: TextStyle = {
    color: "#000",
    fontFamily: font,
    fontSize: 16,
  };

  const checkboxLine: Style = {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  };

  const checkbox: Style = {
    height: 16,
    width: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
    backgroundColor: "--yellow",
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
                  color="#000"
                  points={[
                    [3.5, 6.5],
                    [6.5, 9.5],
                    [12.5, 3.5],
                    [14, 5],
                    [6.5, 12.5],
                    [2, 8],
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
}

export function borderRadiusAndBorderWidthExample(
  canvas: HTMLCanvasElement,
  font: Font
): void {
  const context = new NewContext(canvas, font);
  context.clear();
  const layout = new Layout(context, { readCSSVariables: true });

  const text: TextStyle = {
    fontFamily: font,
    fontSize: 14,
    color: "#fff",
  };

  layout.add(
    <view
      style={{
        padding: 20,
        gap: 20,
      }}
    >
      <view
        style={{
          backgroundColor: zinc[700],
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 2,
          borderColor: "--yellow",
          borderRadiusTop: 8,
        }}
      >
        <text style={text}>This is a view with a border</text>
      </view>
      <view
        style={{
          backgroundColor: zinc[600],
          width: 240,
          height: 120,
          padding: 20,
          borderColor: zinc[400],
          borderBottomWidth: 2,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderTopWidth: 8,
          borderRadiusTopLeft: 2,
          borderRadiusTopRight: 4,
          borderRadiusBottomLeft: 8,
          borderRadiusBottomRight: 16,
          gap: 8,
        }}
      >
        <text style={text}>This is a view where each</text>
        <text style={text}>corner and edge have different</text>
        <text style={text}>border and radius</text>
      </view>
    </view>
  );

  layout.render();
  context.flush();
}

export const fixtures = [
  {
    callback: landingExample,
    title: "First example",
    description:
      "Example layout made with <code>red-otter</code>. Everything is rendered using the library.",
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
    callback: leftRightTopBottomExample,
    title: "Left, right, top, bottom",
    description:
      "If element has <code>position: relative</code>, it will take part in the layout together with siblings and then will be offset by the coordinates.</p><p>If element has <code>position: absolute</code>, it will not take part in the layout and will be positioned relative to the parent's edges according to those coordinates.</p><p>If two opposing coordinates are specified (e.g. <code>left</code> and <code>right</code>) and element has no size specified in that dimension (<code>width: undefined</code>), the element will be stretched to fill the space between them.",
  },
  {
    callback: paddingMarginAndGapExample,
    title: "Padding, margin and gap",
    description:
      "Padding and margin are used to add space around elements. Padding is inside element, margin is outside. Gap is used to add space between children of a parent along the main axis.",
  },
  {
    callback: mappingOverArrayExample,
    title: "Mapping over array",
    description:
      "As in regular JSX, it's possible to map over an array of elements.",
  },
  {
    callback: polygonsExample,
    title: "Polygons",
    description:
      'Example of drawing arbitrary shapes – here a map from <a href="https://www.openstreetmap.org/#map=18/60.26608/24.98888" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> data with building numbers overlayed on top of their shapes.',
  },
  {
    callback: borderRadiusAndBorderWidthExample,
    title: "Border radius and border width",
    description:
      "Border radius can be specified for each corner individually, or for all corners at once. Border width similarly can be specified for each edge or for all at once. You also need to specify <code>borderColor</code> to see the border.",
  },
];
