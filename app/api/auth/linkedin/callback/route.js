import { NextResponse } from "next/server";

export async function GET(request) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ ok: false, error: "No code returned" }, { status: 400 });
  }

  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!redirectUri || !clientId || !clientSecret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing LinkedIn OAuth env vars. Required: LINKEDIN_REDIRECT_URI, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET",
      },
      { status: 500 }
    );
  }

  let tokenResponse;
  try {
    tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to reach LinkedIn token endpoint" },
      { status: 502 }
    );
  }

  let data;
  try {
    data = await tokenResponse.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "LinkedIn token endpoint returned a non-JSON response" },
      { status: 502 }
    );
  }

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "LinkedIn token exchange failed",
        linkedin: data,
      },
      { status: tokenResponse.status || 502 }
    );
  }

  return NextResponse.json({ ok: true, ...data });
}
