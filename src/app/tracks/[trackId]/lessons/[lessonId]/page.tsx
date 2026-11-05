import Link from "next/link";
import { db } from "@/lib/db";
import { lessons as lessonsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { Lesson } from "@/lib/types";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ trackId: string; lessonId: string }>;
}) {
  const { trackId, lessonId } = await params;

  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);

  if (!lesson) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-[#6b7796]">Lesson not found.</div>;
  }

  const l = lesson as Lesson;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Link href={`/tracks/${trackId}`} className="text-sm text-[#6b7796] hover:text-[#9aa6c4] transition mb-8 inline-block">
        ← Back to Track
      </Link>

      <h1 className="text-3xl font-bold mb-6">{l.title}</h1>

      {l.meetLink && (
        <a
          href={l.meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mb-8 px-6 py-3 rounded-full bg-[rgba(58,108,255,.1)] border border-[rgba(58,108,255,.2)] text-[#3a6cff] font-semibold text-sm hover:bg-[rgba(58,108,255,.2)] transition"
        >
          📹 Join Live Class
        </a>
      )}

      {l.audioUrl && (
        <div className="mb-8 p-5 rounded-xl bg-[rgba(12,18,38,.55)] border border-[rgba(150,175,230,.12)]">
          <p className="text-sm text-[#9aa6c4] mb-3 font-semibold">🎧 Audio Lesson</p>
          <audio controls className="w-full" preload="metadata">
            <source src={l.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {l.contentBody && (
        <div className="prose prose-invert prose-emerald max-w-none mb-8 leading-relaxed whitespace-pre-wrap text-[#9aa6c4]">
          {l.contentBody}
        </div>
      )}

      {l.pdfUrl && (
        <div className="mb-8 p-5 rounded-xl bg-[rgba(12,18,38,.55)] border border-[rgba(150,175,230,.12)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#9aa6c4] font-semibold">📄 Lesson Resources</p>
            <a
              href={l.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-full bg-[rgba(93,240,168,.1)] border border-[rgba(93,240,168,.2)] text-[#5df0a8] hover:bg-[rgba(93,240,168,.2)] transition"
            >
              Download PDF
            </a>
          </div>
          <iframe
            src={l.pdfUrl}
            className="w-full h-[600px] rounded-lg border border-[rgba(150,175,230,.22)]"
            title="PDF Viewer"
          />
        </div>
      )}

      {l.affiliateLink && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#5df0a8]/5 to-[#5df0a8]/5 border border-[rgba(93,240,168,.18)] text-center">
          <h3 className="text-xl font-bold mb-3">Ready to Level Up?</h3>
          <p className="text-[#9aa6c4] text-sm mb-5 max-w-md mx-auto">
            Continue your learning journey with the full professional masterclass on Grodigital.
          </p>
          <a
            href={l.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[#5df0a8] to-[#2fd38a] text-[#032018] font-bold text-sm shadow-lg hover:shadow-[rgba(93,240,168,.3)] transition-all hover:-translate-y-0.5"
          >
            Access Full Course →
          </a>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-[rgba(150,175,230,.12)]">
        <h3 className="text-lg font-bold mb-4">💬 Discussion</h3>
        <p className="text-[#6b7796] text-sm">Sign in to join the conversation and ask questions.</p>
      </div>
    </div>
  );
}
