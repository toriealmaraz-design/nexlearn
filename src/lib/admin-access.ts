import { eq } from "drizzle-orm";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { isConfiguredAdminEmail } from "@/lib/admin-policy";

export async function resolveAdminAccount(session: Session | null) {
  const sessionUser = session?.user;
  const email = sessionUser?.email?.trim().toLowerCase();
  if (!sessionUser?.id || !email) return null;

  const [account] = await db
    .select({ id: users.id, email: users.email, isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!account) return null;

  const isAllowlisted = isConfiguredAdminEmail(email);
  if (account.id !== sessionUser.id && !isAllowlisted) return null;
  if (!account.isAdmin && !isAllowlisted) return null;

  if (isAllowlisted && !account.isAdmin) {
    await db.update(users).set({ isAdmin: true }).where(eq(users.id, account.id));
  }

  return { id: account.id, email: account.email, isAdmin: true as const };
}

export async function requireAdmin() {
  const session = await auth();
  const account = await resolveAdminAccount(session);
  if (!account) throw new Error("Forbidden");
  return account;
}
