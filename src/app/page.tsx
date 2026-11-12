import { Suspense } from "react";
import HomePage from "@/components/home-page";
import { getPublishedCurriculum } from "@/lib/learning";

async function HomeContent() {
  const curriculum = await getPublishedCurriculum();
  return <HomePage curriculum={curriculum} />;
}

export default function Page() {
  return <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-sm text-[var(--muted)]">Loading NexLearn…</div>}><HomeContent /></Suspense>;
}
