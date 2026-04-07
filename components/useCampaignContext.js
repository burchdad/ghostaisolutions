"use client";

import { useEffect, useMemo, useState } from "react";

function classifyCampaign(campaign = "") {
  const text = campaign.toLowerCase();
  if (text.includes("real-estate") || text.includes("realtor") || text.includes("property")) return "real_estate";
  if (text.includes("ecom") || text.includes("shop") || text.includes("store")) return "ecommerce";
  if (text.includes("service") || text.includes("local") || text.includes("contractor")) return "services";
  if (text.includes("ai-native") || text.includes("ainative") || text.includes("launch")) return "ainative";
  return "default";
}

const copyByType = {
  default: {
    primaryCta: "Start a Project",
    secondaryCta: "See Live Demo",
    roiCta: "Start a Project",
  },
  real_estate: {
    primaryCta: "Start a Project",
    secondaryCta: "See Real Estate Demo",
    roiCta: "Start a Project",
  },
  ecommerce: {
    primaryCta: "Start a Project",
    secondaryCta: "See Ecommerce Demo",
    roiCta: "Start a Project",
  },
  services: {
    primaryCta: "Start a Project",
    secondaryCta: "See Service Ops Demo",
    roiCta: "Start a Project",
  },
  ainative: {
    primaryCta: "Start a Project",
    secondaryCta: "See AI-Native Demo",
    roiCta: "Start a Project",
  },
};

export default function useCampaignContext() {
  const [utmCampaign, setUtmCampaign] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("utm_campaign") || "";

    if (fromUrl) {
      setUtmCampaign(fromUrl);
      return;
    }

    try {
      const stored = JSON.parse(sessionStorage.getItem("ghost_utm") || "{}");
      setUtmCampaign(stored.utm_campaign || "");
    } catch {
      setUtmCampaign("");
    }
  }, []);

  return useMemo(() => {
    const campaignType = classifyCampaign(utmCampaign);
    const campaignCopy = copyByType[campaignType] || copyByType.default;
    return { campaignType, utmCampaign, campaignCopy };
  }, [utmCampaign]);
}
