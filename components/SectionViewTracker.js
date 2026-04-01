"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export default function SectionViewTracker() {
  useEffect(() => {
    const seen = new Set();
    const sections = document.querySelectorAll("[data-track-section]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const name = entry.target.getAttribute("data-track-section");
          if (!name || seen.has(name)) return;
          seen.add(name);
          track("section_view", { section: name });
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return null;
}
