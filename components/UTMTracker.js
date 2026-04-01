"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export default function UTMTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      landing_page: window.location.pathname,
      referrer: document.referrer || "",
    };

    const hasUtm = Object.keys(payload)
      .filter((k) => k.startsWith("utm_"))
      .some((k) => payload[k]);

    const landingVariantCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("ghost_landing_variant="))
      ?.split("=")[1] || "control";

    if (hasUtm) {
      sessionStorage.setItem("ghost_utm", JSON.stringify(payload));
      track("utm_landing", payload);
      track("landing_variant_view", {
        variant: landingVariantCookie,
        utm_campaign: payload.utm_campaign,
        utm_source: payload.utm_source,
      });
      return;
    }

    if (!sessionStorage.getItem("ghost_utm")) {
      sessionStorage.setItem("ghost_utm", JSON.stringify(payload));
    }
  }, []);

  return null;
}
