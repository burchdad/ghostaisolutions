import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getSocialDraft, updateSocialDraft } from "@/lib/socialDraftStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function GET(_request, { params }) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const draft = await getSocialDraft(params.id);
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, draft });
}

export async function PATCH(request, { params }) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates = {
      ...(body.platformVariants ? { platformVariants: body.platformVariants } : {}),
      ...(body.status ? { status: body.status } : {}),
    };
    const draft = await updateSocialDraft(params.id, updates);
    return NextResponse.json({ success: true, draft });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update draft", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}