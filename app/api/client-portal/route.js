import { NextResponse } from "next/server";
import { getClientPortalData } from "@/lib/clientPortalData";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "";
  const noStoreHeaders = {
    "Cache-Control": "no-store",
  };

  if (!key.trim()) {
    return NextResponse.json(
      { ok: false, error: "Client portal access key is required." },
      { status: 401, headers: noStoreHeaders }
    );
  }

  const payload = await getClientPortalData(key);
  if (!payload?.ok) {
    return NextResponse.json(
      payload || { ok: false, error: "Unable to load client portal data." },
      { status: payload?.status || 502, headers: noStoreHeaders }
    );
  }

  return NextResponse.json(payload, {
    headers: noStoreHeaders,
  });
}
