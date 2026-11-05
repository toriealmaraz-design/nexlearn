import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { tracks as tracksTable } from "@/lib/schema";
import { asc } from "drizzle-orm";
import type { Track } from "@/lib/types";

async function TracksContent() {
  await connection();
  let tracks: Track[] = [];
  try {
    tracks = await db.select().from(tracksTable).orderBy(asc(tracksTable.orderIndex));
  } catch (error) {
    console.error("[tracks] Unable to load tracks", error);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Learning Tracks</h1>
      <p className="text-[#9aa6c4] mb-12 text-lg">Choose your path. All tracks are 100% free.</p>

      {tracks.length === 0 ? (
        <div className="text-center py-20 text-[#6b7796]">
          <p className="text-lg">No tracks available yet.</p>
          <p className="text-sm mt-2">Check back soon — courses are being built!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tracks.map((track) => (
            <Link
              key={track.id}
              href={`/tracks/${track.id}`}
              className="block p-6 rounded-2xl bg-[rgba(12,18,38,.55)] border border-[rgba(150,175,230,.12)] hover:border-[rgba(93,240,168,.3)] transition group"
            >
              {track.coverImageUrl && (
                <div className="w-full h-40 rounded-xl bg-[rgba(16,24,48,.65)] mb-5 overflow-hidden">
                  <img src={track.coverImageUrl} alt={track.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  track.trackType === 'internal'
                    ? 'bg-[rgba(93,240,168,.1)] text-[#5df0a8] border border-[rgba(93,240,168,.2)]'
                    : 'bg-[rgba(93,240,168,.08)] text-[#5df0a8] border border-[rgba(93,240,168,.18)]'
                }`}>
                  {track.trackType === 'internal' ? 'Live Classes' : 'Guided Pathway'}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-[#5df0a8] transition">{track.title}</h2>
              <p className="text-[#9aa6c4] text-sm leading-relaxed">{track.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TracksPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-16 text-[#6b7796]">Loading tracks...</div>}>
      <TracksContent />
    </Suspense>
  );
}
