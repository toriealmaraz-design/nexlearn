import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { tracks as tracksTable, lessons as lessonsTable } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import type { Track, Lesson } from "@/lib/types";

async function TrackDetailContent({ params }: { params: Promise<{ trackId: string }> }) {
  await connection();
  const { trackId } = await params;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(trackId)) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-[#6b7796]">Track not found.</div>;
  }

  const [track] = await db.select().from(tracksTable).where(eq(tracksTable.id, trackId)).limit(1);
  if (!track) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-[#6b7796]">Track not found.</div>;
  }

  const ls: Lesson[] = await db.select().from(lessonsTable)
    .where(and(eq(lessonsTable.trackId, trackId), eq(lessonsTable.isPublished, true)))
    .orderBy(asc(lessonsTable.orderIndex));

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Link href="/tracks" className="text-sm text-[#6b7796] hover:text-[#9aa6c4] transition mb-6 inline-block">← All Tracks</Link>
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          track.trackType === 'internal'
            ? 'bg-[rgba(93,240,168,.1)] text-[#5df0a8] border border-[rgba(93,240,168,.2)]'
            : 'bg-[rgba(93,240,168,.08)] text-[#5df0a8] border border-[rgba(93,240,168,.18)]'
        }`}>
          {track.trackType === 'internal' ? 'Live Classes' : 'Guided Pathway'}
        </span>
      </div>
      <h1 className="text-4xl font-bold mb-4">{track.title}</h1>
      <p className="text-[#9aa6c4] text-lg mb-12">{track.description}</p>

      {ls.length === 0 ? (
        <div className="text-center py-16 text-[#6b7796]">
          <p>No lessons published yet. Stay tuned!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ls.map((lesson, i) => (
            <Link
              key={lesson.id}
              href={`/tracks/${trackId}/lessons/${lesson.id}`}
              className="flex items-center gap-4 p-5 rounded-xl bg-[rgba(12,18,38,.55)] border border-[rgba(150,175,230,.12)] hover:border-[rgba(93,240,168,.3)] transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-[rgba(93,240,168,.1)] flex items-center justify-center text-[#5df0a8] font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-[#5df0a8] transition truncate">{lesson.title}</h3>
                {lesson.description && <p className="text-xs text-[#6b7796] mt-1 truncate">{lesson.description}</p>}
              </div>
              <span className="text-gray-600 group-hover:text-[#9aa6c4] transition">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrackDetailPage({ params }: { params: Promise<{ trackId: string }> }) {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-[#6b7796]">Loading track...</div>}>
      <TrackDetailContent params={params} />
    </Suspense>
  );
}
