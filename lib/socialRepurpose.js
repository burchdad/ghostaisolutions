const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

const SPAM_PHRASES = [
  "game-changing",
  "revolutionize",
  "unlock",
  "supercharge",
  "game-changers",
  "don't miss out",
  "boost your",
  "cutting-edge",
  "rapidly changing",
  "enhance productivity",
  "enhance operational efficiency",
  "transform your operations",
  "elevate your operations",
  "guaranteed",
  "instant results",
  "best ever",
];

export const SOCIAL_PLATFORMS = ["linkedin", "x", "facebook", "bluesky", "reddit"];

function getCanonicalSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.ghostai.solutions").replace(/\/$/, "");
  if (raw === "https://ghostai.solutions") return "https://www.ghostai.solutions";
  return raw;
}

function buildTrackedBlogUrl(slug = "", platform = "social") {
  if (!slug) return "";
  const safeSlug = String(slug || "").replace(/^\/+/, "");
  const source = SOCIAL_PLATFORMS.includes(platform) ? platform : "social";
  return `${getCanonicalSiteUrl()}/blog/${safeSlug}?utm_source=${source}&utm_medium=social&utm_campaign=auto_blog`;
}

function limitText(text = "", maxLength = 0) {
  const normalized = String(text || "").trim();
  if (!maxLength || normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function cleanGeneratedCopy(text = "", { stripUrls = false } = {}) {
  let cleaned = String(text || "")
    .replace(/\*\*/g, "")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^\s*title:\s*/gim, "")
    .replace(/\b(read more|learn more|check out our blog|click here):?\s*$/gi, "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  if (stripUrls) {
    cleaned = cleaned.replace(/\s*https?:\/\/\S+/gi, "").trim();
  }

  return cleaned;
}

function appendTrackedLink(platform, text = "", slug = "") {
  const link = buildTrackedBlogUrl(slug, platform);
  const normalized = cleanGeneratedCopy(text, { stripUrls: true });
  if (!link || !normalized) {
    return normalized;
  }

  if (platform === "x" || platform === "bluesky") {
    const hardMax = platform === "x" ? 280 : 300;
    let base = normalized.replace(/\s*https?:\/\/\S+/gi, "").trim();
    const required = link.length + 1;
    if (base.length + required > hardMax) {
      const maxBase = Math.max(0, hardMax - required - 1);
      base = `${base.slice(0, maxBase).trimEnd()}...`;
    }
    return `${base} ${link}`.trim();
  }

  return `${normalized}\n\n${link}`;
}

function getPlatformRules(platform) {
  return {
    linkedin: { maxLength: 1200, targetLength: "150-300 words", tone: "professional" },
    x: { maxLength: 280, targetLength: "180-240 chars", tone: "punchy" },
    facebook: { maxLength: 500, targetLength: "60-180 words", tone: "conversational" },
    bluesky: { maxLength: 300, targetLength: "180-260 chars", tone: "sharp and useful" },
    reddit: { maxLength: 2500, targetLength: "120-300 words", tone: "community-first and non-promotional" },
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

  if (platform === "reddit" && /free audit|book a call|buy|limited time/i.test(normalized)) {
    warnings.push("Reddit copy sounds promotional");
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
  const text = cleanGeneratedCopy(typeof variant === "string" ? variant : variant?.text || "");
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

async function repurposeForLinkedIn(blogTitle, blogExcerpt, blogContent, blogUrl = "") {
  const systemPrompt = `You are a LinkedIn content specialist for Ghost AI Solutions.
Create helpful, grounded posts that sound like a business owner sharing a practical observation.

Rules:
- Tone: natural, warm, useful, never corporate
- Length: 90-160 words
- Structure: human observation, 1-2 useful takeaways, soft question
- Keep paragraphs short
- Do not use markdown, bold text, emojis, hashtags, or title labels
- Do not say unlock, supercharge, game-changer, dive in, don't miss out, boost productivity, rapidly changing, or enhance operational efficiency
- Mention at most one named tool from the source unless comparison is the point
- End with a question or invitation to think, not a sales CTA

Return only final post text.`;

  const userMessage = `Create a LinkedIn post from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 1200)}
Blog URL: ${blogUrl || "N/A"}`;

  return {
    text: (await callLLM(systemPrompt, userMessage)) || `${blogTitle}\n\n${blogExcerpt}`,
    tips: [
      "Lead with one sharp operational insight.",
      "Keep the CTA focused on discussion or a practical takeaway.",
      "Do not overload with hashtags.",
    ],
  };
}

async function repurposeForX(blogTitle, blogExcerpt, blogContent, blogUrl = "") {
  const systemPrompt = `You are an X content editor for Ghost AI Solutions.
Create a concise post that sounds like a real operator noticing something useful.

Rules:
- Hard max: 210 characters before the link
- Tone: plainspoken, curious, useful
- No long paragraphs
- No hashtags, no emoji, no markdown
- No hype phrases like unlock, supercharge, game-changer, don't miss out, boost, or cutting-edge
- Make one point only
- End with a useful question when it fits

Return only the final post text.`;

  const userMessage = `Create a single X post from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 900)}
Blog URL: ${blogUrl || "N/A"}`;

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

async function repurposeForFacebook(blogTitle, blogExcerpt, blogContent, blogUrl = "") {
  const systemPrompt = `You are a Facebook page content editor for Ghost AI Solutions.
Create friendly, practical copy that feels like a helpful note from a local automation consultant.

Rules:
- Length: 50-110 words
- Tone: welcoming, specific, conversational
- Open with a relatable business problem, not a headline
- Include one plain-language takeaway
- End with a gentle question or invitation to compare notes
- Keep it skimmable
- No markdown, no emoji, no hashtags
- Avoid jargon and hype phrases like latest AI tools, cutting-edge, supercharge, game-changer, boost, don't miss out, and transform your operations

Return only the final post text.`;

  const userMessage = `Create a Facebook post from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 900)}
Blog URL: ${blogUrl || "N/A"}`;

  return {
    text: (await callLLM(systemPrompt, userMessage)) || `${blogTitle}\n\n${blogExcerpt}`,
    tips: [
      "Use a clear CTA.",
      "Write like a human operator, not a brochure.",
      "Keep the first sentence readable without context.",
    ],
  };
}

async function repurposeForBluesky(blogTitle, blogExcerpt, blogContent, blogUrl = "") {
  const systemPrompt = `You are a Bluesky post editor for Ghost AI Solutions.
Create concise posts that feel observant, useful, and human.

Rules:
- Hard max: 220 characters before the link
- Tone: direct, curious, useful, relaxed
- No hashtags, emoji, markdown, or sales CTA
- No hype phrases like unlock, supercharge, game-changer, don't miss out, boost, or cutting-edge
- Make one clear point
- Prefer an insight someone might reply to over a summary

Return only the final post text.`;

  const userMessage = `Create a Bluesky post from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 900)}
Blog URL: ${blogUrl || "N/A"}`;

  const fallback = `${blogTitle}: ${blogExcerpt}`.slice(0, 250);
  return {
    text: (await callLLM(systemPrompt, userMessage)) || fallback,
    tips: [
      "One useful point travels better than a summary.",
      "Avoid hashtags unless they add real discovery value.",
      "Keep enough room for the tracked link.",
    ],
  };
}

async function repurposeForReddit(blogTitle, blogExcerpt, blogContent, blogUrl = "") {
  const systemPrompt = `You are a Reddit community editor for Ghost AI Solutions.
Create a discussion-first post that feels like a human asking operators and builders to compare notes.

Rules:
- Tone: helpful, transparent, non-promotional
- Do not sound like an ad, content farm, press release, or company announcement
- Open with a practical observation
- Use short paragraphs, not a title dump
- Mention 1-2 concrete examples from the source, then explain the tradeoff in plain language
- No markdown bold, no emojis, no hashtags
- Do not use phrases like unlock, supercharge, game-changer, don't miss out, boost, cutting-edge, or enhance productivity
- End with a genuine question for operators/builders

Return only the final Reddit self-post body.`;

  const userMessage = `Create Reddit self-post body copy from this blog content:
Title: ${blogTitle}
Excerpt: ${blogExcerpt}
Content: ${blogContent.substring(0, 1200)}
Blog URL: ${blogUrl || "N/A"}`;

  return {
    text: (await callLLM(systemPrompt, userMessage)) || `${blogTitle}\n\n${blogExcerpt}\n\nSource: ${blogUrl}`.trim(),
    tips: [
      "Post only where the subreddit rules allow company/source links.",
      "Lead with discussion value, not promotion.",
      "Expect Reddit to perform better with fewer, more intentional posts.",
    ],
  };
}

export async function repurposeBlogPost({ title, excerpt = "", content, slug = "" }) {
  const linkedinUrl = buildTrackedBlogUrl(slug, "linkedin");
  const xUrl = buildTrackedBlogUrl(slug, "x");
  const facebookUrl = buildTrackedBlogUrl(slug, "facebook");
  const blueskyUrl = buildTrackedBlogUrl(slug, "bluesky");
  const redditUrl = buildTrackedBlogUrl(slug, "reddit");

  const [linkedin, x, facebook, bluesky, reddit] = await Promise.all([
    repurposeForLinkedIn(title, excerpt, content, linkedinUrl),
    repurposeForX(title, excerpt, content, xUrl),
    repurposeForFacebook(title, excerpt, content, facebookUrl),
    repurposeForBluesky(title, excerpt, content, blueskyUrl),
    repurposeForReddit(title, excerpt, content, redditUrl),
  ]);

  return moderateVariants({
    title,
    excerpt,
    variants: {
      linkedin: normalizeVariant("linkedin", { ...linkedin, text: appendTrackedLink("linkedin", linkedin?.text, slug) }),
      x: normalizeVariant("x", { ...x, text: appendTrackedLink("x", x?.text, slug) }),
      facebook: normalizeVariant("facebook", { ...facebook, text: appendTrackedLink("facebook", facebook?.text, slug) }),
      bluesky: normalizeVariant("bluesky", { ...bluesky, text: appendTrackedLink("bluesky", bluesky?.text, slug) }),
      reddit: normalizeVariant("reddit", { ...reddit, text: appendTrackedLink("reddit", reddit?.text, slug) }),
    },
  });
}

export async function optimizeVariant({ platform, text, title = "", excerpt = "" }) {
  const rules = getPlatformRules(platform);
  if (!rules) {
    throw new Error("Unsupported platform");
  }

  const systemPrompt = `You are editing social copy for ${platform}.
Rewrite the text so it feels human, useful, and native to ${platform}.

Rules:
- Tone: ${rules.tone}
- Max length: ${rules.maxLength} characters
- Remove fluff, hype, generic AI phrasing, and repetitive phrasing
- Remove markdown bold, emojis, hashtags, and title labels
- Replace summary language with one concrete observation or tradeoff
- Avoid: unlock, supercharge, game-changer, don't miss out, boost, cutting-edge, rapidly changing, enhance productivity, enhance operational efficiency
- Keep the strongest idea intact
- Return only the final rewritten text`;

  const userMessage = `Title: ${title}
Excerpt: ${excerpt}
Existing text:
${text}`;

  const optimized = (await callLLM(systemPrompt, userMessage)) || String(text || "").slice(0, rules.maxLength);
  return normalizeVariant(platform, { text: limitText(optimized, rules.maxLength) });
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
  const moderatedEntries = await Promise.all(
    SOCIAL_PLATFORMS.filter((platform) => variants[platform]).map(async (platform) => [
      platform,
      await moderateVariant({ platform, variant: variants[platform], title, excerpt }),
    ])
  );
  const moderatedVariants = Object.fromEntries(moderatedEntries);

  const moderation = {
    approved: [],
    blocked: [],
    review: [],
  };

  for (const [platform, value] of Object.entries(moderatedVariants)) {
    moderation[value.moderation?.status || "review"].push(platform);
  }

  return {
    variants: moderatedVariants,
    moderation: {
      status: moderation.blocked.length ? "blocked" : moderation.review.length ? "review" : "approved",
      ...moderation,
    },
  };
}
