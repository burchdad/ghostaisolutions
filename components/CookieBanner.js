"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  // allow dismiss via ESC
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => e.key === "Escape" && setVisible(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and analytics notice"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-lg w-[92%] sm:w-full bg-slate-900 text-white p-4 rounded-xl shadow-lg z-50 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <p className="text-sm">
        We use minimal analytics to improve site performance. No personal data is stored.{" "}
        <Link
          href="/privacy#analytics"
          className="underline text-brand-300 hover:text-brand-200"
        >
          Learn more
        </Link>
        .
      </p>
      <button
        onClick={accept}
        className="bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg text-sm font-semibold"
      >
        Got it
      </button>
    </div>
  );
}
