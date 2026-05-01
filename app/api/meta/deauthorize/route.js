import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/auditLog";
import { parseAndVerifySignedRequest } from "@/lib/metaDataDeletion";
import { deleteProviderConnectionsByUserId } from "@/lib/tokenStore";

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
  try {
    const signedRequest = await readSignedRequest(request);
    const { scopedUserId } = parseAndVerifySignedRequest(signedRequest);

    const deletedMeta = deleteProviderConnectionsByUserId("meta", scopedUserId);
    const deletedFacebook = deleteProviderConnectionsByUserId("facebook", scopedUserId);

    appendAuditEvent("meta-oauth", {
      event: "deauthorized",
      scopedUserId,
      deletedMeta,
      deletedFacebook,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid deauthorization request",
        details: error?.message || "Unable to process request",
      },
      { status: 400 }
    );
  }
}