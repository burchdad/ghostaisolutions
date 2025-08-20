"use client";
import { useRef, useState } from "react";

export default function DemoPlayer() {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleUnmute = async () => {
    try {
      if (!videoRef.current) return;
      videoRef.current.muted = false;
      setIsMuted(false);
      // Ensure playback continues with sound (iOS requires calling play() after a gesture)
      await videoRef.current.play();
    } catch {
      // If it fails (e.g., codec issue), keep muted to avoid a dead button
      setIsMuted(true);
    }
  };

  if (failed) {
    return (
      <div className="mt-8 relative aspect-video rounded-2xl overflow-hidden border bg-black">
        <img
          src="/demo-placeholder.png"
          alt="Demo placeholder"
          className="w-full h-full object-cover opacity-90"
          loading="eager"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/20 backdrop-blur">
            <svg viewBox="0 0 24 24" className="h-12 w-12 text-white" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 relative aspect-video rounded-2xl overflow-hidden border bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        loop
        playsInline
        controls
        preload="metadata"
        poster="/demo-placeholder.png"
        onError={() => setFailed(true)}
      >
        <source src="/demo.mp4" type="video/mp4" />
        Sorry, your browser doesn’t support embedded videos.
      </video>

      {isMuted && (
        <button
          type="button"
          onClick={handleUnmute}
          className="absolute bottom-4 right-4 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur hover:bg-white/30"
        >
          🔊 Tap to unmute
        </button>
      )}
    </div>
  );
}
