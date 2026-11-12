import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { resolveAdminAccount } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { chapters, lessons, tracks } from "@/lib/schema";
import AdminDashboard from "./admin-client";

async function AdminContent() {
  await connection();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  const adminAccount = await resolveAdminAccount(session);
  if (!adminAccount) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold">Admin Access Required</h1>
        <p className="text-[#9aa6c4]">You need admin privileges to access the Presentation Engine.</p>
        <p className="mt-4 text-sm text-[#6b7796]">Signed in as {session.user.email}</p>
      </div>
    );
  }

  const initialTracks = await db.select().from(tracks).orderBy(asc(tracks.orderIndex));
  const selectedTrackId = initialTracks[0]?.id;
  const initialLessons = selectedTrackId
    ? await db.select().from(lessons).where(eq(lessons.trackId, selectedTrackId)).orderBy(asc(lessons.orderIndex))
    : [];
  const selectedLessonId = initialLessons[0]?.id;
  const initialChapters = selectedLessonId
    ? await db.select().from(chapters).where(eq(chapters.lessonId, selectedLessonId)).orderBy(asc(chapters.orderIndex))
    : [];

  return <AdminDashboard initialTracks={initialTracks} initialLessons={initialLessons} initialChapters={initialChapters} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-[#6b7796]">Loading admin...</div>}>
      <AdminContent />
    </Suspense>
  );
}
