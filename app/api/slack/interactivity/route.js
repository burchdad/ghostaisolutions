import { NextResponse } from "next/server";
import { verifySlackRequest } from "@/lib/slackSecurity";
import { runSocialApprovalAction, slackActionResponse, SOCIAL_APPROVAL_ACTIONS } from "@/lib/socialApprovalActions";

export async function POST(request) {
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-slack-request-timestamp") || "";
  const signature = request.headers.get("x-slack-signature") || "";

  if (!verifySlackRequest({ body: rawBody, timestamp, signature })) {
    return NextResponse.json({ error: "Invalid Slack signature" }, { status: 401 });
  }

  const form = new URLSearchParams(rawBody);
  const payloadRaw = form.get("payload");
  if (!payloadRaw) {
    return NextResponse.json({ error: "Missing Slack payload" }, { status: 400 });
  }

  const payload = JSON.parse(payloadRaw);
  const actionPayload = payload.actions?.[0];
  if (!actionPayload?.value) {
    return NextResponse.json({ text: "No Slack action payload found.", response_type: "ephemeral" });
  }

  const value = JSON.parse(actionPayload.value);
  const action = value.action || String(actionPayload.action_id || "").replace(/^social_/, "");
  const draftId = value.draftId;

  if (!draftId || !SOCIAL_APPROVAL_ACTIONS.has(action)) {
    return NextResponse.json({ text: "Invalid social approval action.", response_type: "ephemeral" });
  }

  const result = await runSocialApprovalAction({ draftId, action });

  return NextResponse.json(
    slackActionResponse({
      action,
      draftId,
      result,
      userName: payload.user?.username || payload.user?.name || "Slack",
    })
  );
}
