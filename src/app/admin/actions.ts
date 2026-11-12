"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { chapters, lessons, tracks } from "@/lib/schema";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireUuid(value: unknown, field: string) {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
}

function requireText(value: unknown, field: string, maxLength = 240) {
  if (typeof value !== "string") throw new Error(`Invalid ${field}`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new Error(`Invalid ${field}`);
  return normalized;
}

function optionalText(value: unknown, field: string, maxLength = 10_000) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string" || value.length > maxLength) throw new Error(`Invalid ${field}`);
  return value.trim();
}

function nonNegativeInteger(value: unknown, field: string, fallback = 0) {
  if (value === undefined || value === null) return fallback;
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 100_000) {
    throw new Error(`Invalid ${field}`);
  }
  return Number(value);
}

function requireBoolean(value: unknown, field: string) {
  if (typeof value !== "boolean") throw new Error(`Invalid ${field}`);
  return value;
}

function revalidateContent() {
  revalidatePath("/admin");
  revalidatePath("/tracks");
}

export async function getTracks() {
  await requireAdmin();
  return db.select().from(tracks).orderBy(asc(tracks.orderIndex));
}

export async function getLessons(trackId: string) {
  await requireAdmin();
  const validTrackId = requireUuid(trackId, "track ID");
  return db.select().from(lessons).where(eq(lessons.trackId, validTrackId)).orderBy(asc(lessons.orderIndex));
}

export async function getChapters(lessonId: string) {
  await requireAdmin();
  const validLessonId = requireUuid(lessonId, "lesson ID");
  return db.select().from(chapters).where(eq(chapters.lessonId, validLessonId)).orderBy(asc(chapters.orderIndex));
}

export async function createTrack(title: string, trackType: string) {
  await requireAdmin();
  const validTitle = requireText(title, "track title");
  if (trackType !== "internal" && trackType !== "affiliate") throw new Error("Invalid track type");

  await db.insert(tracks).values({ title: validTitle, trackType, description: "" });
  revalidateContent();
}

export async function createLesson(data: {
  trackId: string;
  title: string;
  description?: string;
  orderIndex?: number;
  isPublished?: boolean;
}) {
  await requireAdmin();
  const trackId = requireUuid(data?.trackId, "track ID");
  const title = requireText(data?.title, "lesson title");
  const description = optionalText(data?.description, "lesson description", 5_000);
  const orderIndex = nonNegativeInteger(data?.orderIndex, "lesson order");
  const isPublished = data?.isPublished === undefined ? false : requireBoolean(data.isPublished, "publish state");
  const [track] = await db.select({ id: tracks.id }).from(tracks).where(eq(tracks.id, trackId)).limit(1);
  if (!track) throw new Error("Track not found");

  await db.insert(lessons).values({ trackId, title, description, orderIndex, isPublished });
  revalidateContent();
}

export async function updateLesson(id: string, data: Record<string, unknown>) {
  await requireAdmin();
  const lessonId = requireUuid(id, "lesson ID");
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid lesson update");

  const updates: Partial<typeof lessons.$inferInsert> = {};
  if (data.title !== undefined) updates.title = requireText(data.title, "lesson title");
  if (data.description !== undefined) updates.description = optionalText(data.description, "lesson description", 5_000);
  if (data.coverImageUrl !== undefined) updates.coverImageUrl = optionalText(data.coverImageUrl, "cover image URL", 2_000);
  if (data.orderIndex !== undefined) updates.orderIndex = nonNegativeInteger(data.orderIndex, "lesson order");
  if (data.isPublished !== undefined) updates.isPublished = requireBoolean(data.isPublished, "publish state");
  if (Object.keys(updates).length === 0) throw new Error("No valid lesson fields provided");

  await db.update(lessons).set(updates).where(eq(lessons.id, lessonId));
  revalidateContent();
}

export async function deleteLesson(id: string) {
  await requireAdmin();
  const lessonId = requireUuid(id, "lesson ID");
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  revalidateContent();
}

export async function createChapter(data: {
  lessonId: string;
  title: string;
  contentBody?: string;
  audioUrl?: string;
  pdfUrl?: string;
  meetLink?: string;
  affiliateLink?: string;
  durationMinutes?: number;
  orderIndex?: number;
}) {
  await requireAdmin();
  const lessonId = requireUuid(data?.lessonId, "lesson ID");
  const title = requireText(data?.title, "chapter title");
  const [lesson] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  if (!lesson) throw new Error("Lesson not found");

  await db.insert(chapters).values({
    lessonId,
    title,
    contentBody: optionalText(data?.contentBody, "chapter content"),
    audioUrl: optionalText(data?.audioUrl, "audio URL", 2_000),
    pdfUrl: optionalText(data?.pdfUrl, "PDF URL", 2_000),
    meetLink: optionalText(data?.meetLink, "meeting URL", 2_000),
    affiliateLink: optionalText(data?.affiliateLink, "affiliate URL", 2_000),
    durationMinutes: nonNegativeInteger(data?.durationMinutes, "chapter duration", 0),
    orderIndex: nonNegativeInteger(data?.orderIndex, "chapter order", 0),
  });
  revalidateContent();
}

export async function updateChapter(id: string, data: Record<string, unknown>) {
  await requireAdmin();
  const chapterId = requireUuid(id, "chapter ID");
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid chapter update");

  const updates: Partial<typeof chapters.$inferInsert> = {};
  if (data.title !== undefined) updates.title = requireText(data.title, "chapter title");
  if (data.contentBody !== undefined) updates.contentBody = optionalText(data.contentBody, "chapter content");
  if (data.audioUrl !== undefined) updates.audioUrl = optionalText(data.audioUrl, "audio URL", 2_000);
  if (data.pdfUrl !== undefined) updates.pdfUrl = optionalText(data.pdfUrl, "PDF URL", 2_000);
  if (data.meetLink !== undefined) updates.meetLink = optionalText(data.meetLink, "meeting URL", 2_000);
  if (data.affiliateLink !== undefined) updates.affiliateLink = optionalText(data.affiliateLink, "affiliate URL", 2_000);
  if (data.durationMinutes !== undefined) updates.durationMinutes = nonNegativeInteger(data.durationMinutes, "chapter duration");
  if (data.orderIndex !== undefined) updates.orderIndex = nonNegativeInteger(data.orderIndex, "chapter order");
  if (Object.keys(updates).length === 0) throw new Error("No valid chapter fields provided");

  await db.update(chapters).set(updates).where(eq(chapters.id, chapterId));
  revalidateContent();
}

export async function deleteChapter(id: string) {
  await requireAdmin();
  const chapterId = requireUuid(id, "chapter ID");
  await db.delete(chapters).where(eq(chapters.id, chapterId));
  revalidateContent();
}
