import { Context, Font, Layout, Style, TextStyle } from "red-otter";

import map from "./map.json";

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

export function paddingMarginAndGapExample(context: Context, font: Font) {
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

  return layout;
}
export function positionAbsoluteAndZIndexExample(context: Context, font: Font) {
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
    zIndex: 1,
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

  return layout;
}

export function leftRightTopBottomExample(context: Context, font: Font) {
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

  return layout;
}

export function mappingOverArrayExample(context: Context, font: Font) {
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

  return layout;
}

export function polygonsExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const RADIUS = 6378137.0;

  function degreesToMeters(lat: number, lng: number) {
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
              <view style={{ position: "absolute" }}>
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
              <view style={{ position: "absolute" }}>
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

  return layout;
}

export function complexUIExample(context: Context, font: Font) {
  const layout = new Layout(context);

  const container: Style = {
    width: "100%",
    height: "100%",
    backgroundColor: zinc[900],
    flexDirection: "row",
    alignItems: "stretch",
  };

  const header: Style = {
    height: 32,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: zinc[800],
    alignSelf: "stretch",
  };

  const headerText: TextStyle = {
    fontFamily: font,
    fontSize: 16,
    color: "#fff",
  };

  const sectionsColumn: Style = {
    alignItems: "stretch",
    height: "100%",
  };

  const section: Style = {
    alignItems: "stretch",
  };

  const verticalSeparator: Style = {
    width: 1,
    backgroundColor: zinc[700],
    alignSelf: "stretch",
  };

  const horizontalSeparator: Style = {
    height: 1,
    backgroundColor: zinc[700],
    alignSelf: "stretch",
  };

  // Timeline
  const timeline: Style = {
    alignSelf: "stretch",
    backgroundColor: zinc[900],
    height: 379, // TODO: this is hardcoded.
  };

  const timelineItems: Style = {
    position: "absolute",
    left: 20,
    top: 50,
    height: 83,
    width: 260,
  };

  const timelineItem: Style = {
    position: "absolute",
    height: 20,
    paddingHorizontal: 4,
    justifyContent: "center",
  };

  const timelineInterval: Style = {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: zinc[700],
    top: 33,
  };

  const timelineText: TextStyle = {
    fontFamily: font,
    fontSize: 12,
    color: "#000",
  };

  const timelineHeaderText: TextStyle = {
    fontFamily: font,
    fontSize: 12,
    color: zinc[500],
  };

  // Table
  const table: Style = {
    flexDirection: "row",
  };

  const tableColumn: Style = {
    alignItems: "stretch",
  };

  const tableCell: Style = {
    height: 24,
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: zinc[900],
  };

  const even: Style = {
    backgroundColor: zinc[800],
  };

  const tableHeaderCell: Style = {
    ...tableCell,
    backgroundColor: zinc[800],
  };

  const tableCellText: TextStyle = {
    fontFamily: font,
    fontSize: 14,
    color: zinc[400],
  };

  const tableCellHeaderText: TextStyle = {
    fontFamily: font,
    fontSize: 14,
    color: "#fff",
  };

  const tableCellLinkText: TextStyle = {
    fontFamily: font,
    fontSize: 14,
    color: "#8ab4f8",
  };

  // Settings
  const checkbox: Style = {
    height: 16,
    width: 16,
    backgroundColor: "#8ab4f8",
  };

  const settings: Style = {
    gap: 20,
    padding: 16,
    backgroundColor: zinc[800],
    flex: 1,
    alignSelf: "stretch",
  };

  const settingsOption: Style = {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  };

  const settingsTexts: Style = {
    gap: 8,
  };

  const settingsSubHeaderText: TextStyle = {
    fontFamily: font,
    fontSize: 14,
    color: "#fff",
  };

  const settingsDescriptionText: TextStyle = {
    fontFamily: font,
    fontSize: 12,
    color: zinc[400],
  };

  layout.add(
    <view style={container}>
      <view style={sectionsColumn}>
        <view style={[section, { flex: 1 }]}>
          <view style={header}>
            <text style={headerText}>Timeline</text>
          </view>
          <view style={horizontalSeparator} />
          <view style={timeline}>
            <view style={{ position: "absolute", left: 64, top: 8 }}>
              <text style={timelineHeaderText}>800ms</text>
            </view>
            <view style={{ position: "absolute", left: 141, top: 8 }}>
              <text style={timelineHeaderText}>810ms</text>
            </view>
            <view style={{ position: "absolute", left: 220, top: 8 }}>
              <text style={timelineHeaderText}>820ms</text>
            </view>
            <view style={[timelineInterval, { left: 79 }]} />
            <view style={[timelineInterval, { left: 159 }]} />
            <view style={[timelineInterval, { left: 239 }]} />
            <view style={timelineItems}>
              <view
                style={[
                  timelineItem,
                  { width: 260, backgroundColor: "#899df0" },
                ]}
              >
                <text style={timelineText}>mainAsync</text>
              </view>
              <view
                style={[
                  timelineItem,
                  { width: 205, backgroundColor: "#dc99fc", top: 21, left: 5 },
                ]}
              >
                <text style={timelineText}>loadTexture</text>
              </view>
              <view
                style={[
                  timelineItem,
                  { width: 175, backgroundColor: "#dcbb64", top: 42, left: 15 },
                ]}
              >
                <text style={timelineText}>texImage2D</text>
              </view>
              <view
                style={[
                  timelineItem,
                  { width: 105, backgroundColor: "#6eac72", top: 63, left: 45 },
                ]}
              >
                <text style={timelineText}>Image Decode</text>
              </view>
            </view>
          </view>
        </view>
        <view style={[horizontalSeparator, { backgroundColor: zinc[600] }]} />
        <view style={section}>
          <view style={header}>
            <text style={headerText}>Statistics</text>
          </view>
          <view style={horizontalSeparator} />
          <view style={table}>
            <view style={tableColumn}>
              <view style={tableHeaderCell}>
                <text style={tableCellHeaderText}>Function</text>
              </view>
              <view style={horizontalSeparator} />
              <view style={tableCell}>
                <text style={tableCellText}>Image Decode</text>
              </view>
              <view style={[tableCell, even]}>
                <text style={tableCellText}>texImage2D</text>
              </view>
              <view style={tableCell}>
                <text style={tableCellText}>loadTexture</text>
              </view>
              <view style={[tableCell, even]}>
                <text style={tableCellText}>mainAsync</text>
              </view>
            </view>
            <view style={verticalSeparator} />
            <view style={tableColumn}>
              <view style={tableHeaderCell}>
                <text style={tableCellHeaderText}>Location</text>
              </view>
              <view style={horizontalSeparator} />
              <view style={tableCell}></view>
              <view style={[tableCell, even]}></view>
              <view style={tableCell}>
                <text style={tableCellLinkText}>index.js:449:3</text>
              </view>
              <view style={[tableCell, even]}>
                <text style={tableCellLinkText}>main.ts:5:16</text>
              </view>
            </view>
            <view style={verticalSeparator} />
            <view style={tableColumn}>
              <view style={tableHeaderCell}>
                <text style={tableCellHeaderText}>Total time</text>
              </view>
              <view style={horizontalSeparator} />
              <view style={tableCell}>
                <text style={tableCellText}>10.08ms</text>
              </view>
              <view style={[tableCell, even]}>
                <text style={tableCellText}>16.66ms</text>
              </view>
              <view style={tableCell}>
                <text style={tableCellText}>19.81ms</text>
              </view>
              <view style={[tableCell, even]}>
                <text style={tableCellText}>24.23ms</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view style={[verticalSeparator, { backgroundColor: zinc[600] }]} />
      <view style={[section, { flex: 1 }]}>
        <view style={header}>
          <text style={headerText}>Settings</text>
        </view>
        <view style={horizontalSeparator} />
        <view style={settings}>
          <view style={settingsOption}>
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
            <view style={settingsTexts}>
              <text style={settingsSubHeaderText}>Enable source maps</text>
              <text style={settingsDescriptionText}>
                This might require some changes to your bundler settings.
              </text>
            </view>
          </view>
          <view style={settingsOption}>
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
            <view style={settingsTexts}>
              <text style={settingsSubHeaderText}>Show internal functions</text>
              <text style={settingsDescriptionText}>
                Include browser APIs outside of your source code.
              </text>
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
    callback: complexUIExample,
    title: "Complex UI",
    description:
      "Example of a bit more complex UI. Everything you see in the next screenshot was generated using <code>red-otter</code>.",
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
];
