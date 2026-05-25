import { getSocialDraft, markDraftPublished, updateSocialDraft } from "@/lib/socialDraftStore";
import { publishVariants } from "@/lib/socialPublish";

const ACTION_LABELS = {
  approve: "approved",
  approve_publish: "approved and published",
  reject: "rejected",
};

export const SOCIAL_APPROVAL_ACTIONS = new Set(["approve", "approve_publish", "reject"]);

export async function runSocialApprovalAction({ draftId, action }) {
  if (!SOCIAL_APPROVAL_ACTIONS.has(action)) {
    return { ok: false, status: 400, message: "Invalid social approval action" };
  }

  const draft = await getSocialDraft(draftId);
  if (!draft) {
    return { ok: false, status: 404, message: "Draft not found" };
  }

  if (action === "reject") {
    const saved = await updateSocialDraft(draftId, { status: "rejected" });
    return { ok: true, message: `Social draft ${draftId} rejected.`, draft: saved };
  }

  if (action === "approve") {
    const saved = await updateSocialDraft(draftId, { status: "approved" });
    return { ok: true, message: `Social draft ${draftId} approved.`, draft: saved };
  }

  await updateSocialDraft(draftId, { status: "approved" });
  const results = await publishVariants({
    platform: "all",
    linkedinContent: draft.platformVariants?.linkedin?.text,
    xContent: draft.platformVariants?.x?.text,
    facebookContent: draft.platformVariants?.facebook?.text,
  });
  const saved = await markDraftPublished(draftId, results.results);

  return {
    ok: results.success,
    partial: !results.success,
    message: `Social draft ${draftId} ${ACTION_LABELS[action]}. Publishing success: ${String(results.success)}.`,
    draft: saved,
    results: results.results,
  };
}

export function slackActionResponse({ action, draftId, result, userName = "Slack" }) {
  const label = ACTION_LABELS[action] || action;
  const successText = result.ok || result.partial ? result.message : `Action failed: ${result.message}`;

  return {
    replace_original: false,
    response_type: "ephemeral",
    text: `${userName} ${label} social draft ${draftId}.\n${successText}`,
  };
}
