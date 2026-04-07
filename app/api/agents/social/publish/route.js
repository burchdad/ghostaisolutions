import { NextResponse } from "next/server";
import { publishVariants } from "@/lib/socialPublish";

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await publishVariants(body);
    return NextResponse.json(data, { status: data.success ? 200 : 207 });
  } catch (err) {
    console.error("Publish error:", err);
    return NextResponse.json(
      { error: "Failed to publish", details: err.message },
      { status: 500 }
    );
  }
}
