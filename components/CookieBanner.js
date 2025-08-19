"use client";
import { useEffect, useState } from "react";

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

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-lg w-full bg-slate-900 text-white p-4 rounded-xl shadow-lg z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm">
        We use minimal analytics to improve site performance. No personal data is stored.
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
// This component displays a cookie consent banner that appears at the bottom of the screen.
// It checks local storage for consent and shows the banner if not accepted.
// The user can accept cookies, which stores their consent in local storage and hides the banner.
// The banner is styled with Tailwind CSS classes for a modern look.
// The component is designed to be responsive, adapting to different screen sizes.
// It uses React hooks for state management and side effects.
// The banner is fixed at the bottom of the viewport, ensuring visibility without obstructing content.
// The component is client-side only, as indicated by "use client" at the top.
// The banner includes a brief message about cookie usage and a button to accept cookies.
// The component is reusable and can be imported into any page or layout in a Next.js application