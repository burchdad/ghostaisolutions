import { NextResponse } from "next/server";
import { verifySlackRequest } from "@/lib/slackSecurity";
import { runSocialApprovalAction, slackActionResponse, SOCIAL_APPROVAL_ACTIONS } from "@/lib/socialApprovalActions";

const DEFAULT_MISSION_CONTROL_URL = "https://ghostmissioncontrol-production.up.railway.app";

function missionControlBaseUrl() {
  return String(
    process.env.GHOST_MISSION_CONTROL_URL ||
    process.env.MISSION_CONTROL_URL ||
    DEFAULT_MISSION_CONTROL_URL
  ).replace(/\/+$/, "");
}

function parseSlackActionValue(value) {
  try {
    return JSON.parse(String(value || "{}"));
  } catch {
    return {};
  }
}

async function forwardWebSupportActionToMissionControl({ rawBody, timestamp, signature }) {
  const response = await fetch(`${missionControlBaseUrl()}/mission/slack/web-support/actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Slack-Request-Timestamp": timestamp,
      "X-Slack-Signature": signature,
    },
    body: rawBody,
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        text: payload?.error || payload?.detail || "Mission Control did not accept the Web Support action.",
        response_type: "ephemeral",
      }
    );
  }

  return NextResponse.json(payload || {
    text: "Web Support action sent to Mission Control.",
    response_type: "ephemeral",
  });
}

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
  if (!actionPayload) {
    return NextResponse.json({ text: "No Slack action payload found.", response_type: "ephemeral" });
  }

  const actionId = String(actionPayload.action_id || "");
  const value = parseSlackActionValue(actionPayload.value);
  if (actionId.startsWith("web_support_") || String(value.action || "").startsWith("web_support_")) {
    return forwardWebSupportActionToMissionControl({ rawBody, timestamp, signature });
  }

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
