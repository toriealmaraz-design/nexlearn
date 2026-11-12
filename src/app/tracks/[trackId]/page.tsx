import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { connection } from "next/server";
import { CURRICULUM_PHASES, getCurriculumPhase } from "@/lib/curriculum-phases";
import { db } from "@/lib/db";
import { chapters, lessons, tracks } from "@/lib/schema";
import type { Lesson, Track } from "@/lib/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TrackPageProps = {
  params: Promise<{ trackId: string }>;
};

async function TrackDetailContent({ params }: TrackPageProps) {
  await connection();
  const { trackId } = await params;
  if (!UUID_PATTERN.test(trackId)) notFound();

  let track: Track | undefined;
  let publishedLessons: Lesson[] = [];
  let chapterRows: Array<{ lessonId: string }> = [];

  try {
    [track] = await db.select().from(tracks).where(eq(tracks.id, trackId)).limit(1);
    if (track) {
      publishedLessons = await db
        .select()
        .from(lessons)
        .where(and(eq(lessons.trackId, trackId), eq(lessons.isPublished, true)))
        .orderBy(asc(lessons.orderIndex));

      if (publishedLessons.length > 0) {
        chapterRows = await db
          .select({ lessonId: chapters.lessonId })
          .from(chapters)
          .where(inArray(chapters.lessonId, publishedLessons.map((lesson) => lesson.id)));
      }
    }
  } catch {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="font-medium text-[var(--foreground)]">The curriculum is temporarily unavailable.</p>
        <Link href="/tracks" className="mt-3 inline-block text-sm text-[var(--accent)] underline underline-offset-4">Try again</Link>
      </div>
    );
  }

  if (!track) notFound();
  const sectionCounts = chapterRows.reduce((counts, row) => {
    counts.set(row.lessonId, (counts.get(row.lessonId) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
  const phaseGroups = CURRICULUM_PHASES
    .map((phase, phaseOrder) => ({
      phase,
      phaseOrder: phaseOrder + 1,
      lessons: publishedLessons.filter((lesson) => lesson.phase === phase.id),
    }))
    .filter((group) => group.lessons.length > 0);
  const moduleCount = publishedLessons.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Link href="/tracks" className="text-sm text-[var(--muted-2)] underline decoration-[var(--line-strong)] underline-offset-4 transition hover:text-[var(--accent)]">
        ← All tracks
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--accent)]">
          {track.trackType === "internal" ? "Technical & AI" : "Marketing & growth"} · {moduleCount} {moduleCount === 1 ? "module" : "modules"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{track.title}</h1>
        {track.description && <p className="mt-4 text-base leading-7 text-[var(--muted)]">{track.description}</p>}
        <p className="mt-4 text-sm text-[var(--muted-2)]">Read any published module without signing in. Sign in only if you want progress saved.</p>
      </header>

      {phaseGroups.length > 0 ? (
        <div className="mt-12 flex flex-col gap-10">
          {phaseGroups.map(({ phase, phaseOrder, lessons: phaseLessons }) => (
            <section key={phase.id} aria-labelledby={`phase-${phase.id}`}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[.14em] text-[var(--muted-2)]">Phase {String(phaseOrder).padStart(2, "0")}</p>
                  <h2 id={`phase-${phase.id}`} className="mt-1 text-xl font-semibold text-[var(--foreground)]">{phase.label}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{phase.description}</p>
                </div>
                <span className="text-xs text-[var(--muted-2)]">{phaseLessons.length} {phaseLessons.length === 1 ? "module" : "modules"}</span>
              </div>
              <ol className="flex flex-col gap-3">
                {phaseLessons.map((lesson, lessonIndex) => {
                  const sectionCount = sectionCounts.get(lesson.id) ?? 0;
                  const phaseDetails = getCurriculumPhase(lesson.phase);
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/tracks/${trackId}/lessons/${lesson.id}`}
                        className="group flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--glass)] p-4 transition hover:border-[rgba(93,240,168,.35)] hover:bg-[var(--glass-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:p-5"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] text-sm font-medium tabular-nums text-[var(--muted)]">
                          {String(lessonIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-[var(--foreground)] transition group-hover:text-[var(--accent)]">{lesson.title}</span>
                          {lesson.description && <span className="mt-1 block line-clamp-2 text-sm leading-5 text-[var(--muted)]">{lesson.description}</span>}
                        </span>
                        <span className="hidden shrink-0 text-xs text-[var(--muted-2)] sm:block">
                          {sectionCount} {sectionCount === 1 ? "section" : "sections"} · {phaseDetails.label}
                        </span>
                        <span aria-hidden="true" className="shrink-0 text-[var(--accent)]">→</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-12 text-center">
          <p className="font-medium text-[var(--foreground)]">No modules are published in this track yet.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Published lessons will appear here as soon as they are ready.</p>
        </div>
      )}
    </div>
  );
}

export default function TrackDetailPage({ params }: TrackPageProps) {
  return <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-16 text-sm text-[var(--muted)]">Loading track…</div>}><TrackDetailContent params={params} /></Suspense>;
}
