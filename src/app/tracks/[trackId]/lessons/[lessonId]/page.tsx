import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import SelfAuditChecklist from "@/components/self-audit-checklist";
import { getCurriculumPhase } from "@/lib/curriculum-phases";
import { db } from "@/lib/db";
import { chapters, lessons, tracks, userProgress } from "@/lib/schema";
import type { Chapter, Lesson, Track } from "@/lib/types";
import ProgressControl from "./progress-control";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LessonPageProps = {
  params: Promise<{ trackId: string; lessonId: string }>;
  searchParams: Promise<{ chapter?: string }>;
};

async function LessonDetailContent({ params, searchParams }: LessonPageProps) {
  await connection();
  const [{ trackId, lessonId }, query] = await Promise.all([params, searchParams]);
  if (!UUID_PATTERN.test(trackId) || !UUID_PATTERN.test(lessonId)) notFound();

  let track: Track | undefined;
  let lesson: Lesson | undefined;
  let allChapters: Chapter[] = [];
  let session: Session | null = null;
  const completedChapterIds = new Set<string>();

  try {
    const [trackRows, lessonRows] = await Promise.all([
      db.select().from(tracks).where(eq(tracks.id, trackId)).limit(1),
      db
        .select()
        .from(lessons)
        .where(and(eq(lessons.id, lessonId), eq(lessons.trackId, trackId), eq(lessons.isPublished, true)))
        .limit(1),
    ]);
    track = trackRows[0];
    lesson = lessonRows[0];

    if (track && lesson) {
      allChapters = await db
        .select()
        .from(chapters)
        .where(eq(chapters.lessonId, lessonId))
        .orderBy(asc(chapters.orderIndex));
      session = await auth();
      const userId = session?.user?.id;

      if (userId && allChapters.length > 0) {
        const completedRows = await db
          .select({ chapterId: userProgress.chapterId })
          .from(userProgress)
          .where(and(
            eq(userProgress.userId, userId),
            eq(userProgress.completed, true),
            inArray(userProgress.chapterId, allChapters.map((chapter) => chapter.id)),
          ));
        for (const row of completedRows) completedChapterIds.add(row.chapterId);
      }
    }
  } catch {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="font-medium text-[var(--foreground)]">The learning content is temporarily unavailable.</p>
        <Link href="/tracks" className="mt-3 inline-block text-sm text-[var(--accent)] underline underline-offset-4">Back to tracks</Link>
      </div>
    );
  }

  if (!track || !lesson) notFound();

  const selectedIndex = allChapters.findIndex((chapter) => chapter.id === query.chapter);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const activeChapter = allChapters[activeIndex] ?? null;
  const phase = getCurriculumPhase(lesson.phase);
  const previousChapter = activeIndex > 0 ? allChapters[activeIndex - 1] : null;
  const nextChapter = activeIndex < allChapters.length - 1 ? allChapters[activeIndex + 1] : null;
  const callbackUrl = activeChapter
    ? `/tracks/${trackId}/lessons/${lessonId}?chapter=${activeChapter.id}`
    : `/tracks/${trackId}/lessons/${lessonId}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted-2)]">
        <Link href="/tracks" className="transition hover:text-[var(--accent)]">Tracks</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/tracks/${trackId}`} className="max-w-56 truncate transition hover:text-[var(--accent)]">{track.title}</Link>
        <span aria-hidden="true">/</span>
        <span className="max-w-64 truncate text-[var(--muted)]">{lesson.title}</span>
      </div>

      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-[var(--accent)]">{phase.label} · {lesson.orderIndex !== null ? `Module ${String(lesson.orderIndex + 1).padStart(2, "0")}` : "Module"}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{lesson.title}</h1>
        {lesson.description && <p className="mt-4 text-base leading-7 text-[var(--muted)]">{lesson.description}</p>}
        <p className="mt-4 text-sm text-[var(--muted-2)]">Read at your own pace. Sign in is optional and only saves your progress.</p>
      </header>

      {session?.user && allChapters.length > 0 && (
        <section className="mb-8 max-w-3xl rounded-xl border border-[var(--line)] bg-[var(--glass)] p-4" aria-label="Learning progress">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--muted)]">Your progress in this module</span>
            <span className="tabular-nums text-[var(--foreground)]">{completedChapterIds.size} / {allChapters.length} sections</span>
          </div>
          <progress className="mt-3 h-1.5 w-full accent-[var(--accent)]" value={completedChapterIds.size} max={allChapters.length} aria-label="Completed sections" />
        </section>
      )}

      {allChapters.length > 0 && (
        <details className="mb-6 rounded-xl border border-[var(--line)] bg-[var(--glass)] p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-medium text-[var(--foreground)]">Sections in this module ({allChapters.length})</summary>
          <nav aria-label="Lesson sections" className="mt-4 flex flex-col gap-1">
            {allChapters.map((chapter, index) => (
              <Link key={chapter.id} href={`/tracks/${trackId}/lessons/${lessonId}?chapter=${chapter.id}`} aria-current={activeChapter?.id === chapter.id ? "page" : undefined} className={`rounded-lg px-3 py-2 text-sm transition ${activeChapter?.id === chapter.id ? "bg-[rgba(93,240,168,.1)] text-[var(--accent)]" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"}`}>
                <span className="mr-2 tabular-nums text-[var(--muted-2)]">{String(index + 1).padStart(2, "0")}</span>{chapter.title}
                {chapter.durationMinutes ? <span className="ml-2 text-xs text-[var(--muted-2)]">{chapter.durationMinutes} min</span> : null}
              </Link>
            ))}
          </nav>
        </details>
      )}

      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        {allChapters.length > 0 && (
          <aside className="hidden lg:block">
            <nav aria-label="Lesson sections" className="sticky top-24 rounded-xl border border-[var(--line)] bg-[var(--glass)] p-4">
              <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">In this module</h2>
              <ol className="flex flex-col gap-1">
                {allChapters.map((chapter, index) => (
                  <li key={chapter.id}>
                    <Link href={`/tracks/${trackId}/lessons/${lessonId}?chapter=${chapter.id}`} aria-current={activeChapter?.id === chapter.id ? "page" : undefined} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition ${activeChapter?.id === chapter.id ? "bg-[rgba(93,240,168,.1)] text-[var(--accent)]" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"}`}>
                      <span className="mt-0.5 shrink-0 text-xs tabular-nums text-[var(--muted-2)]">{String(index + 1).padStart(2, "0")}</span>
                      <span className="min-w-0">
                        <span className="block leading-5">{chapter.title}</span>
                        {chapter.durationMinutes ? <span className="mt-1 block text-xs text-[var(--muted-2)]">{chapter.durationMinutes} min</span> : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}

        <article className="min-w-0 max-w-3xl">
          {activeChapter ? (
            <>
              <div className="mb-6 border-b border-[var(--line)] pb-5">
                <h2 className="text-2xl font-semibold tracking-tight">{activeChapter.title}</h2>
                {activeChapter.durationMinutes ? <p className="mt-2 text-sm text-[var(--muted-2)]">About {activeChapter.durationMinutes} minutes</p> : null}
              </div>

              {activeChapter.meetLink && (
                <a href={activeChapter.meetLink} target="_blank" rel="noopener noreferrer" className="mb-6 inline-flex min-h-10 items-center rounded-full border border-[var(--line-strong)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                  Join live session <span className="ml-2" aria-hidden="true">↗</span>
                </a>
              )}

              {activeChapter.audioUrl && (
                <div className="mb-6 rounded-xl border border-[var(--line)] bg-[var(--glass)] p-4">
                  <p className="mb-3 text-sm font-medium text-[var(--foreground)]">Listen to this section</p>
                  <audio controls preload="metadata" className="w-full" aria-label={`Audio for ${activeChapter.title}`}>
                    <source src={activeChapter.audioUrl} type="audio/mpeg" />
                  </audio>
                </div>
              )}

              {activeChapter.contentBody ? (
                <div className="mb-8 whitespace-pre-wrap break-words text-[15px] leading-7 text-[var(--muted)]">{activeChapter.contentBody}</div>
              ) : (
                <p className="mb-8 text-sm text-[var(--muted-2)]">Lesson text is being prepared for this section.</p>
              )}

              {activeChapter.pdfUrl && (
                <div className="mb-8 rounded-xl border border-[var(--line)] bg-[var(--glass)] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--foreground)]">Section resource</p>
                    <a href={activeChapter.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] underline underline-offset-4">Open PDF</a>
                  </div>
                  <iframe src={activeChapter.pdfUrl} title={`PDF resource for ${activeChapter.title}`} className="h-[28rem] w-full rounded-lg border border-[var(--line)]" />
                </div>
              )}

              {activeChapter.affiliateLink && (
                <aside className="mb-8 rounded-xl border border-[var(--line)] bg-[var(--glass)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--muted-2)]">Optional partner resource</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Continue with an external course or resource if it fits your learning path.</p>
                  <a href={activeChapter.affiliateLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-2)]">
                    Open external resource <span className="ml-2" aria-hidden="true">↗</span>
                  </a>
                </aside>
              )}

              {track.trackType === "internal" && activeIndex === allChapters.length - 1 && <div className="mb-8"><SelfAuditChecklist /></div>}

              {activeChapter && (
                <ProgressControl
                  chapterId={activeChapter.id}
                  completed={completedChapterIds.has(activeChapter.id)}
                  isSignedIn={Boolean(session?.user?.id)}
                  loginHref={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                />
              )}

              <nav aria-label="Module navigation" className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                {previousChapter ? (
                  <Link href={`/tracks/${trackId}/lessons/${lessonId}?chapter=${previousChapter.id}`} className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]">← Previous section</Link>
                ) : <span />}
                {nextChapter ? (
                  <Link href={`/tracks/${trackId}/lessons/${lessonId}?chapter=${nextChapter.id}`} className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--foreground)]">Next section →</Link>
                ) : (
                  <Link href={`/tracks/${trackId}`} className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--foreground)]">Back to track →</Link>
                )}
              </nav>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-12 text-center">
              <p className="font-medium text-[var(--foreground)]">No sections in this module yet.</p>
              <p className="mt-2 text-sm text-[var(--muted)]">The lesson will be ready as soon as its content is published.</p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

export default function LessonDetailPage(props: LessonPageProps) {
  return <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-sm text-[var(--muted)]">Loading lesson…</div>}><LessonDetailContent {...props} /></Suspense>;
}
