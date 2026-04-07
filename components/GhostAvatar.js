"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { emitGhostPanelToggle, emitGhostPulseBurst, emitGhostVoiceState, onGhostPulseBurst, onGhostVoiceState } from "@/lib/ghostAvatarSignals";

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

export default function GhostAvatar() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [pulseBurst, setPulseBurst] = useState(false);
  const [voiceState, setVoiceState] = useState({ active: false, level: 0 });
  const [wakeState, setWakeState] = useState(true);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
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

    return () => {
      offPulse();
      offVoice();
    };
  }, []);

  useEffect(() => {
    const wakeTimer = window.setTimeout(() => {
      emitGhostPulseBurst({ source: "wake_intro" });
      emitGhostVoiceState({ active: true, level: 0.35, source: "wake_intro" });
      setWakeState(false);

      window.setTimeout(() => {
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
      window.clearTimeout(wakeTimer);
      window.clearTimeout(speechTimer);
    };
  }, []);

  const voiceScale = 1 + voiceState.level * 0.06;
  const coreSize = 80 + voiceState.level * 36;
  const eyeGlow = 0.35 + voiceState.level * 0.65;
  const mouthGlow = 0.15 + voiceState.level * 0.8;

  return (
    <div className="relative flex items-center justify-center py-4" aria-label="Ghost AI avatar">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        {particles.map((particle, index) => (
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
              opacity: [0.25, 0.9, 0.25],
              scale: [1, 1.35, 1],
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

      <motion.div
        className="pointer-events-none absolute rounded-full bg-cyan-500/20 blur-3xl animate-slowPulse"
        animate={{
          scale: pulseBurst ? [1, 1.28, 1.08] : 1 + voiceState.level * 0.1,
          opacity: pulseBurst ? [0.3, 0.9, 0.5] : voiceState.active ? 0.85 : 0.55,
        }}
        transition={{ duration: pulseBurst ? 0.65 : 0.25, ease: "easeOut" }}
        style={{ width: 420, height: 420 }}
      />

      <motion.div
        className="pointer-events-none absolute rounded-full border border-cyan-300/35"
        animate={{
          scale: pulseBurst ? [0.9, 1.45, 1.65] : 1,
          opacity: pulseBurst ? [0, 0.7, 0] : 0,
        }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        style={{ width: 280, height: 280 }}
      />

      <motion.button
        type="button"
        aria-label="Talk to Ghost"
        style={{ rotateX, rotateY }}
        animate={{
          y: [0, -12, 0],
          scale: [voiceScale, voiceScale + 0.02, voiceScale],
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          emitGhostPulseBurst({ source: "avatar_click" });
          emitGhostPanelToggle({ open: true, source: "avatar_click" });
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 cursor-pointer bg-transparent"
      >
        <Image
          src="/ghost-avatar.png"
          alt="Ghost AI Avatar"
          width={420}
          height={420}
          priority
          className="h-auto w-[240px] drop-shadow-[0_0_35px_rgba(0,240,255,0.6)] sm:w-[320px] lg:w-[380px]"
        />
        <div className="pointer-events-none absolute inset-0">
          <motion.span
            className="absolute left-[36%] top-[23%] h-4 w-7 rounded-full bg-cyan-300 blur-[6px] sm:h-5 sm:w-9"
            animate={{ opacity: eyeGlow, scale: [1, 1 + voiceState.level * 0.12, 1] }}
            transition={{ duration: 0.35, repeat: voiceState.active ? Infinity : 0, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute left-[57%] top-[23%] h-4 w-7 rounded-full bg-cyan-300 blur-[6px] sm:h-5 sm:w-9"
            animate={{ opacity: eyeGlow, scale: [1, 1 + voiceState.level * 0.12, 1] }}
            transition={{ duration: 0.35, repeat: voiceState.active ? Infinity : 0, ease: "easeInOut", delay: 0.04 }}
          />
          <motion.span
            className="absolute left-1/2 top-[35%] h-[3px] w-10 -translate-x-1/2 rounded-full bg-cyan-300 blur-[3px] sm:w-12"
            animate={{
              opacity: mouthGlow,
              scaleX: [1, 1 + voiceState.level * 0.45, 1],
              scaleY: [1, 1 + voiceState.level * 0.65, 1],
            }}
            transition={{ duration: 0.24, repeat: voiceState.active ? Infinity : 0, ease: "easeInOut" }}
          />
        </div>
      </motion.button>

      {wakeState ? (
        <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 -translate-x-1/2 rounded-full border border-cyan-300/25 bg-slate-950/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200 backdrop-blur sm:text-xs">
          Initializing Ghost Presence
        </div>
      ) : null}

      <motion.div
        className="pointer-events-none absolute rounded-full bg-cyan-400/30 blur-2xl"
        animate={{
          scale: pulseBurst ? [1, 1.55, 1.1] : [1, 1.2 + voiceState.level * 0.15, 1],
          opacity: pulseBurst ? [0.35, 0.9, 0.45] : voiceState.active ? [0.45, 0.85, 0.45] : [0.3, 0.55, 0.3],
        }}
        transition={{
          duration: pulseBurst ? 0.65 : 1.6,
          repeat: pulseBurst ? 0 : Infinity,
          ease: "easeInOut",
        }}
        style={{ width: coreSize, height: coreSize }}
      />
    </div>
  );
}
