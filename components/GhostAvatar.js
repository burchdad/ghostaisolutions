"use client";

import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  emitGhostPanelToggle,
  emitGhostPulseBurst,
  emitGhostState,
  emitGhostVoiceState,
  onGhostPulseBurst,
  onGhostState,
  onGhostVoiceState,
} from "@/lib/ghostAvatarSignals";

const particles = [
  { size: 8, left: "18%", top: "16%", duration: 6.2, delay: 0.3 },
  { size: 6, left: "72%", top: "12%", duration: 5.4, delay: 1.1 },
  { size: 10, left: "26%", top: "74%", duration: 7.1, delay: 0.8 },
  { size: 7, left: "82%", top: "66%", duration: 5.8, delay: 1.7 },
  { size: 5, left: "48%", top: "10%", duration: 6.8, delay: 0.5 },
  { size: 9, left: "12%", top: "52%", duration: 6.1, delay: 1.4 },
  { size: 7, left: "88%", top: "44%", duration: 5.9, delay: 0.9 },
  { size: 6, left: "60%", top: "82%", duration: 6.5, delay: 1.9 },
  { size: 4, left: "40%", top: "68%", duration: 5.1, delay: 0.2 },
  { size: 8, left: "66%", top: "28%", duration: 6.9, delay: 1.6 },
];

const modePreset = {
  default: { wind: 0.38, flutter: 0.32, sheen: 0.35, hue: "cyan", mouse: 9, windPushX: 7, windPushY: 8, voicePush: 4.5, tugPushX: 0.3, tugPushY: 0.24, flutterFreq: 2.8, settle: 0.92 },
  calm: { wind: 0.25, flutter: 0.2, sheen: 0.22, hue: "teal", mouse: 7.2, windPushX: 5.2, windPushY: 6.4, voicePush: 3.2, tugPushX: 0.22, tugPushY: 0.2, flutterFreq: 2.1, settle: 0.9 },
  battle: { wind: 0.64, flutter: 0.58, sheen: 0.74, hue: "amber", mouse: 9.8, windPushX: 8.3, windPushY: 9, voicePush: 5.2, tugPushX: 0.35, tugPushY: 0.29, flutterFreq: 3.1, settle: 0.93 },
  blueprint: { wind: 0.24, flutter: 0.22, sheen: 0.5, hue: "sky", mouse: 6.8, windPushX: 5, windPushY: 5.8, voicePush: 2.8, tugPushX: 0.2, tugPushY: 0.16, flutterFreq: 2.2, settle: 0.86 },
  swarm: { wind: 0.92, flutter: 0.86, sheen: 0.92, hue: "violet", mouse: 11.2, windPushX: 9.4, windPushY: 10.6, voicePush: 6.4, tugPushX: 0.42, tugPushY: 0.34, flutterFreq: 3.6, settle: 0.95 },
};

const intentIcon = {
  automation: "A",
  voice: "V",
  platform: "P",
  data: "D",
  blueprint: "B",
  swarm: "S",
};

function resolveCinematicPreset(pathname) {
  if (pathname.startsWith("/technology")) return "blueprint";
  if (pathname.startsWith("/projects") || pathname.startsWith("/work")) return "battle";
  if (pathname.startsWith("/services")) return "calm";
  return "default";
}

function resolveMaterialClass(mode, thinking) {
  if (thinking || mode === "swarm") {
    return "from-slate-700/70 via-cyan-300/20 to-violet-400/30";
  }

  if (mode === "blueprint") {
    return "from-slate-800/80 via-sky-300/15 to-cyan-300/20";
  }

  if (mode === "battle") {
    return "from-slate-800/85 via-amber-300/12 to-orange-300/22";
  }

  return "from-slate-800/80 via-cyan-300/10 to-slate-700/65";
}

