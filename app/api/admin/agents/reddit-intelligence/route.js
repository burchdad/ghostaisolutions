import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { postRedditComment, scanRedditIntelligence } from "@/lib/redditIntelligence";
import {
  getRedditIntelligenceStats,
  getRedditOpportunity,
  listRedditOpportunities,
  updateRedditOpportunity,
  upsertRedditOpportunities,
} from "@/lib/redditIntelligenceStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [opportunities, stats] = await Promise.all([
    listRedditOpportunities({ limit: 100 }),
    getRedditIntelligenceStats(),
  ]);

  return NextResponse.json({ success: true, opportunities, stats });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "scan";

    if (action === "scan") {
      const scan = await scanRedditIntelligence();
      const saved = await upsertRedditOpportunities(scan.opportunities);
      const [opportunities, stats] = await Promise.all([
        listRedditOpportunities({ limit: 100 }),
        getRedditIntelligenceStats(),
      ]);
      return NextResponse.json({
        success: true,
        found: scan.opportunities.length,
        added: saved.added,
        updated: saved.updated,
        scannedSubreddits: scan.scannedSubreddits,
        opportunities,
        stats,
      });
    }

    if (action === "dismiss") {
      const updated = await updateRedditOpportunity(body.id, {
        status: "dismissed",
        dismissedAt: new Date().toISOString(),
      });
      if (!updated) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
      return NextResponse.json({ success: true, opportunity: updated, stats: await getRedditIntelligenceStats() });
    }

    if (action === "post-reply") {
      const opportunity = await getRedditOpportunity(body.id);
      if (!opportunity) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
      if (opportunity.status === "posted") {
        return NextResponse.json({ error: "Opportunity has already been posted" }, { status: 400 });
      }

      const replyText = String(body.reply || opportunity.draftReply?.reply || "").trim();
      if (!replyText) return NextResponse.json({ error: "Missing reply text" }, { status: 400 });

      const commentResult = await postRedditComment({ thingId: opportunity.postId, text: replyText });
      const updated = await updateRedditOpportunity(body.id, {
        status: "posted",
        postedAt: new Date().toISOString(),
        postedReply: replyText,
        commentResult,
      });
      return NextResponse.json({ success: true, opportunity: updated, commentResult, stats: await getRedditIntelligenceStats() });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Reddit intelligence action failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
