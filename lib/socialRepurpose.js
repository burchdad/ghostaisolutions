const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

const SPAM_PHRASES = [
  "game-changing",
  "revolutionize",
  "unlock",
  "guaranteed",
  "instant results",
  "best ever",
];

function getPlatformRules(platform) {
  return {
    linkedin: { maxLength: 1200, targetLength: "150-300 words", tone: "professional" },
    x: { maxLength: 280, targetLength: "180-240 chars", tone: "punchy" },
    facebook: { maxLength: 500, targetLength: "60-180 words", tone: "conversational" },
  }[platform];
}

export function analyzeVariant(platform, text = "") {
  const rules = getPlatformRules(platform);
  const normalized = String(text || "").trim();
  const hashtags = normalized.match(/#[\w-]+/g) || [];
  const warnings = [];

  if (rules?.maxLength && normalized.length > rules.maxLength) {
    warnings.push(`Over recommended length for ${platform}`);
  }

  if (platform === "x" && normalized.includes("\n\n")) {
    warnings.push("X post reads like long-form copy");
  }

  if (hashtags.length > 4) {
    warnings.push("Too many hashtags");
  }

  if (SPAM_PHRASES.some((phrase) => normalized.toLowerCase().includes(phrase))) {
    warnings.push("Contains salesy or spam-like phrasing");
  }

  if (!normalized.endsWith(".") && platform !== "x") {
    warnings.push("Ending may feel abrupt");
  }

  const confidenceScore = Math.max(45, 92 - warnings.length * 11 - Math.max(0, normalized.length - (rules?.maxLength || 0)) / 25);
  const engagementScore = confidenceScore >= 80 ? "High" : confidenceScore >= 65 ? "Medium" : "Low";

  return {
    characterCount: normalized.length,
    hashtags: hashtags.length,
    recommendedMax: rules?.maxLength || null,
    targetLength: rules?.targetLength || null,
    tone: rules?.tone || null,
    warnings,
    confidenceScore: Math.round(confidenceScore),
    engagementScore,
  };
}

export function normalizeVariant(platform, variant) {
  const text = typeof variant === "string" ? variant : variant?.text || "";
  const tips = Array.isArray(variant?.tips) ? variant.tips : [];
  const moderation = variant?.moderation || null;
  return {
    text,
    tips,
    analysis: analyzeVariant(platform, text),
    ...(moderation ? { moderation } : {}),
  };
}

function makeModerationDecision(platform, analysis, text) {
  const hardLimit = analysis?.recommendedMax || 0;
  const normalized = String(text || "").trim();
  const hardFail =
    !normalized ||
    (hardLimit && normalized.length > hardLimit + 30) ||
    analysis.warnings.some((warning) => warning.includes("spam-like"));

  if (hardFail) {
    return {
      status: "blocked",
      rationale: `Moderator could not normalize ${platform} content within constraints.`,
    };
  }

  if (analysis.warnings.length >= 3) {
    return {
      status: "review",
      rationale: `Moderator detected multiple quality risks for ${platform}.`,
    };
  }

  return {
    status: "approved",
    rationale: `Moderator approved ${platform} copy for live publishing.`,
  };
}

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
        temperature: 0.6,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("LLM call failed:", error);
    return null;
  }
}

async function repurposeForLinkedIn(blogTitle, blogExcerpt, blogContent) {
  const systemPrompt = `You are a LinkedIn content specialist for Ghost AI Solutions.
Create concise, credible thought-leadership copy.

Rules:
- Tone: professional, grounded, no hype
- Length: 120-220 words
- Structure: hook, 2-3 insights, CTA
- Keep paragraphs short
- Use 3-5 relevant hashtags max
- Avoid filler and generic AI phrasing

Return only final post text.`;

  const userMessage = `Create a LinkedIn post from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 1200)}`;

  return {
    text: (await callLLM(systemPrompt, userMessage)) || `${blogTitle}\n\n${blogExcerpt}`,
    tips: [
      "Lead with one sharp operational insight.",
      "Keep the CTA focused on discussion or a practical takeaway.",
      "Do not overload with hashtags.",
    ],
  };
}

