import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/allPosts";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

// Helper to call LLM with a specific prompt
async function callLLM(systemPrompt, userMessage) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const baseUrl = process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("LLM call failed:", err);
    return null;
  }
}

// Generate LinkedIn variant
async function repurposeForLinkedIn(blogTitle, blogExcerpt, blogContent) {
  const systemPrompt = `You are a LinkedIn content specialist for Ghost AI Solutions. 
Your task is to create a professional, thought-leadership post from blog content.

Guidelines:
- Tone: Professional yet approachable, industry-focused
- Length: 150-300 words
- Start with a hook that engages professionals (question or insight)
- Include 2-3 key takeaways
- End with a CTA: ask for comments, invite discussion, or suggest a connection
- Use LinkedIn best practices: short paragraphs, line breaks, professional hashtags
- Add 5-8 relevant hashtags (e.g., #AIAgents #EnterpriseSoftware #DevTools)

Return only the final post text, ready to copy/paste.`;

  const userMessage = `Create a LinkedIn post from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 500)}...`;

  const content = await callLLM(systemPrompt, userMessage);
  
  return {
    text: content || "Failed to generate LinkedIn variant",
    tips: [
      "Post at 8-10 AM ET for maximum engagement",
      "Enable comments to boost algorithmic reach",
      "Tag relevant company or industry accounts",
      "Use line breaks to improve readability on mobile"
    ]
  };
}

// Generate X (Twitter) variant
async function repurposeForX(blogTitle, blogExcerpt, blogContent) {
  const systemPrompt = `You are a Twitter content specialist. Create a viral-ready tweet thread or single tweet from blog content.

Guidelines:
- Tone: Sharp, conversational, industry-aware
- If longer than 280 chars: create a 4-6 tweet thread (each tweet under 280 chars)
- Hook first tweet with: question, contrarian take, or surprising fact
- Each tweet should be standalone readable but part of a narrative
- Use 2-3 trending hashtags maximum
- No emojis unless highly relevant
- End with a link to blog post or CTA

Return format:
If thread: Tweet 1 | Tweet 2 | Tweet 3 (etc, separated by | )
If single: Just the tweet text`;

  const userMessage = `Create X (Twitter) content from this blog post:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 500)}...`;

  const content = await callLLM(systemPrompt, userMessage);
  
  return {
    text: content || "Failed to generate X variant",
    tips: [
      "Post between 9 AM - 4 PM for optimal engagement",
      "Quote retweet from relevant industry accounts to expand reach",
      "If threading: space posts 1-2 hours apart for better visibility",
      "Monitor replies for conversation to boost impression count"
    ]
  };
}

// Generate Facebook variant
async function repurposeForFacebook(blogTitle, blogExcerpt, blogContent) {
  const systemPrompt = `You are a Facebook community manager for Ghost AI Solutions. Create engaging post copy for a business page.

Guidelines:
- Tone: Community-focused, friendly, accessible
- Length: 50-200 characters for primary text
- Always include visual guidance: describe what image/video should accompany
- Strong CTA: "Learn more", "Read the full story", "See how", etc.
- Use 1-3 brand hashtags only
- Make people WANT to click the link
- Consider what thumbnail image would work: blog screenshot, team photo, graph, etc.

Return format:
Post Text: [the text]
Visual: [description of image/video to use]
CTA: [suggested call-to-action button text]`;

  const userMessage = `Create Facebook post copy from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 500)}...`;

  const content = await callLLM(systemPrompt, userMessage);
  
  return {
    text: content || "Failed to generate Facebook variant",
    tips: [
      "Best posting times: Lunch (11 AM - 1 PM) or Evening (6 PM - 9 PM)",
      "Always include a high-quality featured image (1200x628 pixels)",
      "Video content gets 10x more engagement than static posts",
      "Enable 'Allow reactions' to boost organic reach"
    ]
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, title, excerpt, content } = body;

    // If slug provided, fetch from posts
    let blogData = { title, excerpt, content };
    if (slug) {
      const allPosts = getAllPosts();
      const post = allPosts.find((p) => p.slug === slug);
      if (post) {
        blogData = {
          title: post.title || title,
          excerpt: post.excerpt || excerpt,
          content: post.sections?.map((s) => (typeof s === "string" ? s : s.text || s.items?.join(" ") || "")).join(" ") || content,
        };
      }
    }

    if (!blogData.title || !blogData.content) {
      return NextResponse.json(
        { error: "Missing required fields: title and content" },
        { status: 400 }
      );
    }

    // Generate variants in parallel
    const [linkedin, x, facebook] = await Promise.all([
      repurposeForLinkedIn(blogData.title, blogData.excerpt || "", blogData.content),
      repurposeForX(blogData.title, blogData.excerpt || "", blogData.content),
      repurposeForFacebook(blogData.title, blogData.excerpt || "", blogData.content),
    ]);

    return NextResponse.json(
      {
        success: true,
        source: { title: blogData.title, slug },
        variants: { linkedin, x, facebook },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Repurpose error:", err);
    return NextResponse.json(
      { error: "Failed to repurpose content", details: err.message },
      { status: 500 }
    );
  }
}
