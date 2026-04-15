import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getLead, updateLead } from "@/lib/leadsStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function GET(_request, { params }) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await getLead(params.id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, lead });
}

export async function PATCH(request, { params }) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const lead = await updateLead(params.id, body || {});
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    const message = error?.message || String(error);
    const status = /not found/i.test(message) ? 404 : 500;
    return NextResponse.json({ error: "Failed to update lead", details: message }, { status });
  }
}
