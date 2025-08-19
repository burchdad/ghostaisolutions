"use client";
import { track } from "@vercel/analytics"; // already installed with @vercel/analytics

export default function TrackCTA({ event = "cta_click", children, ...props }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        track(event); // shows up under Analytics → Events
      }}
    >
      {children}
    </a>
  );
}
