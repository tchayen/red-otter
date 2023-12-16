import { format } from "date-fns";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const interSemiBold = fetch(new URL("../../public/Inter-SemiBold.otf", import.meta.url));

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const interSemiBoldData = await interSemiBold.then((res) => res.arrayBuffer());

  const { searchParams } = new URL(request.url);

  const hasTitle = searchParams.has("title");
  const title = hasTitle ? searchParams.get("title")?.slice(0, 128) : "Hmm";

  const hasDate = searchParams.has("publishedTime");
  const publishedTime = searchParams.get("publishedTime");

  const logo = (
    <svg
      width="160"
      height="160"
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_9_36)">
        <path
          d="M103.801 259.323C99.9953 272.595 88.0875 280.825 77.2043 277.704C66.321 274.583 60.5836 261.294 64.3893 248.022C68.1951 234.749 80.1029 226.52 90.9861 229.641C101.869 232.761 107.607 246.051 103.801 259.323Z"
          fill="#FFBEA2"
        />
        <path
          d="M409.988 210.846C418.863 221.423 419.027 235.897 410.353 243.174C401.68 250.452 387.455 247.777 378.58 237.2C369.705 226.624 369.541 212.15 378.214 204.872C386.887 197.595 401.113 200.269 409.988 210.846Z"
          fill="#FFBEA2"
        />
        <path
          d="M195.525 166.82C286.823 144.105 375.178 182.444 419.269 255.425C463.361 328.405 438.146 459.25 438.146 459.25C795.823 757.389 983.145 497.121 880.721 166.82C1383.55 863.924 403.72 1402 125.833 550.093C80.321 517.538 50.076 444.226 47.9437 369.492C45.8113 294.758 104.227 189.535 195.525 166.82Z"
          fill="url(#paint0_linear_9_36)"
        />
        <path
          d="M322.643 353.55C293.098 352.6 281.995 353.818 241.386 363.019C200.776 372.22 171.258 387.883 156.732 404.284C142.207 420.685 120.372 448.233 148.072 483.464C175.771 518.694 264.385 530.1 269.253 452.673C340.925 498.992 382.664 445.942 381.588 407.383C380.512 368.823 352.189 354.5 322.643 353.55Z"
          fill="url(#paint1_linear_9_36)"
        />
        <path
          d="M276.43 340.441C261.662 342.968 261.662 342.968 255.068 344.198L255.068 344.198C248.473 345.428 237.483 347.478 227.383 351.863C217.282 356.249 213.968 375.065 221.443 387.091C228.917 399.117 251.91 415.073 259.6 417.278C267.29 419.483 275.804 422.444 286.529 410.435C297.255 398.427 305.927 379.067 304.98 364.231C304.032 349.395 291.2 337.914 276.431 340.441L276.43 340.441Z"
          fill="black"
        />
        <path
          d="M522.719 349.333C439.853 324.529 396.215 324.886 329.627 382.39L334.773 388.027C398.919 332.876 441.176 329.193 522.719 349.333Z"
          fill="black"
        />
        <path
          d="M2.15904 476.101C62.6098 414.232 100.95 393.388 187.067 411.4L185.3 418.825C102.459 401.688 63.714 418.953 2.15904 476.101Z"
          fill="black"
        />
        <path
          d="M495.908 392.043C439.941 383.954 408.287 376.798 350.01 414.706L351.996 420.477C402.45 385.629 436.127 388.358 495.908 392.043Z"
          fill="black"
        />
        <path
          d="M51.9081 500.431C94.44 463.164 117.09 439.923 186.612 439.976L188.089 445.897C126.795 444.15 100.038 464.781 51.9081 500.431Z"
          fill="black"
        />
        <path
          d="M173.098 305.716C172.77 315.099 167.135 322.518 160.512 322.287C153.889 322.055 148.785 314.261 149.113 304.878C149.44 295.495 155.075 288.076 161.699 288.307C168.322 288.539 173.426 296.333 173.098 305.716Z"
          fill="black"
        />
        <path
          d="M336.844 293.372C336.516 302.755 330.881 310.174 324.258 309.943C317.634 309.712 312.53 301.918 312.858 292.534C313.186 283.151 318.821 275.732 325.444 275.964C332.068 276.195 337.171 283.989 336.844 293.372Z"
          fill="black"
        />
        <path
          d="M751.235 558.39C800.496 572.515 833.209 609.143 824.304 640.2C815.398 671.257 768.246 684.983 718.986 670.858C669.726 656.733 637.012 620.105 645.917 589.048C654.823 557.991 701.975 544.265 751.235 558.39Z"
          fill="url(#paint2_linear_9_36)"
        />
        <path
          d="M804.083 702.188C855.279 704.423 895.64 732.402 894.23 764.68C892.821 796.958 850.176 821.312 798.979 819.077C747.783 816.842 707.422 788.863 708.831 756.585C710.241 724.307 752.886 699.953 804.083 702.188Z"
          fill="url(#paint3_linear_9_36)"
        />
        <ellipse
          cx="382.202"
          cy="650.723"
          rx="59.5"
          ry="68.5"
          transform="rotate(16 382.202 650.723)"
          fill="#6F3A3A"
        />
        <path
          d="M131.609 638.3C127.175 606.598 142.383 587.25 159.47 581.563C176.558 575.877 193.467 579.236 220.887 584.683C248.306 590.131 330.856 619.426 347.806 652.474C357.1 670.596 360.268 693.24 312.088 721.449C263.908 749.657 202.314 731.995 177.457 714.241C152.6 696.486 136.043 670.002 131.609 638.3Z"
          fill="url(#paint4_linear_9_36)"
        />
        <path
          d="M515.991 487.101C496.337 463.291 472.67 461.499 457.493 469.944C442.315 478.389 433.686 492.602 419.694 515.649C405.701 538.695 372.745 616.483 385.2 650.068C392.03 668.485 406.068 685.492 457.519 669.612C508.97 653.733 536.545 598.427 540.116 569.184C543.688 539.94 535.644 510.911 515.991 487.101Z"
          fill="url(#paint5_linear_9_36)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_9_36"
          x1="666.895"
          y1="653.88"
          x2="859.203"
          y2="159.909"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#EB584E" />
          <stop offset="1" stop-color="#EFAF50" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_9_36"
          x1="246.687"
          y1="363.259"
          x2="278.97"
          y2="504.634"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FFBEA1" />
          <stop offset="1" stop-color="#F9966C" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_9_36"
          x1="645.917"
          y1="589.048"
          x2="824.304"
          y2="640.2"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FFBEA2" />
          <stop offset="1" stop-color="#F9966C" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_9_36"
          x1="708.831"
          y1="756.585"
          x2="894.23"
          y2="764.68"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FFBEA2" />
          <stop offset="1" stop-color="#F9966C" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_9_36"
          x1="355.722"
          y1="683.207"
          x2="130.786"
          y2="618.708"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FFBEA2" />
          <stop offset="1" stop-color="#F9966C" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_9_36"
          x1="397.832"
          y1="672.395"
          x2="525.27"
          y2="490.995"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FFBEA2" />
          <stop offset="1" stop-color="#F9966C" />
        </linearGradient>
        <clipPath id="clip0_9_36">
          <rect width="1024" height="1024" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#121113",
          backgroundImage: "linear-gradient(180deg, #4e1511 0%, #121113 40%)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter",
          gap: 16,
          height: "100%",
          justifyContent: "center",
          padding: "0 72px",
          width: "100%",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", flexDirection: "row", gap: 32 }}>
          {logo}
          <div
            style={{
              color: "#fff",
              fontSize: 80,
              fontWeight: 600,
              marginTop: 32,
            }}
          >
            Red Otter
          </div>
        </div>
        <div
          style={{
            color: "#FFF",
            display: "flex",
            fontSize: 114,
            fontWeight: 600,
          }}
        >
          {title}
        </div>
        {hasDate && (
          <div
            style={{
              color: "#7c7a85",
              display: "flex",
              fontSize: 48,
              fontWeight: 600,
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
          data: interSemiBoldData,
          name: "Inter",
          style: "normal",
          weight: 600,
        },
      ],
      height: 630,
      width: 1200,
    },
  );
}
