import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { hashPassword } from "@/lib/password";
import { isConfiguredAdminEmail } from "@/lib/admin-policy";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Use a valid email and a password between 8 and 128 characters." }, { status: 400 });
    }

    const [createdUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash: await hashPassword(password),
        isAdmin: isConfiguredAdminEmail(email),
      })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });

    if (!createdUser) {
      return NextResponse.json({ error: "Unable to create this account." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[v0] Email signup failed", error);
    return NextResponse.json({ error: "Unable to create this account right now." }, { status: 500 });
  }
}
