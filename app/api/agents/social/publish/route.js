import { NextResponse } from "next/server";

// LinkedIn API - Post to company page
async function publishToLinkedIn(content, accessToken) {
  if (!accessToken) {
    return { success: false, error: "No LinkedIn access token" };
  }

  try {
    // LinkedIn API v2 endpoint for UGC Posts
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202404",
      },
      body: JSON.stringify({
        author: `urn:li:organization:${process.env.LINKEDIN_ORGANIZATION_ID || ""}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content,
            },
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
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// X API - Tweet posting
async function publishToX(content, accessToken, accessTokenSecret, apiKey, apiSecret) {
  if (!accessToken || !accessTokenSecret || !apiKey || !apiSecret) {
    return { success: false, error: "Missing X API credentials" };
  }

  try {
    // X API v2 endpoint
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: content,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail || error.message || "X API error" };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.data?.id,
      url: `https://twitter.com/i/web/status/${data.data?.id}`,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Facebook API - Post to page
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
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { platform, content, linkedinContent, xContent, facebookContent } = body;

    const hasAnyContent = Boolean(content || linkedinContent || xContent || facebookContent);
    if (!platform || !hasAnyContent) {
      return NextResponse.json(
        { error: "Missing required fields: platform and at least one content field" },
        { status: 400 }
      );
    }

    const results = {};

    // Publish to requested platform(s)
    if (platform === "linkedin" || platform === "all") {
      results.linkedin = await publishToLinkedIn(
        linkedinContent || content,
        process.env.LINKEDIN_ACCESS_TOKEN
      );
    }

    if (platform === "x" || platform === "all") {
      results.x = await publishToX(
        xContent || content,
        process.env.X_ACCESS_TOKEN,
        process.env.X_ACCESS_TOKEN_SECRET,
        process.env.X_API_KEY,
        process.env.X_API_SECRET
      );
    }

    if (platform === "facebook" || platform === "all") {
      results.facebook = await publishToFacebook(
        facebookContent || content,
        process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
        process.env.FACEBOOK_PAGE_ID
      );
    }

    // Check if any failed
    const allSuccess = Object.values(results).every((r) => r.success);

    return NextResponse.json(
      {
        success: allSuccess,
        results,
        timestamp: new Date().toISOString(),
      },
      { status: allSuccess ? 200 : 207 }
    );
  } catch (err) {
    console.error("Publish error:", err);
    return NextResponse.json(
      { error: "Failed to publish", details: err.message },
      { status: 500 }
    );
  }
}
