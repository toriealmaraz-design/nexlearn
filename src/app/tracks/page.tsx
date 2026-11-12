import { Suspense } from "react";
import Link from "next/link";
import TrackCard from "@/components/track-card";
import { getPublishedCurriculum } from "@/lib/learning";

async function TracksContent() {
  const curriculum = await getPublishedCurriculum();
  const publishedTracks = curriculum?.filter((item) => item.lessons.length > 0) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Link href="/" className="text-sm text-[var(--muted-2)] underline decoration-[var(--line-strong)] underline-offset-4 transition hover:text-[var(--accent)]">
        ← NexLearn home
      </Link>
      <div className="mt-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--accent)]">Open curriculum</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Learning tracks</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Practical modules, grouped by phase. Start with the lesson that fits your next step—no account required.
        </p>
      </div>

      {curriculum === null ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-12 text-center">
          <p className="font-medium text-[var(--foreground)]">The curriculum is temporarily unavailable.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Please try again in a moment.</p>
        </div>
      ) : publishedTracks.length > 0 ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {publishedTracks.map((item) => <TrackCard key={item.track.id} item={item} />)}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-12 text-center">
          <p className="font-medium text-[var(--foreground)]">No public modules are published yet.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">New lessons will appear here as soon as they are published.</p>
        </div>
      )}
    </div>
  );
}

export default function TracksPage() {
  return <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-sm text-[var(--muted)]">Loading tracks…</div>}><TracksContent /></Suspense>;
}
