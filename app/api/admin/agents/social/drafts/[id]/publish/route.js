import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getSocialDraft, markDraftPublished, updateSocialDraft } from "@/lib/socialDraftStore";
import { publishVariants } from "@/lib/socialPublish";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function POST(request, { params }) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const draft = await getSocialDraft(params.id);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const status = draft.status === "approved" || body.approveNow ? "approved" : draft.status;
    if (status !== "approved") {
      return NextResponse.json({ error: "Draft must be approved before publishing" }, { status: 400 });
    }

    if (body.approveNow && draft.status !== "approved") {
      await updateSocialDraft(params.id, { status: "approved" });
    }

    const results = await publishVariants({
      platform: body.platform || "all",
      linkedinContent: draft.platformVariants?.linkedin?.text,
      xContent: draft.platformVariants?.x?.text,
      facebookContent: draft.platformVariants?.facebook?.text,
    });

    const saved = await markDraftPublished(params.id, results.results);
    return NextResponse.json({ success: results.success, results: results.results, draft: saved }, { status: results.success ? 200 : 207 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to publish draft", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}