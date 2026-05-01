import { TwitterApi } from "twitter-api-v2";
import { getProviderConnection } from "@/lib/tokenStore";

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
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202404",
      },
      body: JSON.stringify({
        author,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "LinkedIn API error" };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
      url: `https://www.linkedin.com/feed/update/${data.id}`,
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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

export async function publishVariants({ platform, content, linkedinContent, xContent, facebookContent }) {
  const hasAnyContent = Boolean(content || linkedinContent || xContent || facebookContent);
  if (!platform || !hasAnyContent) {
    throw new Error("Missing required fields: platform and at least one content field");
  }

  const results = {};

  if (platform === "linkedin" || platform === "all") {
    results.linkedin = await publishToLinkedIn(linkedinContent || content, process.env.LINKEDIN_ACCESS_TOKEN);
  }

  if (platform === "x" || platform === "all") {
    results.x = await publishToX(xContent || content);
  }

  if (platform === "facebook" || platform === "all") {
    const storedFacebook = getProviderConnection("facebook", { orgId: "default" }) || {};
    results.facebook = await publishToFacebook(
      facebookContent || content,
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN || storedFacebook.accessToken,
      process.env.FACEBOOK_PAGE_ID || storedFacebook.pageId
    );
  }

  const allSuccess = Object.values(results).every((result) => result.success);
  return {
    success: allSuccess,
    results,
    timestamp: new Date().toISOString(),
  };
}