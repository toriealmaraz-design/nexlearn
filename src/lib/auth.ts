import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { verifyPassword } from "@/lib/password";
import { isConfiguredAdminEmail } from "@/lib/admin-policy";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return null;

        if (isConfiguredAdminEmail(email) && !user.isAdmin) {
          await db.update(users).set({ isAdmin: true }).where(eq(users.id, user.id));
        }

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  session: { strategy: "jwt" },
  cookies: process.env.NODE_ENV === "development"
    ? {
        sessionToken: {
          name: "authjs.session-token",
          options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
        },
        csrfToken: {
          name: "authjs.csrf-token",
          options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
        },
        callbackUrl: {
          name: "authjs.callback-url",
          options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
        },
      }
    : undefined,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.trim().toLowerCase();
      const googleProfile = profile as { email_verified?: unknown } | undefined;
      if (!email || googleProfile?.email_verified !== true) return false;

      const [existing] = await db
        .select({ id: users.id, name: users.name, image: users.image, isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      let userId = existing?.id;
      if (existing) {
        await db
          .update(users)
          .set({
            name: user.name ?? existing.name,
            image: user.image ?? existing.image,
            emailVerified: new Date(),
            ...(isConfiguredAdminEmail(email) ? { isAdmin: true } : {}),
          })
          .where(eq(users.id, existing.id));
      } else {
        const [created] = await db
          .insert(users)
          .values({
            email,
            name: user.name ?? null,
            image: user.image ?? null,
            emailVerified: new Date(),
            isAdmin: isConfiguredAdminEmail(email),
          })
          .onConflictDoNothing({ target: users.email })
          .returning({ id: users.id });

        userId = created?.id;
        if (!userId) {
          const [concurrentUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          userId = concurrentUser?.id;

          if (userId && isConfiguredAdminEmail(email)) {
            await db.update(users).set({ isAdmin: true }).where(eq(users.id, userId));
          }
        }
      }

      if (!userId) return false;
      user.id = userId;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub ?? user?.id ?? session.user.id;
      }
      return session;
    },
  },
});
