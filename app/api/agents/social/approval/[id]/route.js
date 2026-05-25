import { NextResponse } from "next/server";
import { getSocialDraft, markDraftPublished, updateSocialDraft } from "@/lib/socialDraftStore";
import { publishVariants } from "@/lib/socialPublish";
import { verifySocialDraftAction } from "@/lib/socialApproval";

const ACTIONS = new Set(["approve", "approve_publish", "reject"]);

function htmlResponse(title, body, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}
      main{max-width:680px;border:1px solid #334155;border-radius:12px;padding:28px;background:#111827}
      h1{margin:0 0 12px;font-size:24px}
      p{line-height:1.5;color:#cbd5e1}
      code{color:#67e8f9}
    </style>
  </head>
  <body><main><h1>${title}</h1><p>${body}</p></main></body>
</html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(request, { params }) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "";
  const token = url.searchParams.get("token") || "";
  const draftId = params.id;

  if (!ACTIONS.has(action)) {
    return htmlResponse("Invalid social action", "This Slack approval link is missing a valid action.", 400);
  }

  if (!verifySocialDraftAction({ draftId, action, token })) {
    return htmlResponse("Unauthorized", "This Slack approval link is invalid or was signed with an old secret.", 401);
  }

  const draft = await getSocialDraft(draftId);
  if (!draft) {
    return htmlResponse("Draft not found", `No social draft exists for <code>${draftId}</code>.`, 404);
  }

  if (action === "reject") {
    await updateSocialDraft(draftId, { status: "rejected" });
    return htmlResponse("Social draft rejected", `Draft <code>${draftId}</code> was rejected from Slack.`);
  }

  if (action === "approve") {
    await updateSocialDraft(draftId, { status: "approved" });
    return htmlResponse("Social draft approved", `Draft <code>${draftId}</code> is approved and ready to publish.`);
  }

  await updateSocialDraft(draftId, { status: "approved" });
  const results = await publishVariants({
    platform: "all",
    linkedinContent: draft.platformVariants?.linkedin?.text,
    xContent: draft.platformVariants?.x?.text,
    facebookContent: draft.platformVariants?.facebook?.text,
  });
  await markDraftPublished(draftId, results.results);

  return htmlResponse(
    results.success ? "Social draft published" : "Social draft partially published",
    `Draft <code>${draftId}</code> was approved from Slack. Publishing success: <code>${String(results.success)}</code>.`
  );
}
