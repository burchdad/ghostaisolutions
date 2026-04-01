import { NextResponse } from "next/server";

function classifyCampaign(value) {
  const text = (value || "").toLowerCase();
  if (text.includes("ai-native") || text.includes("ainative") || text.includes("launch")) return "ai-native";
  return "control";
}

function pickVariant(campaign) {
  const forced = classifyCampaign(campaign);
  if (forced === "ai-native") return "ai-native";
  return Math.random() < 0.5 ? "control" : "ai-native";
}

export function middleware(request) {
  const { nextUrl, cookies } = request;

  if (nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const campaign = nextUrl.searchParams.get("utm_campaign") || "";
  const source = nextUrl.searchParams.get("utm_source") || "";
  const medium = nextUrl.searchParams.get("utm_medium") || "";
  const hasUtm = Boolean(campaign || source || medium);

  if (!hasUtm) {
    return NextResponse.next();
  }

  const existing = cookies.get("ghost_landing_variant")?.value;
  const variant = existing || pickVariant(campaign);

  const response = NextResponse.next();
  response.cookies.set("ghost_landing_variant", variant, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: true,
  });

  if (variant === "ai-native") {
    const url = nextUrl.clone();
    url.pathname = "/ai-native";
    return NextResponse.rewrite(url, response);
  }

  return response;
}

export const config = {
  matcher: ["/"],
};
