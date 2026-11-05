# NexLearn — Learn. Build. Earn.

A free educational platform with live coding classes, audio lessons, PDF resources, and curated digital marketing pathways. Built with Next.js 16, Neon Postgres, Drizzle ORM, and deployed on Vercel.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Database:** [Neon](https://neon.tech) serverless Postgres
- **ORM:** Drizzle ORM + drizzle-kit
- **Hosting:** [Vercel](https://vercel.com)
- **Landing Page:** WebGL planet scene (Three.js r0.143) with glassmorphism UI + AI chatbot

## Getting Started

### 1. Create a Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up (free tier available)
2. Click **"New Project"** → name it `nexlearn`
3. Choose your region (pick the closest to your users)
4. Copy the **connection string** — it looks like:
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Set Up the Database Schema

Option A — **Drizzle push** (recommended):
```bash
cp .env.example .env.local
# Edit .env.local with your Neon connection string
pnpm drizzle-kit push
```

Option B — **Run SQL manually** in the Neon SQL Editor:
- Open `neon-schema.sql` and paste its contents into the Neon dashboard SQL Editor

### 3. Local Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page loads with the WebGL planet.

### 4. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo
3. Add the environment variable:
   - `DATABASE_URL` = your Neon connection string
4. Deploy — Vercel auto-detects Next.js

### 5. Seed Initial Data

After deploying, add your first admin and track via the Neon SQL Editor:

```sql
-- Create an admin profile (replace with your email)
INSERT INTO profiles (email, password_hash, display_name, is_admin)
VALUES ('you@example.com', 'temp-hash', 'Admin', true);

-- Create your first track
INSERT INTO tracks (title, description, track_type)
VALUES ('Vibe Coding', 'Learn to build real software with AI-assisted coding.', 'internal');

-- Create your first lesson
INSERT INTO lessons (track_id, title, content_body, is_published, order_index)
VALUES (
  (SELECT id FROM tracks WHERE title = 'Vibe Coding'),
  'Welcome to Vibe Coding',
  'In this track you will learn to build full-stack apps using AI tools...',
  true,
  0
);
```

Then visit `/tracks` to see your content, or `/admin` to manage it.

## Project Structure

```
nexlearn/
├── public/
│   └── landing.html          # WebGL planet landing page + AI chatbot
├── src/
│   ├── app/
│   │   ├── page.tsx           # Redirects to landing.html
│   │   ├── layout.tsx         # Global nav + layout
│   │   ├── login/page.tsx     # Auth page
│   │   ├── admin/
│   │   │   ├── page.tsx       # Presentation Engine (admin CRUD)
│   │   │   └── actions.ts     # Server Actions for DB operations
│   │   └── tracks/
│   │       ├── page.tsx       # Track listing
│   │       └── [trackId]/
│   │           ├── page.tsx   # Track detail + lesson list
│   │           └── lessons/[lessonId]/page.tsx  # Lesson view
│   └── lib/
│       ├── db.ts              # Neon + Drizzle client
│       ├── schema.ts          # Drizzle table definitions
│       └── types.ts           # Inferred TypeScript types
├── drizzle.config.ts          # Drizzle Kit config
├── neon-schema.sql            # Raw SQL schema (alternative to drizzle push)
└── .env.local                 # DATABASE_URL (not committed)
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |

## License

MIT
