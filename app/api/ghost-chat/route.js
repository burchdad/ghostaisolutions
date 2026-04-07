import { NextResponse } from "next/server";

const encoder = new TextEncoder();
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

function resolveMode(message, explicitMode = "") {
  if (explicitMode === "swarm" || explicitMode === "blueprint") {
    return explicitMode;
  }

  const text = String(message || "").toLowerCase();
  if (text.includes("swarm") || text.includes("multi-agent") || text.includes("all agents")) {
    return "swarm";
  }
  if (text.includes("blueprint") || text.includes("architecture") || text.includes("spec")) {
    return "blueprint";
  }

  return "default";
}

function buildFallbackReply(message, messages = [], options = {}) {
  const mode = options.mode || "default";
  const pageContext = options.pageContext || "";
  const memory = options.memory || {};
  const text = String(message || "").toLowerCase();
  const history = messages.map((entry) => String(entry?.content || "")).join(" ").toLowerCase();

  if (mode === "swarm") {
    return [
      "[Swarm Mode]",
      "Architect Agent: Define the target workflow and success metric first, then lock required integrations.",
      "Data Agent: Identify trusted data sources and build a single normalized event pipeline.",
      "Automation Agent: Replace repetitive handoffs with rule-driven automations and approval gates.",
      "Revenue Ops Agent: Track response time, conversion lift, and handoff quality from day one.",
      "Unified Plan: Start with one high-friction workflow, ship a controlled v1, then expand across adjacent flows.",
    ].join("\n");
  }

  if (mode === "blueprint") {
    return [
      "[Blueprint]",
      `Context: ${pageContext || "General build request"}`,
      "Phase 1 - Discovery: Workflow map, bottleneck analysis, integration inventory.",
      "Phase 2 - Architecture: Data model, control plane, automation logic, audit paths.",
      "Phase 3 - Build: Core system implementation, API wiring, UI/operator surfaces.",
      "Phase 4 - Deploy: Staged rollout, monitoring, fallback plans, optimization loops.",
      `Memory Signals: ${Array.isArray(memory?.intents) && memory.intents.length ? memory.intents.join(", ") : "No prior signals yet"}.`,
      "Deliverables: Architecture diagram, implementation spec, KPI dashboard, deployment runbook.",
    ].join("\n");
  }

  if (text.includes("voice") || text.includes("phone") || text.includes("call")) {
    return "Ghost Voice can handle that lane. We can build a voice layer that answers, routes, qualifies, and hands off using your exact workflow and approval rules.";
  }

  if (text.includes("platform") || text.includes("portal") || text.includes("dashboard") || text.includes("internal")) {
    return "That sounds like a custom platform build. We would map the workflow, define the operating logic, and engineer the platform around your team instead of forcing a SaaS template.";
  }

  if (text.includes("automation") || text.includes("workflow") || text.includes("crm") || text.includes("pipeline") || history.includes("automation")) {
    return "That fits Ghost well. We can replace workflow drag with a custom automation and intelligence layer connected directly to your CRM, inbox, data sources, and internal process controls.";
  }

  if (text.includes("scraper") || text.includes("data") || text.includes("intelligence")) {
    return "Ghost can build the data pipeline for that. We routinely engineer custom scraper and intelligence systems that turn scattered inputs into usable signals and decisions.";
  }

  if (text.includes("pricing") || text.includes("quote") || text.includes("budget") || text.includes("project") || text.includes("build")) {
    return "Best next step is to start the project intake. Send the workflow, current stack, timeline, and the bottleneck you need removed, and we can scope the right build path quickly.";
  }

  return "If the problem is real and the current tools are not enough, that is exactly where Ghost fits. Tell me the workflow, the bottleneck, and the outcome you want, and I will help frame the right build path.";
}

