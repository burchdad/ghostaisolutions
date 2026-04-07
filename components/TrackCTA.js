"use client";
import { track } from "@vercel/analytics"; // already installed with @vercel/analytics
import { emitGhostPulseBurst } from "@/lib/ghostAvatarSignals";

export default function TrackCTA({ event = "cta_click", section, placement, label, children, ...props }) {
  const getAttribution = () => {
    if (typeof window === "undefined") {
      return {};
    }

    let stored = {};
    try {
      stored = JSON.parse(sessionStorage.getItem("ghost_utm") || "{}");
    } catch {
      stored = {};
    }

    let heroVariant = "";
    try {
      heroVariant = localStorage.getItem("ghost_hero_variant") || "";
    } catch {
      heroVariant = "";
    }

    return {
      utm_source: stored.utm_source || "",
      utm_medium: stored.utm_medium || "",
      utm_campaign: stored.utm_campaign || "",
      utm_content: stored.utm_content || "",
      utm_term: stored.utm_term || "",
      landing_page: stored.landing_page || "",
      referrer: stored.referrer || "",
      hero_variant: heroVariant,
      page_path: window.location.pathname,
    };
  };

  return (
    <a
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (label === "Start a Project") {
          emitGhostPulseBurst({ source: section || placement || "cta" });
        }
        track(event, {
          href: props.href ?? "",
          section: section ?? "",
          placement: placement ?? "",
          label: label ?? "",
          ...getAttribution(),
        });
      }}
    >
      {children}
    </a>
  );
}
