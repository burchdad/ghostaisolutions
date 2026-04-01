"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export default function ScrollDepthTracker() {
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const hit = new Set();

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 100;

      milestones.forEach((m) => {
        if (progress >= m && !hit.has(m)) {
          hit.add(m);
          track("scroll_depth", { percent: m });
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
