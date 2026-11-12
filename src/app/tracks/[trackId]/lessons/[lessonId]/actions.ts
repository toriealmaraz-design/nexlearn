"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chapters, lessons, userProgress } from "@/lib/schema";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function setChapterCompleted(chapterId: string, completed: boolean) {
  if (!UUID_PATTERN.test(chapterId) || typeof completed !== "boolean") {
    throw new Error("Invalid progress update");
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Sign in to save your learning progress.");

  const [chapter] = await db
    .select({ trackId: lessons.trackId })
    .from(chapters)
    .innerJoin(lessons, eq(chapters.lessonId, lessons.id))
    .where(and(eq(chapters.id, chapterId), eq(lessons.isPublished, true)))
    .limit(1);

  if (!chapter) throw new Error("This section is no longer available.");

  if (completed) {
    const completedAt = new Date();
    await db
      .insert(userProgress)
      .values({ userId, chapterId, completed: true, completedAt })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.chapterId],
        set: { completed: true, completedAt },
      });
  } else {
    await db
      .delete(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.chapterId, chapterId)));
  }
}
