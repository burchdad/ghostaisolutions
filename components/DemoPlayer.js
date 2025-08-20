// app/components/DemoPlayer.js
"use client";
import { useState } from "react";

export default function DemoPlayer() {
  const [failed, setFailed] = useState(false);

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
    <div className="mt-8 aspect-video rounded-2xl overflow-hidden border bg-black">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        controls
        preload="metadata"
        poster="/demo-placeholder.png"
        onError={() => setFailed(true)}
      >
        <source src="/demo.mp4" type="video/mp4" />
        {/* If the browser can’t play MP4, show fallback */}
        Sorry, your browser doesn’t support embedded videos.
      </video>
    </div>
  );
}
