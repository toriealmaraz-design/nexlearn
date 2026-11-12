import { asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { lessons, tracks } from "@/lib/schema";
import type { Lesson, Track } from "@/lib/types";

export type TrackWithLessons = {
  track: Track;
  lessons: Lesson[];
};

export async function getPublishedCurriculum(): Promise<TrackWithLessons[] | null> {
  await connection();

  try {
    const [allTracks, publishedLessons] = await Promise.all([
      db.select().from(tracks).orderBy(asc(tracks.orderIndex)),
      db
        .select()
        .from(lessons)
        .where(eq(lessons.isPublished, true))
        .orderBy(asc(lessons.orderIndex)),
    ]);

    return allTracks.map((track) => ({
      track,
      lessons: publishedLessons.filter((lesson) => lesson.trackId === track.id),
    }));
  } catch {
    console.warn("[curriculum] Database request failed");
    return null;
  }
}
