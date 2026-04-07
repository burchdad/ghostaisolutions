"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BOOKING_URL } from "@/lib/constants";
import { emitGhostVoiceState, onGhostPanelToggle } from "@/lib/ghostAvatarSignals";

function getSpeechRecognition() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function TalkToGhostPanel() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Ghost is online.");
  const [micSupported, setMicSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldRestartRecognitionRef = useRef(false);

  useEffect(() => {
    setMicSupported(typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia));
    setRecognitionSupported(Boolean(getSpeechRecognition()));

    const offPanel = onGhostPanelToggle((detail) => {
      if (typeof detail.open === "boolean") {
        setOpen(detail.open);
      } else {
        setOpen(true);
      }
    });

    return () => offPanel();
  }, []);

  useEffect(() => {
    if (!open && listening) {
      stopListening();
    }
  }, [open, listening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const capabilityLabel = useMemo(() => {
    if (micSupported && recognitionSupported) {
      return "Voice reactive + transcript ready";
    }
    if (micSupported) {
      return "Voice reactive ready";
    }
    return "Text + booking fallback active";
  }, [micSupported, recognitionSupported]);

  const stopListening = () => {
    shouldRestartRecognitionRef.current = false;
    setListening(false);
    emitGhostVoiceState({ active: false, level: 0, source: "microphone" });

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
    setStatus("Ghost is standing by.");
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

      setTranscript(combined);
      if (combined) {
        setStatus("Ghost is listening.");
      }
    };

    recognition.onerror = () => {
      setStatus("Voice transcript unavailable. Mic reactive mode still active.");
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
        emitGhostVoiceState({ active: true, level: normalized, source: "microphone" });
        rafRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
      startRecognition();
    } catch {
      setStatus("Microphone permission was denied or unavailable.");
      stopListening();
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
        <span className="inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.75)]" />
        {capabilityLabel}
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="mt-4 rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-5 text-left shadow-[0_20px_80px_rgba(8,145,178,0.18)] backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Talk to Ghost</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Wake the system and describe what you need built.</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300 transition hover:border-cyan-300/50 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">{status}</p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Live transcript</p>
              <p className="mt-3 min-h-[72px] text-sm text-slate-200">
                {transcript || "Voice transcript will appear here when microphone access is enabled."}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {listening ? "Stop Voice Input" : "Start Voice Input"}
              </button>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-white/5"
              >
                Start a Project
              </a>
              <Link
                href="/chatbot"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-white/5"
              >
                Open Full Ghostbot
              </Link>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              {!micSupported ? "Microphone input is not supported in this browser." : null}
              {micSupported && !recognitionSupported ? " Voice transcript is limited, but amplitude-driven avatar response is active." : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
