"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { BOOKING_URL } from "@/lib/constants";
import { emitGhostPulseBurst, emitGhostState, emitGhostVoiceState, onGhostPanelToggle } from "@/lib/ghostAvatarSignals";

const CHAT_STORAGE_KEY = "ghost-chat-thread-v2";
const MEMORY_STORAGE_KEY = "ghost-memory-graph-v1";
const PROACTIVE_STORAGE_KEY = "ghost-proactive-v1";

const quickActions = [
  "Need a custom platform",
  "Need AI voice",
  "Need automation",
  "Generate blueprint",
  "Run swarm analysis",
  "Start a Project",
];

function getSpeechRecognition() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function getPageContext(pathname) {
  if (pathname.startsWith("/technology")) {
    return {
      label: "Technology",
      welcome: "Ghost online in Technology mode. Tell me what stack you are replacing and what needs to be custom.",
      proactive: {
        scroll: "You are deep in the tech stack. Want a migration blueprint?",
        dwell: "Need a custom architecture map for this stack?",
        exit: "Before you leave: I can draft a cutover plan in one response.",
      },
    };
  }

  if (pathname.startsWith("/projects") || pathname.startsWith("/work")) {
    return {
      label: "Projects",
      welcome: "Ghost online in Projects mode. Share your industry and I will map a similar system approach.",
      proactive: {
        scroll: "Want a project blueprint shaped around your industry?",
        dwell: "I can break this into phases and expected outcomes in one pass.",
        exit: "Need a quick case-style build path before you go?",
      },
    };
  }

  if (pathname.startsWith("/services")) {
    return {
      label: "Services",
      welcome: "Ghost online in Services mode. Tell me the bottleneck and I will suggest the best build lane.",
      proactive: {
        scroll: "Want a recommendation for which service lane to build first?",
        dwell: "I can map one workflow into a production-ready phase plan.",
        exit: "Before you leave: want a scoped build path in 60 seconds?",
      },
    };
  }

  return {
    label: "Homepage",
    welcome: "Ghost online. Tell me what you need built, and I will point you to the fastest custom path.",
    proactive: {
      scroll: "Want a custom build blueprint for your workflow?",
      dwell: "I can scope your first phase in under a minute.",
      exit: "Before you go: want a practical build plan to take with you?",
    },
  };
}

function resolveModeFromMessage(message) {
  const text = String(message || "").toLowerCase();
  if (text.includes("swarm") || text.includes("multi-agent") || text.includes("all agents")) {
    return "swarm";
  }
  if (text.includes("blueprint") || text.includes("architecture") || text.includes("spec")) {
    return "blueprint";
  }
  return "default";
}

function deriveIntentSignals(message) {
  const text = String(message || "").toLowerCase();
  const intents = [];
  const industries = [];

  if (text.includes("voice") || text.includes("dialer") || text.includes("phone")) intents.push("voice");
  if (text.includes("automation") || text.includes("workflow") || text.includes("pipeline")) intents.push("automation");
  if (text.includes("platform") || text.includes("portal") || text.includes("dashboard")) intents.push("platform");
  if (text.includes("data") || text.includes("scraper") || text.includes("intelligence")) intents.push("data");
  if (text.includes("blueprint") || text.includes("spec")) intents.push("blueprint");
  if (text.includes("swarm") || text.includes("multi-agent")) intents.push("swarm");

  if (text.includes("real estate")) industries.push("real-estate");
  if (text.includes("oil") || text.includes("gas")) industries.push("oil-gas");
  if (text.includes("hvac")) industries.push("hvac");
  if (text.includes("restaurant") || text.includes("food")) industries.push("restaurants");
  if (text.includes("construction")) industries.push("construction");

  return { intents, industries };
}

function mergeMemory(current, update, pathname, mode) {
  const intents = new Set([...(current.intents || []), ...(update.intents || [])]);
  const industries = new Set([...(current.industries || []), ...(update.industries || [])]);
  const pagesVisited = new Set([...(current.pagesVisited || []), pathname || "/"]);

  return {
    intents: Array.from(intents),
    industries: Array.from(industries),
    pagesVisited: Array.from(pagesVisited),
    asks: (current.asks || 0) + 1,
    lastMode: mode,
    lastSeen: Date.now(),
  };
}

function formatMessagesForApi(messages) {
  return messages.map((message) => ({
    role: message.role,
    content: message.text,
  }));
}

function normalizeLoadedMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  const seenNudges = new Set();
  const cleaned = messages.filter((message) => {
    if (!message || typeof message !== "object") {
      return false;
    }

    if (!message.meta?.nudge) {
      return true;
    }

    const dedupeKey = message.meta?.key || `${message.text || ""}|${message.meta?.context || ""}`;
    if (seenNudges.has(dedupeKey)) {
      return false;
    }

    seenNudges.add(dedupeKey);
    return true;
  });

  // Keep the thread compact and relevant.
  return cleaned.slice(-60);
}

export default function FloatingBot() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("Ghost is hovering in standby.");
  const [micSupported, setMicSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [introBubbleVisible, setIntroBubbleVisible] = useState(true);
  const [floatingPrompt, setFloatingPrompt] = useState("Ghost online. Click me when you are ready to talk build strategy.");
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [pathname, setPathname] = useState("/");
  const [homeHeroPassed, setHomeHeroPassed] = useState(false);
  const [memoryGraph, setMemoryGraph] = useState({ intents: [], industries: [], pagesVisited: [], asks: 0, lastMode: "default" });
  const panelRef = useRef(null);
  const messagesRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldRestartRecognitionRef = useRef(false);

  const pageContext = useMemo(() => getPageContext(pathname), [pathname]);

  useEffect(() => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
    setPathname(currentPath);
    if (currentPath === "/") {
      setHomeHeroPassed(window.scrollY > 420);
    } else {
      setHomeHeroPassed(true);
    }
    setMicSupported(typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia));
    setRecognitionSupported(Boolean(getSpeechRecognition()));
    setIsMobile(typeof window !== "undefined" ? window.innerWidth < 640 : false);

    const offPanel = onGhostPanelToggle((detail) => {
      setOpen(typeof detail.open === "boolean" ? detail.open : true);
      setStatus("Ghost channel opened.");
    });

    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);

    try {
      const rawChat = localStorage.getItem(CHAT_STORAGE_KEY);
      if (rawChat) {
        const parsed = JSON.parse(rawChat);
        if (Array.isArray(parsed.messages) && parsed.messages.length) {
          setMessages(normalizeLoadedMessages(parsed.messages));
        }
      }

      const rawMemory = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (rawMemory) {
        const parsedMemory = JSON.parse(rawMemory);
        if (parsedMemory && typeof parsedMemory === "object") {
          setMemoryGraph(parsedMemory);
        }
      }
    } catch {}

    setIsHydrated(true);

    const introTimer = window.setTimeout(() => {
      setIntroBubbleVisible(false);
    }, 5500);

    const onResize = () => setIsMobile(window.innerWidth < 640);
    const onScrollHero = () => {
      if (currentPath !== "/") {
        return;
      }

      setHomeHeroPassed(window.scrollY > 420);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScrollHero);

    return () => {
      offPanel();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScrollHero);
      window.clearTimeout(introTimer);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || messages.length) {
      return;
    }

    setMessages([
      {
        id: `ghost-welcome-${Date.now()}`,
        role: "ghost",
        text: pageContext.welcome,
        meta: { mode: "default", context: pageContext.label },
      },
    ]);
    setFloatingPrompt(pageContext.welcome);
    emitGhostState({
      mode: "default",
      thinking: false,
      pageContext: pageContext.label,
      intents: memoryGraph.intents || [],
      memory: memoryGraph,
      source: "floating-welcome",
    });
  }, [isHydrated, messages.length, pageContext, memoryGraph]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      // Proactive nudges are ephemeral prompts and should not accumulate in persistent history.
      const persistableMessages = messages.filter((message) => !message.meta?.nudge);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ messages: persistableMessages }));
    } catch {}
  }, [messages, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memoryGraph));
    } catch {}
  }, [memoryGraph, isHydrated]);

  useEffect(() => {
    if (!isHydrated || open) {
      return;
    }

    let proactiveFlags = {};
    try {
      proactiveFlags = JSON.parse(sessionStorage.getItem(PROACTIVE_STORAGE_KEY) || "{}");
    } catch {
      proactiveFlags = {};
    }

    let pageFlags = proactiveFlags[pathname] || {};

    const saveFlag = (key) => {
      const next = {
        ...proactiveFlags,
        [pathname]: { ...(proactiveFlags[pathname] || {}), [key]: true },
      };
      proactiveFlags = next;
      pageFlags = next[pathname] || {};
      try {
        sessionStorage.setItem(PROACTIVE_STORAGE_KEY, JSON.stringify(next));
      } catch {}
    };

    const pushProactiveMessage = (key, text) => {
      if (pageFlags[key]) {
        return;
      }

      saveFlag(key);
      setFloatingPrompt(text);
      setIntroBubbleVisible(true);
      setMessages((current) => {
        // Guard against duplicate proactive bubbles if multiple triggers fire close together.
        const alreadyAdded = current.some((entry) => entry.meta?.nudge && entry.meta?.key === key);
        if (alreadyAdded) {
          return current;
        }

        return [
          ...current,
          {
            id: `ghost-nudge-${key}-${Date.now()}`,
            role: "ghost",
            text,
            meta: { nudge: true, key, context: pageContext.label },
          },
        ];
      });
    };

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        return;
      }

      const ratio = window.scrollY / maxScroll;
      if (ratio > 0.45) {
        pushProactiveMessage("scroll", pageContext.proactive.scroll);
        window.removeEventListener("scroll", onScroll);
      }
    };

    const dwellTimer = window.setTimeout(() => {
      pushProactiveMessage("dwell", pageContext.proactive.dwell);
    }, 18000);

    const onMouseLeave = (event) => {
      if (event.clientY < 16) {
        pushProactiveMessage("exit", pageContext.proactive.exit);
      }
    };

    window.addEventListener("scroll", onScroll);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.clearTimeout(dwellTimer);
    };
  }, [isHydrated, open, pathname, pageContext]);

  useEffect(() => {
    if (!messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!open) {
      if (listening) {
        stopListening();
      }
      return;
    }

    const onClick = (e) => {
      if (!panelRef.current) return;
      const trigger = document.getElementById("ghostbot-trigger");
      const clickedTrigger = trigger && trigger.contains(e.target);
      const clickedPanel = panelRef.current.contains(e.target);
      if (!clickedTrigger && !clickedPanel) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, listening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const capabilityLabel = useMemo(() => {
    if (micSupported && recognitionSupported) {
      return "Voice reactive + swarm + blueprint ready";
    }
    if (micSupported) {
      return "Voice reactive + blueprint ready";
    }
    return "Context-aware Ghost mode";
  }, [micSupported, recognitionSupported]);

  const introCanShow = pathname !== "/" || homeHeroPassed;

  const stopListening = () => {
    shouldRestartRecognitionRef.current = false;
    setListening(false);
    setVoiceLevel(0);
    emitGhostVoiceState({ active: false, level: 0, source: "floating-chat" });

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {}
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setStatus("Ghost is hovering in standby.");
  };

  const startRecognition = () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const combined = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      setDraft(combined);
      if (combined) {
        setStatus("Ghost is listening.");
      }
    };

    recognition.onerror = () => {
      setStatus("Voice transcript unavailable. Reactive voice mode is still active.");
    };

    recognition.onend = () => {
      if (shouldRestartRecognitionRef.current) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;
    shouldRestartRecognitionRef.current = true;

    try {
      recognition.start();
    } catch {}
  };

  const startListening = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Microphone access is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        setStatus("Audio context is not available.");
        return;
      }

      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;

      setListening(true);
      setStatus("Microphone active. Ghost is reacting to your voice.");

      const samples = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) {
          return;
        }

        analyserRef.current.getByteFrequencyData(samples);
        const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
        const normalized = Math.max(0, Math.min(1, average / 90));
        setVoiceLevel(normalized);
        emitGhostVoiceState({ active: true, level: normalized, source: "floating-chat" });
        rafRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
      startRecognition();
    } catch {
      setStatus("Microphone permission was denied or unavailable.");
      stopListening();
    }
  };

  const appendGhostReply = async (message, nextMessages, mode, memorySnapshot) => {
    setIsReplying(true);
    const ghostMessageId = `ghost-${Date.now()}`;

    setMessages((current) => [
      ...current,
      { id: ghostMessageId, role: "ghost", text: "", meta: { mode, streaming: true } },
    ]);

    try {
      const response = await fetch("/api/ghost-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          messages: formatMessagesForApi(nextMessages),
          stream: true,
          mode,
          pageContext: pageContext.label,
          memory: memorySnapshot,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Ghost chat request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let source = "ghost-local-fallback";
      let meta = { mode };
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const line = event
            .split("\n")
            .find((entry) => entry.startsWith("data: "));

          if (!line) {
            continue;
          }

          const payload = JSON.parse(line.slice(6));
          source = payload.source || source;
      
          if (payload.delta) {
            meta = payload.meta || meta;
          }

          if (payload.meta) {
            meta = payload.meta;
          }

          if (payload.delta) {
            const tick = Date.now();
            emitGhostState({
              mode: meta?.mode || mode,
              thinking: true,
              chunkTick: tick,
              pageContext: pageContext.label,
              intents: memorySnapshot.intents || [],
              memory: memorySnapshot,
              source: "floating-stream",
            });
            setMessages((current) =>
              current.map((entry) =>
                entry.id === ghostMessageId
                  ? { ...entry, text: `${entry.text}${payload.delta}` }
                  : entry
              )
            );
          }
        }
      }

      setMessages((current) =>
        current.map((entry) =>
          entry.id === ghostMessageId
            ? {
                ...entry,
                meta: { ...(entry.meta || {}), ...(meta || {}), mode: meta?.mode || mode, streaming: false },
              }
            : entry
        )
      );

      setStatus(source === "ghostbot-api" ? "Ghost responded from live backend." : source === "openai-api" ? "Ghost responded from OpenAI." : "Ghost responded.");
      emitGhostPulseBurst({ source: "ghost_reply", mode: meta?.mode || mode });
      emitGhostState({
        mode: meta?.mode || mode,
        thinking: false,
        pageContext: pageContext.label,
        intents: memorySnapshot.intents || [],
        memory: memorySnapshot,
        source,
      });
    } catch {
      setMessages((current) =>
        current.map((entry) =>
          entry.id === ghostMessageId
            ? {
                ...entry,
                text: "Ghost backend is unavailable at the moment. Leave the workflow, current tools, and bottleneck, and we can still route you to the right build path.",
                meta: { ...(entry.meta || {}), streaming: false },
              }
            : entry
        )
      );
      setStatus("Ghost backend is temporarily unavailable.");
      emitGhostState({
        mode,
        thinking: false,
        pageContext: pageContext.label,
        intents: memorySnapshot.intents || [],
        memory: memorySnapshot,
        source: "floating-error",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const sendMessage = (message) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    const mode = resolveModeFromMessage(trimmed);
    const signals = deriveIntentSignals(trimmed);
    const nextMemory = mergeMemory(memoryGraph, signals, pathname, mode);
    setMemoryGraph(nextMemory);

    const nextMessages = [
      ...messages,
      { id: `user-${Date.now()}`, role: "user", text: trimmed, meta: { mode } },
    ];

    setMessages(nextMessages);
    setDraft("");
    setStatus(mode === "swarm" ? "Ghost swarm is thinking." : mode === "blueprint" ? "Ghost is drafting blueprint." : "Ghost is thinking.");
    emitGhostState({
      mode,
      thinking: true,
      pageContext: pageContext.label,
      intents: nextMemory.intents || [],
      memory: nextMemory,
      source: "floating-send",
      gesture: mode === "swarm" ? "swarm" : mode === "blueprint" ? "blueprint" : "chat",
    });
    appendGhostReply(trimmed, nextMessages, mode, nextMemory);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(draft);
  };

  return (
    <>
      <AnimatePresence>
        {introBubbleVisible && !open && introCanShow ? (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 16, y: 8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`fixed z-[99997] max-w-[240px] rounded-2xl border border-cyan-300/20 bg-slate-950/85 px-4 py-3 text-sm text-slate-200 shadow-[0_12px_40px_rgba(8,145,178,0.14)] ${isMobile ? "bottom-24 left-1/2 -translate-x-1/2" : "bottom-32 right-6"}`}
          >
            {floatingPrompt}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        id="ghostbot-trigger"
        initial={{ opacity: 0, x: 120, y: 180, scale: 0.35, rotate: -18 }}
        animate={{
          opacity: 1,
          x: 0,
          y: [0, isMobile ? -6 : -10, 0],
          scale: 1,
          rotate: 0,
        }}
        transition={{
          opacity: { duration: 0.45, ease: "easeOut" },
          x: { duration: 0.75, ease: "easeOut" },
          y: { duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.1 },
          scale: { duration: 0.75, ease: "easeOut" },
          rotate: { duration: 0.75, ease: "easeOut" },
        }}
        onClick={() => setOpen((value) => !value)}
        aria-label="Open Ghost chat"
        className={`fixed z-[99998] rounded-full bg-transparent ${isMobile ? "bottom-4 left-1/2 -translate-x-1/2" : pathname === "/" && !homeHeroPassed ? "bottom-4 right-4 opacity-80" : "bottom-6 right-6"}`}
      >
        <span className="ghost-holo-ring pointer-events-none absolute inset-2 rounded-full bg-cyan-400/20 blur-2xl animate-slowPulse" />
        <span className="ghost-holo-scan pointer-events-none absolute inset-0 rounded-full border border-cyan-300/20" />
        <span className={`relative flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-950/90 shadow-[0_0_35px_rgba(34,211,238,0.35)] ${isMobile ? "h-16 w-16" : "h-20 w-20"}`}>
          <Image
            src="/ghost-avatar.png"
            alt="Ghost floating avatar"
            width={88}
            height={88}
            className={`h-auto scale-[1.35] drop-shadow-[0_0_18px_rgba(34,211,238,0.55)] ${isMobile ? "w-14" : "w-16"}`}
          />
          <span
            className="pointer-events-none absolute left-[28%] top-[31%] h-2.5 w-3 rounded-full bg-cyan-300 blur-[4px]"
            style={{ opacity: 0.4 + voiceLevel * 0.6, transform: `scale(${1 + voiceLevel * 0.2})` }}
          />
          <span
            className="pointer-events-none absolute left-[56%] top-[31%] h-2.5 w-3 rounded-full bg-cyan-300 blur-[4px]"
            style={{ opacity: 0.4 + voiceLevel * 0.6, transform: `scale(${1 + voiceLevel * 0.2})` }}
          />
          <span
            className="pointer-events-none absolute left-1/2 top-[47%] h-[2px] w-4 -translate-x-1/2 rounded-full bg-cyan-300 blur-[2px]"
            style={{ opacity: 0.18 + voiceLevel * 0.72, transform: `translateX(-50%) scale(${1 + voiceLevel * 0.35})` }}
          />
        </span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.aside
            ref={panelRef}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className={`fixed z-[99997] flex flex-col overflow-hidden border border-cyan-300/20 bg-slate-950/92 shadow-[0_28px_100px_rgba(2,6,23,0.78)] backdrop-blur ${isMobile ? "inset-x-3 bottom-24 top-24 rounded-[26px]" : "bottom-28 right-6 h-[620px] w-[390px] rounded-[28px]"}`}
          >
            <div className="ghost-panel-holo pointer-events-none absolute inset-0" />
            <div className="relative border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_55%)] px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/20 bg-slate-900/90">
                    <span className="absolute inset-1 rounded-full bg-cyan-400/15 blur-lg" />
                    <Image src="/ghost-avatar.png" alt="Ghost avatar" width={54} height={54} className="relative h-auto w-9 scale-[1.35]" />
                    <span className="pointer-events-none absolute left-[28%] top-[31%] h-2 w-2.5 rounded-full bg-cyan-300 blur-[3px]" style={{ opacity: 0.45 + voiceLevel * 0.55 }} />
                    <span className="pointer-events-none absolute left-[56%] top-[31%] h-2 w-2.5 rounded-full bg-cyan-300 blur-[3px]" style={{ opacity: 0.45 + voiceLevel * 0.55 }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Talk to Ghost</p>
                    <p className="mt-1 text-sm text-slate-300">{status}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-300/50 hover:text-white"
                >
                  Close
                </button>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">{capabilityLabel}</p>
            </div>

            <div ref={messagesRef} className="relative flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-[0_10px_30px_rgba(2,6,23,0.22)] ${
                      message.role === "user"
                        ? "rounded-br-md bg-cyan-400 text-slate-950"
                        : message.meta?.nudge
                        ? "rounded-bl-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                        : "rounded-bl-md border border-white/10 bg-white/5 text-slate-200"
                    }`}
                  >
                    {message.meta?.mode === "blueprint" ? (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">Blueprint</p>
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-100">{message.text}</pre>
                      </div>
                    ) : message.meta?.mode === "swarm" ? (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">Swarm Analysis</p>
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-100">{message.text}</pre>
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                </motion.div>
              ))}
              {isReplying ? (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    Ghost is typing...
                  </div>
                </motion.div>
              ) : null}
            </div>

            <div className="relative border-t border-white/10 px-4 py-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  action === "Start a Project" ? (
                    <a
                      key={action}
                      href={BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => emitGhostPulseBurst({ source: "floating_quick_action" })}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
                    >
                      {action}
                    </a>
                  ) : (
                    <button
                      key={action}
                      type="button"
                      onClick={() => sendMessage(action)}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
                    >
                      {action}
                    </button>
                  )
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                    listening
                      ? "border-cyan-300/50 bg-cyan-300/20 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/30 hover:text-white"
                  }`}
                  aria-label={listening ? "Stop voice input" : "Start voice input"}
                >
                  {listening ? "■" : "Mic"}
                </button>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={1}
                  placeholder="Describe what you need built..."
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/35"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Send
                </button>
              </form>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>{pageContext.label} mode • {memoryGraph.asks || 0} asks</span>
                <Link href="/chatbot" className="text-cyan-300 transition hover:text-cyan-200">
                  Open full Ghostbot
                </Link>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
