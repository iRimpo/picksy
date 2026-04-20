import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#1B7A3E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Green face background */}
        <div
          style={{
            position: "absolute",
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#229950",
          }}
        />
        {/* Pink face */}
        <div
          style={{
            position: "absolute",
            width: 19,
            height: 19,
            borderRadius: "50%",
            background: "#FF9EC8",
            top: 9,
            left: 6.5,
          }}
        />
        {/* Sparkle star top-left */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 120 120"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <path
            d="M 22 16 L 25 23 L 32 26 L 25 29 L 22 36 L 19 29 L 12 26 L 19 23 Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
