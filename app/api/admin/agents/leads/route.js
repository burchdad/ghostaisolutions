import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { createLead, listLeads } from "@/lib/leadsStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function GET() {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await listLeads();
  return NextResponse.json({ success: true, leads });
}

export async function POST(request) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body?.companyName && !body?.domain && !body?.website) {
      return NextResponse.json({ error: "companyName, domain, or website is required" }, { status: 400 });
    }

    const lead = await createLead({
      companyName: body.companyName || body.domain || body.website,
      domain: body.domain || "",
      website: body.website || "",
      sourceType: body.sourceType || "manual",
      sourceUrl: body.sourceUrl || "",
      ownerName: body.ownerName || "",
      ownerRole: body.ownerRole || "",
      ownerEmail: body.ownerEmail || "",
      contactEmail: body.contactEmail || "",
      linkedinUrl: body.linkedinUrl || "",
      summary: body.summary || "",
      status: body.status || "new",
      notes: body.notes || "",
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create lead", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
