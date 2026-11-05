import type { InferSelectModel } from "drizzle-orm";
import type { tracks, lessons, profiles, comments } from "./schema";

export type Track = InferSelectModel<typeof tracks>;
export type Lesson = InferSelectModel<typeof lessons>;
export type Profile = InferSelectModel<typeof profiles>;
export type Comment = InferSelectModel<typeof comments>;
