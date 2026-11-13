import type { Metadata } from "next";
import LandingPage from "@/components/landing-page";
import "./landing.css";

export const metadata: Metadata = {
  title: "NexLearn — Learn. Build. Earn.",
  description: "Free vibe coding classes, digital marketing literacy, and curated pathways to real income on NexLearn.",
};

export default function Page() {
  return <LandingPage />;
}
