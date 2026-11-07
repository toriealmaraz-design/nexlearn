import type { InferSelectModel } from "drizzle-orm";
import type { tracks, lessons, chapters, users, userProgress, comments } from "./schema";

export type Track = InferSelectModel<typeof tracks>;
export type Lesson = InferSelectModel<typeof lessons>;
export type Chapter = InferSelectModel<typeof chapters>;
export type User = InferSelectModel<typeof users>;
export type UserProgress = InferSelectModel<typeof userProgress>;
export type Comment = InferSelectModel<typeof comments>;
