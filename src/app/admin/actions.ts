"use server";

import { db } from "@/lib/db";
import { tracks, lessons, chapters } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTracks() {
  return db.select().from(tracks).orderBy(asc(tracks.orderIndex));
}

export async function getLessons(trackId: string) {
  return db.select().from(lessons).where(eq(lessons.trackId, trackId)).orderBy(asc(lessons.orderIndex));
}

export async function getChapters(lessonId: string) {
  return db.select().from(chapters).where(eq(chapters.lessonId, lessonId)).orderBy(asc(chapters.orderIndex));
}

export async function createTrack(title: string, trackType: string) {
  await db.insert(tracks).values({ title, trackType: trackType as "internal" | "affiliate", description: "" });
  revalidatePath("/admin");
}

export async function createLesson(data: {
  trackId: string; title: string; description?: string; orderIndex?: number; isPublished?: boolean;
}) {
  await db.insert(lessons).values(data);
  revalidatePath("/admin");
}

export async function updateLesson(id: string, data: Record<string, unknown>) {
  await db.update(lessons).set(data).where(eq(lessons.id, id));
  revalidatePath("/admin");
}

export async function deleteLesson(id: string) {
  await db.delete(lessons).where(eq(lessons.id, id));
  revalidatePath("/admin");
}

export async function createChapter(data: {
  lessonId: string; title: string; contentBody?: string; audioUrl?: string;
  pdfUrl?: string; meetLink?: string; affiliateLink?: string;
  durationMinutes?: number; orderIndex?: number;
}) {
  await db.insert(chapters).values(data);
  revalidatePath("/admin");
}

export async function updateChapter(id: string, data: Record<string, unknown>) {
  await db.update(chapters).set(data).where(eq(chapters.id, id));
  revalidatePath("/admin");
}

export async function deleteChapter(id: string) {
  await db.delete(chapters).where(eq(chapters.id, id));
  revalidatePath("/admin");
}
