import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { resolveAdminAccount } from "@/lib/admin-access";
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

  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-[#6b7796]">Loading admin...</div>}>
      <AdminContent />
    </Suspense>
  );
}
