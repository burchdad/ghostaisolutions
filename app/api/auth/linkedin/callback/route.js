import { NextResponse } from "next/server";
import { saveTokens } from "@/lib/tokenStore";

function firstDefined(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return { key, value: value.trim() };
    }
  }
  return { key: null, value: "" };
}

export async function GET(request) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ ok: false, error: "No code returned" }, { status: 400 });
  }

  const redirectEnv = firstDefined("LINKEDIN_REDIRECT_URI");
  const clientIdEnv = firstDefined("LINKEDIN_CLIENT_ID");
  const clientSecretEnv = firstDefined(
    "LINKEDIN_CLIENT_SECRET",
    "LINKEDIN_PRIMARY_CLIENT_SECRET",
    "LINKEDIN_SECRET"
  );

  const redirectUri = redirectEnv.value;
  const clientId = clientIdEnv.value;
  const clientSecret = clientSecretEnv.value;

  if (!redirectUri || !clientId || !clientSecret) {
    const missing = [];
    if (!redirectUri) missing.push("LINKEDIN_REDIRECT_URI");
    if (!clientId) missing.push("LINKEDIN_CLIENT_ID");
    if (!clientSecret) missing.push("LINKEDIN_CLIENT_SECRET");

    return NextResponse.json(
      {
        ok: false,
        error: "Missing LinkedIn OAuth env vars",
        missing,
        resolvedFrom: {
          redirect_uri: redirectEnv.key,
          client_id: clientIdEnv.key,
          client_secret: clientSecretEnv.key,
        },
        vercelEnv: process.env.VERCEL_ENV || "unknown",
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

  // Save token for later use
  const tokenSaved = saveTokens("linkedin", {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  });

  return NextResponse.json({ ok: true, tokenSaved, ...data });
}
