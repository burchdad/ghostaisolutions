import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { scrapeBusinessWebsite } from "@/lib/leadIntelligence";
import { upsertLeadByDomain } from "@/lib/leadsStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

function parseUrlInputs(payload) {
  if (Array.isArray(payload?.urls)) {
    return payload.urls.map((u) => String(u || "").trim()).filter(Boolean);
  }

  const raw = String(payload?.urlInput || "");
  if (!raw.trim()) return [];
  return raw
    .split(/[\n,\s]+/)
    .map((u) => u.trim())
    .filter(Boolean);
}

export async function POST(request) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const urls = parseUrlInputs(body).slice(0, 25);

    if (!urls.length) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    const results = [];
    for (const url of urls) {
      const item = { url, success: false };
      try {
        const profile = await scrapeBusinessWebsite(url);
        const lead = await upsertLeadByDomain(profile);
        item.success = true;
        item.lead = lead;
      } catch (error) {
        item.error = error?.message || String(error);
      }
      results.push(item);
    }

    return NextResponse.json({
      success: true,
      discovered: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Lead discovery failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
