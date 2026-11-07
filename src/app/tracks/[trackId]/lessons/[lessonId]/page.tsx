import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { lessons as lessonsTable, chapters as chaptersTable } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import type { Lesson, Chapter } from "@/lib/types";

async function LessonDetailContent({
  params,
}: {
  params: Promise<{ trackId: string; lessonId: string }>;
}) {
  await connection();
  const { trackId, lessonId } = await params;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(trackId) || !uuidPattern.test(lessonId)) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-[#6b7796]">Lesson not found.</div>;
  }

  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
  if (!lesson) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-[#6b7796]">Lesson not found.</div>;
  }

  const allChapters: Chapter[] = await db.select().from(chaptersTable)
    .where(eq(chaptersTable.lessonId, lessonId))
    .orderBy(asc(chaptersTable.orderIndex));

  const totalChapters = allChapters.length;
  // TODO: fetch real progress from user_progress table when auth is wired
  const completedCount = 0;

  // Default to first chapter
  const activeChapter = allChapters[0] || null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href={`/tracks/${trackId}`} className="text-sm text-[#6b7796] hover:text-[#9aa6c4] transition mb-6 inline-block">
        ← Back to Track
      </Link>

      {/* Lesson header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-[#9aa6c4] text-base leading-relaxed">{lesson.description}</p>
        )}
      </div>

      {/* Progress bar */}
      {totalChapters > 0 && (
        <div className="mb-8">
          <p className="text-sm text-[#6b7796] mb-2">{completedCount} of {totalChapters} sections completed</p>
          <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,.06)' }}>
            <div className="h-full rounded-full" style={{
              width: `${totalChapters > 0 ? (completedCount / totalChapters) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #2fd38a, #5df0a8)'
            }} />
            {completedCount < totalChapters && (
              <div className="h-full" style={{
                width: `${((totalChapters - completedCount) / totalChapters) * 100}%`,
                background: 'rgba(255,100,100,.25)'
              }} />
            )}
          </div>
        </div>
      )}

      {/* Two-column layout: TOC sidebar + chapter content */}
      <div className="flex gap-8" style={{ minHeight: '60vh' }}>
        {/* Sidebar: Table of Contents */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <div className="sticky top-24 p-5 rounded-2xl border border-[rgba(150,175,230,.12)]" style={{ background: 'rgba(12,18,38,.55)', backdropFilter: 'blur(14px)' }}>
            <h2 className="text-base font-bold mb-4">Table of Contents</h2>
            <div className="space-y-1">
              {allChapters.map((ch, i) => {
                const isActive = activeChapter?.id === ch.id;
                // TODO: check real completion status
                const isCompleted = false;
                return (
                  <a
                    key={ch.id}
                    href={`/tracks/${trackId}/lessons/${lessonId}?chapter=${ch.id}`}
                    className={`flex items-start gap-3 p-3 rounded-xl text-sm transition ${
                      isActive
                        ? 'bg-[rgba(93,240,168,.08)] border border-[rgba(93,240,168,.15)]'
                        : 'hover:bg-[rgba(255,255,255,.04)]'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><circle cx="10" cy="10" r="9" stroke="#5df0a8" strokeWidth="1.5"/><path d="m7 10 2 2 4-4" stroke="#5df0a8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : (
                        <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><circle cx="10" cy="10" r="9" stroke="#6b7796" strokeWidth="1.5"/><text x="10" y="14" textAnchor="middle" fill="#6b7796" fontSize="10" fontWeight="600">{i + 1}</text></svg>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`leading-snug ${isActive ? 'text-[#f3f6ff] font-semibold' : 'text-[#9aa6c4]'}`}>{ch.title}</p>
                      {ch.durationMinutes && ch.durationMinutes > 0 && (
                        <p className="text-xs text-[#6b7796] mt-1">{ch.durationMinutes} min</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {activeChapter ? (
            <div>
              {/* Chapter header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{activeChapter.title}</h2>
                  {activeChapter.durationMinutes && activeChapter.durationMinutes > 0 && (
                    <p className="text-sm text-[#6b7796] mt-1">Duration: {activeChapter.durationMinutes} min</p>
                  )}
                </div>
                {/* TODO: real completion badge */}
              </div>

              {/* Meet link */}
              {activeChapter.meetLink && (
                <a href={activeChapter.meetLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-[rgba(58,108,255,.1)] border border-[rgba(58,108,255,.2)] text-[#3a6cff] font-semibold text-sm hover:bg-[rgba(58,108,255,.2)] transition">
                  📹 Join Live Class
                </a>
              )}

              {/* Audio player */}
              {activeChapter.audioUrl && (
                <div className="mb-6 p-5 rounded-xl bg-[rgba(12,18,38,.55)] border border-[rgba(150,175,230,.12)]">
                  <p className="text-sm text-[#9aa6c4] mb-3 font-semibold">Listen to this section:</p>
                  <audio controls className="w-full" preload="metadata">
                    <source src={activeChapter.audioUrl} type="audio/mpeg" />
                  </audio>
                </div>
              )}

              {/* Content body */}
              {activeChapter.contentBody && (
                <div className="prose prose-invert prose-emerald max-w-none mb-8 leading-relaxed whitespace-pre-wrap text-[#9aa6c4]">
                  {activeChapter.contentBody}
                </div>
              )}

              {/* PDF */}
              {activeChapter.pdfUrl && (
                <div className="mb-8 p-5 rounded-xl bg-[rgba(12,18,38,.55)] border border-[rgba(150,175,230,.12)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-[#9aa6c4] font-semibold">📄 Resources</p>
                    <a href={activeChapter.pdfUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-4 py-2 rounded-full bg-[rgba(93,240,168,.1)] border border-[rgba(93,240,168,.2)] text-[#5df0a8] hover:bg-[rgba(93,240,168,.2)] transition">
                      Download PDF
                    </a>
                  </div>
                  <iframe src={activeChapter.pdfUrl} className="w-full h-[500px] rounded-lg border border-[rgba(150,175,230,.22)]" title="PDF Viewer" />
                </div>
              )}

              {/* Affiliate CTA */}
              {activeChapter.affiliateLink && (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-[#5df0a8]/5 to-[#5df0a8]/5 border border-[rgba(93,240,168,.18)] text-center mb-8">
                  <h3 className="text-xl font-bold mb-3">Ready to Level Up?</h3>
                  <p className="text-[#9aa6c4] text-sm mb-5 max-w-md mx-auto">Continue your learning journey with the full professional masterclass on Grodigital.</p>
                  <a href={activeChapter.affiliateLink} target="_blank" rel="noopener noreferrer"
                    className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[#5df0a8] to-[#2fd38a] text-[#032018] font-bold text-sm shadow-lg hover:shadow-[rgba(93,240,168,.3)] transition-all hover:-translate-y-0.5">
                    Access Full Course →
                  </a>
                </div>
              )}

              {/* Mark complete button */}
              <div className="flex items-center gap-4 mb-8 p-4 rounded-xl border border-[rgba(150,175,230,.12)]" style={{ background: 'rgba(12,18,38,.55)' }}>
                <button className="px-6 py-2.5 rounded-full bg-[#5df0a8] text-[#032018] font-bold text-sm hover:bg-[#2fd38a] transition">
                  ✓ Mark as Complete
                </button>
                <span className="text-sm text-[#6b7796]">Sign in to save your progress</span>
              </div>

              {/* Discussion */}
              <div className="pt-8 border-t border-[rgba(150,175,230,.12)]">
                <h3 className="text-lg font-bold mb-4">💬 Discussion</h3>
                <p className="text-[#6b7796] text-sm">Sign in with Google to join the conversation.</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-[#6b7796]">
              <p className="text-lg">No chapters yet.</p>
              <p className="text-sm mt-2">This lesson is being prepared — check back soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile TOC (below content on small screens) */}
      <div className="lg:hidden mt-8 p-5 rounded-2xl border border-[rgba(150,175,230,.12)]" style={{ background: 'rgba(12,18,38,.55)' }}>
        <h2 className="text-base font-bold mb-4">All Sections</h2>
        <div className="space-y-2">
          {allChapters.map((ch, i) => (
            <a key={ch.id} href={`/tracks/${trackId}/lessons/${lessonId}?chapter=${ch.id}`}
              className="flex items-center gap-3 p-3 rounded-xl text-sm hover:bg-[rgba(255,255,255,.04)] transition">
              <span className="w-7 h-7 rounded-lg bg-[rgba(93,240,168,.1)] flex items-center justify-center text-[#5df0a8] font-bold text-xs shrink-0">{i + 1}</span>
              <span className="text-[#9aa6c4] flex-1">{ch.title}</span>
              {ch.durationMinutes && ch.durationMinutes > 0 && <span className="text-xs text-[#6b7796]">{ch.durationMinutes} min</span>}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ trackId: string; lessonId: string }>;
}) {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-[#6b7796]">Loading lesson...</div>}>
      <LessonDetailContent params={params} />
    </Suspense>
  );
}
