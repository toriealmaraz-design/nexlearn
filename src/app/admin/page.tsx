import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AdminDashboard from "./admin-client";

async function AdminContent() {
  await connection();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

  if (!user?.isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">🔒 Admin Access Required</h1>
        <p className="text-[#9aa6c4]">You need admin privileges to access the Presentation Engine.</p>
        <p className="text-[#6b7796] text-sm mt-4">Signed in as {session.user.email}</p>
      </div>
    );
  }

  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-[#6b7796]">Loading admin...</div>}>
      <AdminContent />
    </Suspense>
  );
}
