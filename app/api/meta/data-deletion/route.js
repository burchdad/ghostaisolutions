import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  buildMetaDeletionResponse,
  checkRateLimit,
  createDeletionRequestLog,
  parseAndVerifySignedRequest,
  processDeletionForScopedUser,
} from "@/lib/metaDataDeletion";

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function hashIp(ip) {
  if (!ip || ip === "unknown") return "unknown";
  return crypto.createHash("sha256").update(ip).digest("hex");
}

async function readSignedRequest(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return String(formData.get("signed_request") || "").trim();
  }

  if (contentType.includes("application/json")) {
    const body = await request.json();
    return String(body?.signed_request || "").trim();
  }

  const bodyText = await request.text();
  const params = new URLSearchParams(bodyText);
  return String(params.get("signed_request") || "").trim();
}

export async function POST(request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const signedRequest = await readSignedRequest(request);
    const { payload, scopedUserId } = parseAndVerifySignedRequest(signedRequest);

    const deletionResult = processDeletionForScopedUser(scopedUserId);
    const record = createDeletionRequestLog({
      scopedUserId,
      requestMeta: {
        appId: payload.app_id ? String(payload.app_id) : "",
        receivedAt: new Date().toISOString(),
        clientIpHash: hashIp(clientIp),
      },
      deletionResult,
    });

    return NextResponse.json(buildMetaDeletionResponse(record.confirmationCode), { status: 200 });
  } catch (error) {
    const status = String(error?.message || "").includes("META_APP_SECRET") ? 503 : 400;
    return NextResponse.json(
      {
        error: "Invalid deletion request",
        details: error?.message || "Unable to process request",
      },
      { status }
    );
  }
}