async function repurposeForX(blogTitle, blogExcerpt, blogContent) {
  const systemPrompt = `You are an X content editor for Ghost AI Solutions.
Create concise posts that feel native to X.

Rules:
- Hard max: 240 characters
- Tone: punchy, sharp, useful
- No long paragraphs
- 0-2 hashtags max
- No emoji unless absolutely necessary
- End with a clear insight or question

Return only the final post text.`;

  const userMessage = `Create a single X post from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 900)}`;

  const fallback = `${blogTitle}: ${blogExcerpt}`.slice(0, 237);
  return {
    text: (await callLLM(systemPrompt, userMessage)) || fallback,
    tips: [
      "Keep it under 240 characters for flexibility.",
      "One strong point beats three weak ones.",
      "Avoid sounding like a blog summary.",
    ],
  };
}

async function repurposeForFacebook(blogTitle, blogExcerpt, blogContent) {
  const systemPrompt = `You are a Facebook page content editor for Ghost AI Solutions.
Create copy that feels conversational but specific.

Rules:
- Length: 60-140 words
- Tone: approachable, practical
- Include a CTA to read, learn more, or comment
- Keep it skimmable
- Avoid jargon and hype

Return only the final post text.`;

  const userMessage = `Create a Facebook post from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 900)}`;

  return {
    text: (await callLLM(systemPrompt, userMessage)) || `${blogTitle}\n\n${blogExcerpt}`,
    tips: [
      "Use a clear CTA.",
      "Write like a human operator, not a brochure.",
      "Keep the first sentence readable without context.",
    ],
  };
}

export async function repurposeBlogPost({ title, excerpt = "", content }) {
  const [linkedin, x, facebook] = await Promise.all([
    repurposeForLinkedIn(title, excerpt, content),
    repurposeForX(title, excerpt, content),
    repurposeForFacebook(title, excerpt, content),
  ]);

  return moderateVariants({
    title,
    excerpt,
    variants: {
      linkedin: normalizeVariant("linkedin", linkedin),
      x: normalizeVariant("x", x),
      facebook: normalizeVariant("facebook", facebook),
    },
  });
}

export async function optimizeVariant({ platform, text, title = "", excerpt = "" }) {
  const rules = getPlatformRules(platform);
  if (!rules) {
    throw new Error("Unsupported platform");
  }

  const systemPrompt = `You are editing social copy for ${platform}.
Rewrite the text to fit this platform.

Rules:
- Tone: ${rules.tone}
- Max length: ${rules.maxLength} characters
- Remove fluff and repetitive phrasing
- Keep the strongest idea intact
- Return only the final rewritten text`;

  const userMessage = `Title: ${title}
Excerpt: ${excerpt}
Existing text:
${text}`;

  const optimized = (await callLLM(systemPrompt, userMessage)) || String(text || "").slice(0, rules.maxLength);
  return normalizeVariant(platform, { text: optimized });
}

export async function moderateVariant({ platform, variant, title = "", excerpt = "" }) {
  const normalized = normalizeVariant(platform, variant);
  const optimized = await optimizeVariant({
    platform,
    text: normalized.text,
    title,
    excerpt,
  });

  const decision = makeModerationDecision(platform, optimized.analysis, optimized.text);

  return {
    ...optimized,
    tips: Array.from(new Set([...(normalized.tips || []), ...(optimized.tips || [])])),
    moderation: {
      status: decision.status,
      rationale: decision.rationale,
      moderatedAt: new Date().toISOString(),
      moderator: "ghost-social-moderator",
    },
  };
}

export async function moderateVariants({ variants, title = "", excerpt = "" }) {
  const [linkedin, x, facebook] = await Promise.all([
    moderateVariant({ platform: "linkedin", variant: variants.linkedin, title, excerpt }),
    moderateVariant({ platform: "x", variant: variants.x, title, excerpt }),
    moderateVariant({ platform: "facebook", variant: variants.facebook, title, excerpt }),
  ]);

  const moderation = {
    approved: [],
    blocked: [],
    review: [],
  };

  for (const [platform, value] of Object.entries({ linkedin, x, facebook })) {
    moderation[value.moderation?.status || "review"].push(platform);
  }

  return {
    variants: { linkedin, x, facebook },
    moderation: {
      status: moderation.blocked.length ? "blocked" : moderation.review.length ? "review" : "approved",
      ...moderation,
    },
  };
}