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
    primaryCta: "Book Strategy Call",
    secondaryCta: "See Live Demo",
    roiCta: "Build My ROI Plan",
  },
  real_estate: {
    primaryCta: "Book Real Estate AI Plan",
    secondaryCta: "See Real Estate Demo",
    roiCta: "Estimate Deal Team ROI",
  },
  ecommerce: {
    primaryCta: "Book Ecommerce AI Plan",
    secondaryCta: "See Ecommerce Demo",
    roiCta: "Estimate Support ROI",
  },
  services: {
    primaryCta: "Book Service Ops AI Plan",
    secondaryCta: "See Service Ops Demo",
    roiCta: "Estimate Ops ROI",
  },
  ainative: {
    primaryCta: "Launch AI-Native Sprint",
    secondaryCta: "See AI-Native Demo",
    roiCta: "Build AI-Native ROI Plan",
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
