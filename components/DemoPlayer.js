"use client";
import { useEffect, useState } from "react";

export default function DemoPlayer() {
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    // Try a lightweight HEAD request to see if /demo.mp4 exists
    fetch("D:\Stephen's Stuff\Ghost Ai Solutions\Business Videos\demo.mp4", { method: "HEAD" })
      .then((res) => setHasVideo(res.ok))
      .catch(() => setHasVideo(false));
  }, []);

  if (hasVideo) {
    return (
      <div className="mt-8 aspect-video rounded-2xl overflow-hidden border bg-black">
        <video
          src="/demo.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Placeholder image with play overlay (replace image when you have your own)
  return (
    <div className="mt-8 relative aspect-video rounded-2xl overflow-hidden border bg-black">
      <img
        src="D:\Stephen's Stuff\Ghost Ai Solutions\Business Photos\logo.png"
        alt="Demo placeholder"
        className="w-full h-full object-cover opacity-90"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/20 backdrop-blur">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-white" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
