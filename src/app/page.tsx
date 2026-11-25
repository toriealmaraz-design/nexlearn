import type { Metadata } from "next";
import LazyDeveloperLanding from "@/components/lazy-developer-landing";
import "./lazy-developer.css";

export const metadata: Metadata = {
  title: "The Lazy Developer - Learn to Build Apps with AI - 100% Free",
  description:
    "Free, complete training on building and shipping secure apps with Cursor, Claude Code, Codex and more. No coding degree needed, ever.",
};

export default function Page() {
  return <LazyDeveloperLanding />;
}
