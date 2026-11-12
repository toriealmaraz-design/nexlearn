import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { CurriculumPhase } from "@/lib/curriculum-phases";

// ── Learning tracks (categories) ──
export const tracks = pgTable("tracks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  trackType: text("track_type").notNull().$type<"internal" | "affiliate">(),
  coverImageUrl: text("cover_image_url"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Lessons (modules within a track) ──
export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  trackId: uuid("track_id").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  orderIndex: integer("order_index").default(0),
  isPublished: boolean("is_published").default(false),
  phase: text("phase").$type<CurriculumPhase>().notNull().default("foundations"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Chapters (sections within a lesson) ──
export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  contentBody: text("content_body"),       // markdown content
  audioUrl: text("audio_url"),             // audio for this chapter
  pdfUrl: text("pdf_url"),                 // downloadable PDF
  meetLink: text("meet_link"),             // Google Meet link
  affiliateLink: text("affiliate_link"),   // Grodigital link
  durationMinutes: integer("duration_minutes").default(0),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Users (Google OAuth via NextAuth) ──
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  passwordHash: text("password_hash"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").unique().notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

// ── User progress (chapter completion tracking) ──
export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  chapterId: uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("user_chapter_unique").on(table.userId, table.chapterId),
]);

// ── Comments ──
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  chapterId: uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