async function tryGhostbotUpstream(messages, message) {
  const endpoint = process.env.GHOSTBOT_API_URL;
  if (!endpoint) {
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        message,
        source: "ghostai.solutions",
        mode: "chat",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return (
      data?.reply ||
      data?.message ||
      data?.content ||
      data?.output_text ||
      data?.choices?.[0]?.message?.content ||
      null
    );
  } catch {
    return null;
  }
}

async function tryOpenAIUpstream(messages, message, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const baseUrl = process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
  const mode = options.mode || "default";
  const pageContext = options.pageContext || "";
  const memory = options.memory || {};

  const modeInstruction =
    mode === "swarm"
      ? "Respond in Swarm mode with four concise sections: Architect Agent, Data Agent, Automation Agent, Revenue Ops Agent, and end with Unified Plan."
      : mode === "blueprint"
        ? "Respond as a build blueprint with headings: Context, Phases, Risks, Metrics, Next Action. Keep it concise and implementation-ready."
        : "Respond as Ghost with practical, concise guidance focused on real-world implementation.";

  const formattedMessages = [
    {
      role: "system",
      content:
        `You are Ghost, a concise engineering assistant for Ghost AI Solutions. ${modeInstruction}`,
    },
    pageContext
      ? {
          role: "system",
          content: `Current page context: ${pageContext}.`,
        }
      : null,
    Array.isArray(memory?.intents) && memory.intents.length
      ? {
          role: "system",
          content: `Known visitor intent signals: ${memory.intents.join(", ")}.`,
        }
      : null,
    ...messages
      .filter((entry) => entry?.role && entry?.content)
      .map((entry) => ({ role: entry.role === "ghost" ? "assistant" : entry.role, content: String(entry.content) })),
  ].filter(Boolean);

  if (!formattedMessages.some((entry) => entry.role === "user" && entry.content === message)) {
    formattedMessages.push({ role: "user", content: message });
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.5,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

function splitIntoChunks(text) {
  const tokens = String(text || "").split(/(\s+)/).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const token of tokens) {
    current += token;
    if (current.length >= 18 || token.trim() === "") {
      chunks.push(current);
      current = "";
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length ? chunks : [String(text || "")];
}

function buildStreamResponse(reply, source, meta = {}) {
  const chunks = splitIntoChunks(reply);

  const stream = new ReadableStream({
    start(controller) {
      let index = 0;

      const pushChunk = () => {
        if (index >= chunks.length) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, source, meta })}\n\n`));
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunks[index], source })}\n\n`));
        index += 1;
        setTimeout(pushChunk, 35);
      };

      pushChunk();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const message = String(body?.message || messages.at(-1)?.content || "").trim();
    const wantsStream = Boolean(body?.stream);
    const mode = resolveMode(message, body?.mode);
    const pageContext = String(body?.pageContext || "");
    const memory = body?.memory && typeof body.memory === "object" ? body.memory : {};
    const meta = { mode, pageContext };

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const upstreamReply = await tryGhostbotUpstream(messages, message);
    if (upstreamReply) {
      if (wantsStream) {
        return buildStreamResponse(upstreamReply, "ghostbot-api", meta);
      }
      return NextResponse.json({ reply: upstreamReply, source: "ghostbot-api", meta });
    }

    const openAIReply = await tryOpenAIUpstream(messages, message, { mode, pageContext, memory });
    if (openAIReply) {
      if (wantsStream) {
        return buildStreamResponse(openAIReply, "openai-api", meta);
      }
      return NextResponse.json({ reply: openAIReply, source: "openai-api", meta });
    }

    const fallbackReply = buildFallbackReply(message, messages, { mode, pageContext, memory });

    if (wantsStream) {
      return buildStreamResponse(fallbackReply, "ghost-local-fallback", meta);
    }

    return NextResponse.json({
      reply: fallbackReply,
      source: "ghost-local-fallback",
      meta,
    });
  } catch {
    return NextResponse.json({ error: "Unable to process Ghost chat request." }, { status: 500 });
  }
}