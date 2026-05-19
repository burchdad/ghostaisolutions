import { NextResponse } from "next/server";
import { getLeadIntelligenceServiceStatus } from "@/lib/leadIntelligenceServiceAuth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    success: true,
    service: "ghost-lead-intelligence",
    time: new Date().toISOString(),
    ...getLeadIntelligenceServiceStatus(),
  });
}