export default function GhostAvatar() {
  const rootRef = useRef(null);
  const wakeTimerRef = useRef(null);
  const wakeVoiceStopRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [9, -9]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-9, 9]);

  const [pulseBurst, setPulseBurst] = useState(false);
  const [glitchBurst, setGlitchBurst] = useState(false);
  const [voiceState, setVoiceState] = useState({ active: false, level: 0 });
  const [wakeState, setWakeState] = useState(true);
  const [pagePreset, setPagePreset] = useState("default");
  const [avatarState, setAvatarState] = useState({
    mode: "default",
    thinking: false,
    pageContext: "",
    intents: [],
    memory: {},
    chunkTick: 0,
    gesture: "",
  });
  const [windField, setWindField] = useState({ x: 0, y: 0, t: 0 });
  const [tugLeft, setTugLeft] = useState({ x: 0, y: 0, active: false });
  const [tugRight, setTugRight] = useState({ x: 0, y: 0, active: false });

  const clothXRaw = useMotionValue(0);
  const clothYRaw = useMotionValue(0);
  const flutterRaw = useMotionValue(0);
  const clothX = useSpring(clothXRaw, { stiffness: 120, damping: 18, mass: 0.7 });
  const clothY = useSpring(clothYRaw, { stiffness: 120, damping: 18, mass: 0.7 });
  const flutter = useSpring(flutterRaw, { stiffness: 110, damping: 20, mass: 0.6 });

  const cinematicMode = avatarState.mode !== "default" ? avatarState.mode : pagePreset;
  const preset = modePreset[cinematicMode] || modePreset.default;
  const voiceScale = 1 + voiceState.level * 0.07;
  const eyeGlow = 0.36 + voiceState.level * 0.64;
  const mouthGlow = 0.16 + voiceState.level * 0.82;
  const coreSize = 88 + voiceState.level * 44;
  const dominantIntent = avatarState.intents?.[avatarState.intents.length - 1] || "platform";
  const memoryTattoo = (avatarState.memory?.intents || []).slice(-4);
  const seamPulse = avatarState.thinking ? 1 : 0.25;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const pathname = window.location.pathname || "/";
    setPagePreset(resolveCinematicPreset(pathname));

    const handleMouseMove = (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const offPulse = onGhostPulseBurst(() => {
      setPulseBurst(true);
      window.setTimeout(() => setPulseBurst(false), 650);
    });

    const offVoice = onGhostVoiceState((detail) => {
      setVoiceState({
        active: Boolean(detail.active),
        level: Math.max(0, Math.min(1, Number(detail.level) || 0)),
      });
    });

    const offState = onGhostState((detail) => {
      setAvatarState((current) => ({
        ...current,
        ...detail,
        intents: Array.isArray(detail.intents) ? detail.intents : current.intents,
        memory: detail.memory && typeof detail.memory === "object" ? detail.memory : current.memory,
      }));

      if (detail.chunkTick) {
        setGlitchBurst(true);
        window.setTimeout(() => setGlitchBurst(false), 180);
      }
    });

    return () => {
      offPulse();
      offVoice();
      offState();
    };
  }, []);

  useEffect(() => {
    wakeTimerRef.current = window.setTimeout(() => {
      emitGhostPulseBurst({ source: "wake_intro" });
      emitGhostVoiceState({ active: true, level: 0.35, source: "wake_intro" });
      setWakeState(false);

      wakeVoiceStopRef.current = window.setTimeout(() => {
        emitGhostVoiceState({ active: false, level: 0, source: "wake_intro" });
      }, 1800);
    }, 700);

    const speechTimer = window.setTimeout(() => {
      try {
        if (!window.speechSynthesis) {
          return;
        }

        const seen = sessionStorage.getItem("ghost_intro_played");
        if (seen) {
          return;
        }

        const utterance = new SpeechSynthesisUtterance("Ghost online. Tell me what you need built.");
        utterance.rate = 1;
        utterance.pitch = 0.8;
        utterance.volume = 0.4;
        window.speechSynthesis.speak(utterance);
        sessionStorage.setItem("ghost_intro_played", "1");
      } catch {}
    }, 1200);

    return () => {
      if (wakeTimerRef.current) window.clearTimeout(wakeTimerRef.current);
      if (wakeVoiceStopRef.current) window.clearTimeout(wakeVoiceStopRef.current);
      window.clearTimeout(speechTimer);
    };
  }, []);

  useAnimationFrame((time) => {
    const t = time / 1000;
    const microDrift = cinematicMode === "blueprint" ? 0.06 : 0.14;
    const windX = Math.sin(t * 0.6) * preset.wind + Math.sin(t * 1.9) * microDrift;
    const windY = Math.cos(t * 0.45) * (cinematicMode === "blueprint" ? 0.18 : 0.25);
    setWindField({ x: windX, y: windY, t });

    const tugInfluenceX = tugLeft.x * preset.tugPushX + tugRight.x * preset.tugPushX;
    const tugInfluenceY = tugLeft.y * preset.tugPushY + tugRight.y * preset.tugPushY;
    clothXRaw.set((mouseX.get() * preset.mouse) + windX * preset.windPushX + tugInfluenceX);
    clothYRaw.set((mouseY.get() * (preset.mouse * 0.55)) + windY * preset.windPushY + tugInfluenceY + voiceState.level * preset.voicePush);
    flutterRaw.set((Math.sin(t * preset.flutterFreq) * 0.8 + voiceState.level * 2.6) * preset.flutter);

    if (!tugLeft.active) {
      setTugLeft((current) => ({ ...current, x: current.x * preset.settle, y: current.y * preset.settle }));
    }

    if (!tugRight.active) {
      setTugRight((current) => ({ ...current, x: current.x * preset.settle, y: current.y * preset.settle }));
    }
  });

  const baseArrival = useMemo(() => {
    if (pagePreset === "blueprint") {
      return { y: [32, -6, 0], x: [-24, 6, 0], rotate: [-6, 2, 0] };
    }
    if (pagePreset === "battle") {
      return { y: [48, -10, 0], x: [20, -4, 0], rotate: [7, -2, 0] };
    }
    if (pagePreset === "calm") {
      return { y: [26, 0], x: [0, 0], rotate: [0, 0] };
    }
    return { y: [36, -4, 0], x: [-10, 2, 0], rotate: [-4, 1, 0] };
  }, [pagePreset]);

  return (
    <div ref={rootRef} className="relative flex items-center justify-center py-4" aria-label="Ghost AI avatar">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        {particles.map((particle) => (
          <motion.span
            key={`${particle.left}-${particle.top}`}
            className="absolute rounded-full bg-cyan-300/55"
            style={{
              width: particle.size,
              height: particle.size,
              left: particle.left,
              top: particle.top,
              boxShadow: "0 0 14px rgba(34, 211, 238, 0.45)",
            }}
            animate={{
              y: [0, -14, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {avatarState.mode === "swarm" ? (
        <div className="pointer-events-none absolute inset-0">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={`swarm-${index}`}
              className="absolute left-1/2 top-1/2"
              initial={{ opacity: 0 }}
              animate={{
                x: [-166 + index * 30, -126 + index * 30],
                y: [-186 + index * 20, -178 + index * 20],
                opacity: [0.2, 0.46, 0.2],
                scale: [0.9, 0.98, 0.9],
              }}
              transition={{ duration: 1.65 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/ghost-avatar.png"
                alt="Ghost swarm echo"
                width={220}
                height={220}
                className="h-auto w-[160px] opacity-55 blur-[1px]"
              />
            </motion.div>
          ))}
        </div>
      ) : null}

      <motion.div
        className="pointer-events-none absolute rounded-full bg-cyan-500/20 blur-3xl animate-slowPulse"
        animate={{
          scale: pulseBurst ? [1, 1.3, 1.08] : 1 + voiceState.level * 0.14,
          opacity: pulseBurst ? [0.3, 0.95, 0.5] : avatarState.thinking ? 0.88 : 0.56,
        }}
        transition={{ duration: pulseBurst ? 0.65 : 0.25, ease: "easeOut" }}
        style={{ width: 460, height: 460 }}
      />

      <motion.div
        className="pointer-events-none absolute rounded-full border border-cyan-300/35"
        animate={{
          scale: pulseBurst ? [0.9, 1.48, 1.7] : 1,
          opacity: pulseBurst ? [0, 0.7, 0] : 0,
        }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        style={{ width: 290, height: 290 }}
      />

      <motion.div
        style={{ rotateX, rotateY }}
        animate={{
          ...baseArrival,
          scale: [voiceScale, voiceScale + 0.015, voiceScale],
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 0.9, ease: "easeOut" },
          rotate: { duration: 0.9, ease: "easeOut" },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative z-10"
      >
        <motion.button
          type="button"
          aria-label="Talk to Ghost"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            emitGhostPulseBurst({ source: "avatar_click" });
            emitGhostPanelToggle({ open: true, source: "avatar_click" });
          }}
          className="relative cursor-pointer bg-transparent"
        >
          <Image
            src="/ghost-avatar.png"
            alt="Ghost AI Avatar"
            width={420}
            height={420}
            priority
            className="h-auto w-[240px] drop-shadow-[0_0_35px_rgba(0,240,255,0.6)] sm:w-[320px] lg:w-[380px]"
          />

          <motion.div
            className={`pointer-events-none absolute left-1/2 top-[50%] h-[46%] w-[54%] -translate-x-1/2 rounded-[42%] bg-gradient-to-b ${resolveMaterialClass(cinematicMode, avatarState.thinking)} opacity-85 blur-[1px]`}
            style={{
              x: clothX,
              y: clothY,
              rotate: useTransform(clothX, [-12, 12], [-4, 4]),
              scaleX: useTransform(flutter, [-2, 2], [0.98, 1.04]),
              scaleY: useTransform(flutter, [-2, 2], [1.01, 1.08]),
            }}
          />

          <motion.div
            className="pointer-events-none absolute left-1/2 top-[54%] h-[20%] w-[62%] -translate-x-1/2 rounded-[44%] bg-gradient-to-b from-cyan-300/18 via-transparent to-cyan-100/8"
            style={{
              x: useTransform(clothX, (value) => value * 0.55),
              y: useTransform(clothY, (value) => value * 0.35),
              scaleX: useTransform(flutter, [-2.4, 2.4], [0.94, 1.11]),
              scaleY: useTransform(flutter, [-2.4, 2.4], [1, 1.16]),
              opacity: 0.35 + voiceState.level * 0.45,
            }}
          />

          <motion.div
            className="pointer-events-none absolute left-[22%] top-[47%] h-[26%] w-[14%] rounded-[45%] bg-gradient-to-b from-cyan-200/16 to-slate-900/45"
            style={{
              x: useTransform(clothX, (value) => value * 1.05 + tugLeft.x * 0.6),
              y: useTransform(clothY, (value) => value * 0.85 + tugLeft.y * 0.8),
              rotate: useTransform(clothX, [-15, 15], [6, -8]),
              scaleY: useTransform(flutter, [-2, 2], [0.96, 1.12]),
            }}
          />

          <motion.div
            className="pointer-events-none absolute right-[22%] top-[47%] h-[26%] w-[14%] rounded-[45%] bg-gradient-to-b from-cyan-200/16 to-slate-900/45"
            style={{
              x: useTransform(clothX, (value) => value * 1.05 + tugRight.x * 0.6),
              y: useTransform(clothY, (value) => value * 0.85 + tugRight.y * 0.8),
              rotate: useTransform(clothX, [-15, 15], [-6, 8]),
              scaleY: useTransform(flutter, [-2, 2], [0.96, 1.12]),
            }}
          />

          <motion.div
            className="pointer-events-none absolute left-1/2 top-[49%] h-[28%] w-[8px] -translate-x-1/2 rounded-full bg-cyan-300/70 blur-[1px]"
            animate={{ opacity: [0.2, 0.3 + seamPulse * 0.65, 0.2], scaleY: [0.94, 1.08, 0.94] }}
            transition={{ duration: avatarState.thinking ? 0.7 : 2.1, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="pointer-events-none absolute left-[43%] top-[56%] h-[2px] w-[18%] origin-left rounded-full bg-cyan-300/60 blur-[0.8px]"
            animate={{ opacity: [0.22, 0.32 + seamPulse * 0.58, 0.22], scaleX: [1, 1.08, 1] }}
            transition={{ duration: avatarState.thinking ? 0.65 : 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="pointer-events-none absolute left-[39%] top-[52%] h-7 w-7 rounded-full border border-cyan-200/45 bg-slate-900/65 text-[10px] font-semibold text-cyan-200"
            animate={{
              rotate: avatarState.thinking ? [0, 16, -14, 0] : [0, 8, 0],
              scale: avatarState.thinking ? [1, 1.14, 1] : 1,
              boxShadow: avatarState.thinking ? "0 0 22px rgba(34,211,238,.45)" : "0 0 8px rgba(34,211,238,.24)",
            }}
            transition={{ duration: avatarState.thinking ? 0.65 : 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="absolute inset-0 flex items-center justify-center">{intentIcon[dominantIntent] || "G"}</span>
          </motion.div>

          {memoryTattoo.length ? (
            <div className="pointer-events-none absolute left-[25%] top-[58%] flex gap-1">
              {memoryTattoo.map((intent) => (
                <motion.span
                  key={`tattoo-${intent}`}
                  className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-cyan-200"
                  animate={{ opacity: [0.4, 0.88, 0.4] }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
                >
                  {intent.slice(0, 1)}
                </motion.span>
              ))}
            </div>
          ) : null}

          {avatarState.thinking || cinematicMode === "blueprint" ? (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-[54%] h-[18%] w-[38%] -translate-x-1/2 rounded-xl border border-cyan-300/30 bg-slate-950/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: cinematicMode === "blueprint" ? [0.2, 0.34, 0.24] : [0.16, 0.5, 0.2] }}
              transition={{ duration: cinematicMode === "blueprint" ? 2.2 : 1.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 120 56" className="h-full w-full">
                <polyline points="8,40 28,24 44,30 67,13 84,24 112,10" fill="none" stroke="rgba(34,211,238,.8)" strokeWidth="1.5" />
                <line x1="10" y1="10" x2="110" y2="10" stroke="rgba(148,163,184,.45)" strokeDasharray="3 3" />
                <line x1="10" y1="45" x2="110" y2="45" stroke="rgba(148,163,184,.35)" strokeDasharray="2 3" />
                <circle cx="84" cy="24" r="3.5" fill="rgba(56,189,248,.8)" />
              </svg>
            </motion.div>
          ) : null}

          <motion.div
            className="pointer-events-none absolute inset-[14%] rounded-[42%] border border-cyan-300/20"
            animate={{
              opacity: [0.08, 0.32 + preset.sheen * 0.3, 0.08],
              x: [-14, 14, -14],
              filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
            }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />

          {glitchBurst ? (
            <motion.div
              className="ghost-temporal-slice pointer-events-none absolute inset-0"
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [0.08, 0.28, 0.06] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          ) : null}

          <div className="pointer-events-none absolute inset-0">
            <motion.span
              className="absolute left-[36%] top-[23%] h-4 w-7 rounded-full bg-cyan-300 blur-[6px] sm:h-5 sm:w-9"
              animate={{ opacity: eyeGlow, scale: [1, 1 + voiceState.level * 0.16, 1] }}
              transition={{ duration: 0.35, repeat: voiceState.active ? Infinity : 0, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute left-[57%] top-[23%] h-4 w-7 rounded-full bg-cyan-300 blur-[6px] sm:h-5 sm:w-9"
              animate={{ opacity: eyeGlow, scale: [1, 1 + voiceState.level * 0.16, 1] }}
              transition={{ duration: 0.35, repeat: voiceState.active ? Infinity : 0, ease: "easeInOut", delay: 0.04 }}
            />
            <motion.span
              className="absolute left-1/2 top-[35%] h-[3px] w-10 -translate-x-1/2 rounded-full bg-cyan-300 blur-[3px] sm:w-12"
              animate={{
                opacity: mouthGlow,
                scaleX: [1, 1 + voiceState.level * 0.52, 1],
                scaleY: [1, 1 + voiceState.level * 0.72, 1],
              }}
              transition={{ duration: 0.24, repeat: voiceState.active ? Infinity : 0, ease: "easeInOut" }}
            />
          </div>
        </motion.button>

        <motion.button
          type="button"
          aria-label="Left cloth tug"
          className="absolute left-[22%] top-[60%] z-20 h-7 w-7 rounded-full border border-cyan-300/40 bg-cyan-300/10 text-[10px] text-cyan-100"
          whileTap={{ scale: 0.9 }}
          onMouseDown={() => setTugLeft({ x: -22, y: 16, active: true })}
          onMouseUp={() => setTugLeft((current) => ({ ...current, active: false }))}
          onMouseLeave={() => setTugLeft((current) => ({ ...current, active: false }))}
          onTouchStart={() => setTugLeft({ x: -20, y: 12, active: true })}
          onTouchEnd={() => setTugLeft((current) => ({ ...current, active: false }))}
        >
          L
        </motion.button>

        <motion.button
          type="button"
          aria-label="Right cloth tug"
          className="absolute right-[22%] top-[60%] z-20 h-7 w-7 rounded-full border border-cyan-300/40 bg-cyan-300/10 text-[10px] text-cyan-100"
          whileTap={{ scale: 0.9 }}
          onMouseDown={() => setTugRight({ x: 22, y: 16, active: true })}
          onMouseUp={() => setTugRight((current) => ({ ...current, active: false }))}
          onMouseLeave={() => setTugRight((current) => ({ ...current, active: false }))}
          onTouchStart={() => setTugRight({ x: 20, y: 12, active: true })}
          onTouchEnd={() => setTugRight((current) => ({ ...current, active: false }))}
        >
          R
        </motion.button>

        <div className="absolute -bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          <button
            type="button"
            onClick={() => emitGhostState({ mode: "blueprint", gesture: "gesture-blueprint", source: "avatar-gesture" })}
            className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-200"
          >
            Blueprint
          </button>
          <button
            type="button"
            onClick={() => emitGhostState({ mode: "swarm", gesture: "gesture-swarm", source: "avatar-gesture" })}
            className="rounded-full border border-violet-300/35 bg-violet-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-200"
          >
            Swarm
          </button>
          <button
            type="button"
            onClick={() => emitGhostPanelToggle({ open: true, source: "avatar-gesture-open" })}
            className="rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-200"
          >
            Talk
          </button>
        </div>
      </motion.div>

      {wakeState ? (
        <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 -translate-x-1/2 rounded-full border border-cyan-300/25 bg-slate-950/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200 backdrop-blur sm:text-xs">
          Initializing Ghost Presence
        </div>
      ) : null}

      <motion.div
        className="pointer-events-none absolute rounded-full bg-cyan-400/30 blur-2xl"
        animate={{
          scale: pulseBurst ? [1, 1.55, 1.1] : [1, 1.22 + voiceState.level * 0.2, 1],
          opacity: pulseBurst ? [0.35, 0.9, 0.45] : avatarState.thinking ? [0.45, 0.9, 0.5] : [0.3, 0.55, 0.3],
        }}
        transition={{
          duration: pulseBurst ? 0.65 : 1.6,
          repeat: pulseBurst ? 0 : Infinity,
          ease: "easeInOut",
        }}
        style={{ width: coreSize, height: coreSize }}
      />

      <div className="pointer-events-none absolute right-0 top-2 rounded-full border border-white/10 bg-slate-900/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
        {cinematicMode} • wind {windField.x.toFixed(2)}
      </div>
    </div>
  );
}
