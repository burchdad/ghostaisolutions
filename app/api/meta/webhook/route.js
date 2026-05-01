import crypto from "crypto";
import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/auditLog";
import { getProviderConnection, listProviderConnections } from "@/lib/tokenStore";
import { upsertLeadByDomain } from "@/lib/leadsStore";

function getVerifyToken() {
  return (process.env.META_WEBHOOK_VERIFY_TOKEN || "").trim();
}

function getAppSecret() {
  return (process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || "").trim();
}

function verifyWebhookSignature(rawBody, signatureHeader) {
  const appSecret = getAppSecret();
  if (!appSecret) {
    throw new Error("Missing META_APP_SECRET/FACEBOOK_APP_SECRET for webhook signature verification");
  }

  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const provided = signatureHeader.slice("sha256=".length);
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  const providedBuf = Buffer.from(provided, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

function findPageAccessToken(pageId) {
  if (!pageId) return "";

  const defaultFacebook = getProviderConnection("facebook", { orgId: "default" });
  if (defaultFacebook?.pageId && String(defaultFacebook.pageId) === String(pageId) && defaultFacebook.accessToken) {
    return defaultFacebook.accessToken;
  }

  const allFacebookConnections = listProviderConnections("facebook");
  const matched = allFacebookConnections.find(
    (connection) => String(connection?.pageId || "") === String(pageId) && connection?.accessToken
  );
  if (matched?.accessToken) {
    return matched.accessToken;
  }

  return process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";
}

async function fetchLeadgenData(leadgenId, pageId) {
  const pageAccessToken = findPageAccessToken(pageId);
  if (!leadgenId || !pageAccessToken) {
    return null;
  }

  const fields = ["id", "created_time", "ad_id", "ad_name", "campaign_id", "campaign_name", "field_data"].join(","
  );
  const endpoint = `https://graph.facebook.com/v20.0/${encodeURIComponent(leadgenId)}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(pageAccessToken)}`;

  const response = await fetch(endpoint, { cache: "no-store" });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(data?.error?.message || "Unable to fetch leadgen data");
  }

  return data;
}

function fieldMap(fieldData = []) {
  return Object.fromEntries(
    fieldData
      .filter((item) => item?.name)
      .map((item) => [
        item.name,
        Array.isArray(item.values) && item.values.length ? String(item.values[0]) : "",
      ])
  );
}

async function processLeadgenChange(change) {
  const leadgenId = change?.value?.leadgen_id;
  const pageId = change?.value?.page_id || change?.value?.page_id;
  if (!leadgenId) {
    return { skipped: true, reason: "missing leadgen_id" };
  }

  const leadData = await fetchLeadgenData(leadgenId, pageId);
  if (!leadData) {
    return { skipped: true, reason: "no lead data" };
  }

  const fields = fieldMap(leadData.field_data || []);
  const email = fields.email || fields.email_address || "";
  const fullName = fields.full_name || fields.first_name || "";
  const phone = fields.phone_number || fields.phone || "";
  const company =
    fields.company_name || fields.company || fields.business_name || fullName || `Meta Lead ${leadData.id}`;
  const website = fields.website || "";
  const domain = website
    ? String(website)
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
    : "";

  const lead = await upsertLeadByDomain({
    companyName: company,
    website,
    domain,
    sourceType: "meta_lead_ads",
    sourceUrl: pageId ? `https://www.facebook.com/${pageId}` : "",
    ownerName: fullName,
    ownerEmail: email,
    contactEmail: email,
    summary: `Meta Lead Ad form submission (${leadgenId})`,
    notes: JSON.stringify(
      {
        leadgenId,
        pageId,
        campaignId: leadData.campaign_id || "",
        campaignName: leadData.campaign_name || "",
        adId: leadData.ad_id || "",
        adName: leadData.ad_name || "",
        phone,
      },
      null,
      2
    ),
  });

  return { success: true, leadId: lead.id, leadgenId };
}

export async function GET(request) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === getVerifyToken()) {
    return new Response(challenge || "ok", { status: 200 });
  }

  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256") || "";

  try {
    if (!verifyWebhookSignature(rawBody, signature)) {
      appendAuditEvent("meta-webhook", {
        event: "signature_invalid",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    if (payload?.object !== "page" || !Array.isArray(payload.entry)) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    const results = [];
    for (const entry of payload.entry) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        if (change?.field !== "leadgen") {
          continue;
        }
        try {
          const result = await processLeadgenChange(change);
          results.push(result);
        } catch (error) {
          results.push({ success: false, error: error?.message || "Lead processing failed" });
        }
      }
    }

    appendAuditEvent("meta-webhook", {
      event: "leadgen_received",
      total: results.length,
      success: results.filter((item) => item.success).length,
      failed: results.filter((item) => item.success === false).length,
    });

    return NextResponse.json({ ok: true, processed: results.length, results }, { status: 200 });
  } catch (error) {
    appendAuditEvent("meta-webhook", {
      event: "webhook_error",
      message: error?.message || "Unknown webhook error",
    });

    return NextResponse.json({ error: "Webhook processing failed", details: error?.message || "Unknown error" }, { status: 500 });
  }
}