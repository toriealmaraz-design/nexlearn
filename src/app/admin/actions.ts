"use server";

import { db } from "@/lib/db";
import { tracks, lessons } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTracks() {
  return db.select().from(tracks).orderBy(asc(tracks.orderIndex));
}

export async function getLessons(trackId: string) {
  return db.select().from(lessons).where(eq(lessons.trackId, trackId)).orderBy(asc(lessons.orderIndex));
}

export async function createTrack(title: string, trackType: string) {
  await db.insert(tracks).values({ title, trackType: trackType as "internal" | "affiliate", description: "" });
  revalidatePath("/admin");
}

export async function createLesson(data: {
  trackId: string; title: string; contentBody?: string; audioUrl?: string;
  pdfUrl?: string; meetLink?: string; affiliateLink?: string; orderIndex?: number; isPublished?: boolean;
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
