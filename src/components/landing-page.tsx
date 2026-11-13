"use client";

import { useEffect } from "react";
import { landingMarkup } from "@/components/landing-markup";

export default function LandingPage() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.querySelector("script[data-planet]")) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/landing/planet.js";
    script.dataset.planet = "true";
    document.body.appendChild(script);
  }, []);

  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: landingMarkup }} />;
}
