import { TwitterApi } from "twitter-api-v2";
import { getProviderConnection, getToken } from "@/lib/tokenStore";

function getLinkedInAuthorUrn() {
  const raw = (
    process.env.LINKEDIN_ORGANIZATION_ID ||
    process.env.LINKEDIN_ORG_ID ||
    process.env.LINKEDIN_ORGANIZATION_URN ||
    ""
  ).trim();

  if (!raw) return "";
  if (raw.startsWith("urn:li:organization:")) return raw;
  return `urn:li:organization:${raw}`;
}

async function publishToLinkedIn(content, accessToken) {
  if (!accessToken) {
    return { success: false, error: "No LinkedIn access token" };
  }

  const author = getLinkedInAuthorUrn();
  if (!author) {
    return {
      success: false,
      error: "Missing LinkedIn organization identifier (set LINKEDIN_ORGANIZATION_ID, LINKEDIN_ORG_ID, or LINKEDIN_ORGANIZATION_URN)",
    };
  }

  try {
    const response = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Linkedin-Version": "202606",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author,
        commentary: content,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error.message || error.detail || "LinkedIn API error";
      if (/content is a duplicate/i.test(message)) {
        const duplicateId = message.match(/urn:li:share:\d+/i)?.[0] || "";
        return {
          success: true,
          duplicate: true,
          postId: duplicateId,
          url: duplicateId ? `https://www.linkedin.com/feed/update/${duplicateId}` : "",
          message: "LinkedIn content was already published.",
        };
      }
      return { success: false, error: message };
    }

    const postId = response.headers.get("x-restli-id") || "";
    return {
      success: true,
      postId,
      url: postId ? `https://www.linkedin.com/feed/update/${postId}` : "",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getXOAuth1Credentials() {
  return {
    appKey: process.env.X_CONSUMER_KEY || process.env.X_API_KEY || "",
    appSecret: process.env.X_CONSUMER_SECRET || process.env.X_API_SECRET || "",
    accessToken: process.env.X_ACCESS_TOKEN || "",
    accessSecret: process.env.X_ACCESS_SECRET || process.env.X_ACCESS_TOKEN_SECRET || "",
  };
}

async function publishToX(content) {
  const creds = getXOAuth1Credentials();
  if (!creds.appKey || !creds.appSecret || !creds.accessToken || !creds.accessSecret) {
    return { success: false, error: "Missing X API credentials" };
  }

  try {
    const client = new TwitterApi(creds);
    const data = await client.readWrite.v2.tweet(content);
    return {
      success: true,
      postId: data?.data?.id,
      url: `https://twitter.com/i/web/status/${data?.data?.id}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function publishToFacebook(content, pageAccessToken, pageId) {
  if (!pageAccessToken || !pageId) {
    return { success: false, error: "Missing Facebook credentials" };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        message: content,
        access_token: pageAccessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "Facebook API error" };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
      url: `https://www.facebook.com/${pageId}/posts/${data.id}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function publishToBluesky(content) {
  const handle = process.env.BLUESKY_HANDLE || "";
  const appPassword = process.env.BLUESKY_APP_PASSWORD || "";
  const pdsUrl = (process.env.BLUESKY_PDS_URL || "https://bsky.social").replace(/\/$/, "");

  if (!handle || !appPassword) {
    return { success: false, error: "Missing Bluesky credentials" };
  }

  try {
    const sessionResponse = await fetch(`${pdsUrl}/xrpc/com.atproto.server.createSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: handle, password: appPassword }),
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.json().catch(() => ({}));
      return { success: false, error: error.message || "Bluesky auth error" };
    }

    const session = await sessionResponse.json();
    const recordResponse = await fetch(`${pdsUrl}/xrpc/com.atproto.repo.createRecord`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessJwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: session.did || handle,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text: content,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    if (!recordResponse.ok) {
      const error = await recordResponse.json().catch(() => ({}));
      return { success: false, error: error.message || "Bluesky API error" };
    }

    const data = await recordResponse.json();
    const rkey = data.uri?.split("/").pop() || "";
    return {
      success: true,
      postId: data.uri,
      url: rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : "",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function isBlueskyConfigured() {
  return Boolean(process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD);
}

async function getRedditAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID || "";
  const clientSecret = process.env.REDDIT_CLIENT_SECRET || "";
  const refreshToken = process.env.REDDIT_REFRESH_TOKEN || "";
  const userAgent = process.env.REDDIT_USER_AGENT || "ghostai.solutions social publisher";

  if (!clientId || !clientSecret || !refreshToken) {
    return { success: false, error: "Missing Reddit credentials" };
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { success: false, error: error.message || "Reddit auth error" };
  }

  const data = await response.json();
  return { success: true, accessToken: data.access_token, userAgent };
}

async function publishToReddit(content, title = "") {
  const subreddit = (process.env.REDDIT_SUBREDDIT || "").replace(/^r\//i, "");
  if (!subreddit) {
    return { success: false, error: "Missing Reddit subreddit" };
  }

  const tokenData = await getRedditAccessToken();
  if (!tokenData.success) return tokenData;

  try {
    const response = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": tokenData.userAgent,
      },
      body: new URLSearchParams({
        api_type: "json",
        kind: "self",
        sr: subreddit,
        title: String(title || "Ghost AI Solutions discussion").slice(0, 300),
        text: content,
        resubmit: "true",
        sendreplies: "true",
      }),
    });

    const data = await response.json().catch(() => ({}));
    const errors = data?.json?.errors || [];
    if (!response.ok || errors.length) {
      return { success: false, error: errors[0]?.[1] || data.message || "Reddit API error" };
    }

    return {
      success: true,
      postId: data?.json?.data?.name || data?.json?.data?.id || "",
      url: data?.json?.data?.url || "",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function isRedditConfigured() {
  return Boolean(
    process.env.REDDIT_CLIENT_ID &&
      process.env.REDDIT_CLIENT_SECRET &&
      process.env.REDDIT_REFRESH_TOKEN &&
      process.env.REDDIT_SUBREDDIT
  );
}

export async function publishVariants({ platform, content, linkedinContent, xContent, facebookContent, blueskyContent, redditContent, redditTitle }) {
  const hasAnyContent = Boolean(content || linkedinContent || xContent || facebookContent || blueskyContent || redditContent);
  if (!platform || !hasAnyContent) {
    throw new Error("Missing required fields: platform and at least one content field");
  }

  const results = {};

  if (platform === "linkedin" || platform === "all") {
    results.linkedin = await publishToLinkedIn(linkedinContent || content, getToken("linkedin", { orgId: "default" }));
  }

  if (platform === "x" || platform === "all") {
    results.x = await publishToX(xContent || content);
  }

  if (platform === "facebook" || platform === "all") {
    const storedFacebook = getProviderConnection("facebook", { orgId: "default" }) || {};
    results.facebook = await publishToFacebook(
      facebookContent || content,
      getToken("facebook", { orgId: "default" }),
      process.env.FACEBOOK_PAGE_ID || storedFacebook.pageId
    );
  }

  if (platform === "bluesky" || (platform === "all" && blueskyContent && isBlueskyConfigured())) {
    results.bluesky = await publishToBluesky(blueskyContent || content);
  }

  if (platform === "reddit" || (platform === "all" && redditContent && isRedditConfigured())) {
    results.reddit = await publishToReddit(redditContent || content, redditTitle);
  }

  const allSuccess = Object.values(results).every((result) => result.success);
  return {
    success: allSuccess,
    results,
    timestamp: new Date().toISOString(),
  };
}
