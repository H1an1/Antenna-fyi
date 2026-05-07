import type { ComponentPropsWithoutRef } from "react";

const engravedCornerPaths = {
  tl: "M22.875 1.32056H9.375V0H0V9.375H1.3125V22.5H0V36H1.5V24H4.125V36H4.875V24H9.375V12.8749H12.75V9.375H24.375V4.875H36V4.125H24.375V1.5H36V0H22.875V1.32056ZM7.875 22.5H4.875V12.8752H7.875V22.5ZM7.875 12.1252H4.125V22.5H1.6875V9.375H7.875V12.1252ZM12 12.1249H9.375V9.375H12V12.1249ZM22.875 7.875H12.75V4.875H22.875V7.875ZM22.875 4.125H12V7.875H9.375V1.69556H22.875V4.125ZM7.875 7.875H1.5V1.5H7.875V7.875Z",
  tr: "M13.125 1.32056H26.625V0H36V9.375H34.6875V22.5H36V36H34.5V24H31.875V36H31.125V24H26.625V12.8749H23.25V9.375H11.625V4.875H0V4.125H11.625V1.5H0V0H13.125V1.32056ZM28.125 22.5H31.125V12.8752H28.125V22.5ZM28.125 12.1252H31.875V22.5H34.3125V9.375H28.125V12.1252ZM24 12.1249H26.625V9.375H24V12.1249ZM13.125 7.875H23.25V4.875H13.125V7.875ZM13.125 4.125H24V7.875H26.625V1.69556H13.125V4.125ZM28.125 7.875H34.5V1.5H28.125V7.875Z",
  bl: "M22.875 34.6794H9.375V36H0V26.625H1.3125V13.5H0V0H1.5V12H4.125V0H4.875V12H9.375V23.1251H12.75V26.625H24.375V31.125H36V31.875H24.375V34.5H36V36H22.875V34.6794ZM7.875 13.5H4.875V23.1248H7.875V13.5ZM7.875 23.8748H4.125V13.5H1.6875V26.625H7.875V23.8748ZM12 23.8751H9.375V26.625H12V23.8751ZM22.875 28.125H12.75V31.125H22.875V28.125ZM22.875 31.875H12V28.125H9.375V34.3044H22.875V31.875ZM7.875 28.125H1.5V34.5H7.875V28.125Z",
  br: "M13.125 34.6794H26.625V36H36V26.625H34.6875V13.5H36V0H34.5V12H31.875V0H31.125V12H26.625V23.1251H23.25V26.625H11.625V31.125H0V31.875H11.625V34.5H0V36H13.125V34.6794ZM28.125 13.5H31.125V23.1248H28.125V13.5ZM28.125 23.8748H31.875V13.5H34.3125V26.625H28.125V23.8748ZM24 23.8751H26.625V26.625H24V23.8751ZM13.125 28.125H23.25V31.125H13.125V28.125ZM13.125 31.875H24V28.125H26.625V34.3044H13.125V31.875ZM28.125 28.125H34.5V34.5H28.125V28.125Z",
} as const;

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function EngravedCorner({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg
      className={`engraved-frame-corner engraved-frame-corner-${corner}`}
      viewBox="0 0 36 36"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path fillRule="evenodd" clipRule="evenodd" d={engravedCornerPaths[corner]} fill="currentColor" />
    </svg>
  );
}

function EngravedFrameEdge({ side }: { side: "top" | "right" | "bottom" | "left" }) {
  return (
    <svg
      className={`engraved-frame-edge engraved-frame-edge-${side}`}
      viewBox={side === "left" || side === "right" ? "0 0 4.875 62.25" : "0 0 206.25 4.875"}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {side === "top" && (
        <>
          <path d="M206.25 1.5H0V0H206.25V1.5Z" fill="currentColor" />
          <path d="M206.25 4.875H0V4.125H206.25V4.875Z" fill="currentColor" />
        </>
      )}
      {side === "bottom" && (
        <>
          <path d="M206.25 0.75H0V0H206.25V0.75Z" fill="currentColor" />
          <path d="M206.25 4.875H0V3.375H206.25V4.875Z" fill="currentColor" />
        </>
      )}
      {side === "left" && (
        <>
          <path d="M1.5 62.25H0V0H1.5V62.25Z" fill="currentColor" />
          <path d="M4.875 62.25H4.125V0H4.875V62.25Z" fill="currentColor" />
        </>
      )}
      {side === "right" && (
        <>
          <path d="M0.75 62.25H0V0H0.75V62.25Z" fill="currentColor" />
          <path d="M4.875 62.25H3.375V0H4.875V62.25Z" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export function EngravedFrame() {
  return (
    <span className="engraved-panel-frame signal-panel-chrome" aria-hidden="true">
      <EngravedCorner corner="tl" />
      <EngravedCorner corner="tr" />
      <EngravedCorner corner="bl" />
      <EngravedCorner corner="br" />
      <EngravedFrameEdge side="top" />
      <EngravedFrameEdge side="right" />
      <EngravedFrameEdge side="bottom" />
      <EngravedFrameEdge side="left" />
    </span>
  );
}

export function EngravedPanel({
  as: Component = "div",
  children,
  className,
  quiet = false,
  ...props
}: ComponentPropsWithoutRef<"div"> & { as?: "div" | "header" | "section"; quiet?: boolean }) {
  return (
    <Component className={classNames("engraved-panel", quiet && "engraved-panel-quiet", className)} {...props}>
      <EngravedFrame />
      {children}
    </Component>
  );
}
