import { format } from "date-fns";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const interRegular = fetch(new URL("../../public/Inter-Regular.otf", import.meta.url)).then((res) =>
  res.arrayBuffer(),
);

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const interRegularData = await interRegular;

  const { searchParams } = new URL(request.url);

  const hasTitle = searchParams.has("title");
  const title = hasTitle ? searchParams.get("title")?.slice(0, 128) : "Hmm";

  const hasDate = searchParams.has("publishedTime");
  const publishedTime = searchParams.get("publishedTime");

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#000",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter",
          height: "100%",
          justifyContent: "center",
          padding: "0 72px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#787F85",
            fontSize: 56,
            fontWeight: 400,
            marginBottom: 40,
          }}
        >
          Tomasz Czajecki
        </div>
        <div
          style={{
            color: "#FFF",
            display: "flex",
            fontSize: 80,
            fontWeight: 400,
            marginBottom: 40,
          }}
        >
          {title}
        </div>
        {hasDate && (
          <div
            style={{
              color: "#787F85",
              display: "flex",
              fontSize: 42,
              fontWeight: 400,
            }}
          >
            {format(new Date(publishedTime!), "MMMM d, yyyy")}
          </div>
        )}
      </div>
    ),
    {
      fonts: [
        {
          data: interRegularData,
          name: "Inter",
          style: "normal",
          weight: 400,
        },
      ],
      height: 630,
      width: 1200,
    },
  );
}
