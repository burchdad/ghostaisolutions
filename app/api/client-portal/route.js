import { NextResponse } from "next/server";
import { getClientPortalData } from "@/lib/clientPortalData";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "";

  if (!key.trim()) {
    return NextResponse.json(
      { ok: false, error: "Client portal access key is required." },
      { status: 401 }
    );
  }

  const payload = await getClientPortalData(key);
  if (!payload?.ok) {
    return NextResponse.json(
      payload || { ok: false, error: "Unable to load client portal data." },
      { status: payload?.status || 502 }
    );
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
