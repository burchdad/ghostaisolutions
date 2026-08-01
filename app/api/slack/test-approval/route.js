import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { notifySlackSocialApproval } from "@/lib/socialApproval";

function isAuthorized(request) {
  const sessionToken = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (verifyAdminSessionToken(sessionToken)) return true;

  const secret = process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
  const authHeader = request.headers.get("authorization") || "";
  return Boolean(secret && authHeader === `Bearer ${secret}`);
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const draft = {
    id: `slack-test-${Date.now()}`,
    title: "Design Haven Build Slack Approval Test",
    slug: "design-haven-build-slack-test",
    status: "review",
    sourceType: "admin-test",
    createdAt: new Date().toISOString(),
    platformVariants: {
      facebook: {
        text:
          "Test approval from Ghost Mission Control for Design Haven Build. If this appears in #social, the monthly-client approval lane is connected.",
      },
      linkedin: {
        text:
          "Ghost Mission Control is connected to the Design Haven Build Slack workspace for social approvals and growth operations.",
      },
    },
  };

  const slackNotified = await notifySlackSocialApproval({
    draft,
    reason: "Admin requested a Slack approval routing test.",
  });

  return NextResponse.json({
    ok: slackNotified,
    slackNotified,
    draftId: draft.id,
    timestamp: new Date().toISOString(),
  });
}
