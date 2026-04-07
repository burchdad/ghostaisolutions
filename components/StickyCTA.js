"use client";
import TrackCTA from "@/components/TrackCTA";
import { useEffect, useState } from "react";
import { BOOKING_URL } from "@/lib/constants";

export default function StickyCTA(){
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll(); window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`fixed inset-x-0 bottom-4 z-40 px-4 sm:hidden transition-opacity ${show ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="mx-auto max-w-md rounded-xl border bg-white dark:bg-slate-900 shadow-lg p-2">
        <TrackCTA
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white"
          event="start_project_sticky_mobile"
          section="sticky_cta"
          placement="mobile_floating"
          label="Start a Project"
        >
          Start a Project
        </TrackCTA>
      </div>
    </div>
  );
}
