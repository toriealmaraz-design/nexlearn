"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { Chapter, Lesson } from "@/lib/types";
import { createChapter, deleteChapter, getChapters, updateChapter } from "./actions";

type ChapterManagerProps = {
  lesson: Lesson;
  initialChapters: Chapter[];
};

export default function ChapterManager({ lesson, initialChapters }: ChapterManagerProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [editing, setEditing] = useState<Partial<Chapter> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function refreshChapters() {
    setChapters(await getChapters(lesson.id));
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    startTransition(async () => {
      setError(null);
      try {
        const chapterData = {
          title: editing.title || "Untitled section",
          contentBody: editing.contentBody || "",
          audioUrl: editing.audioUrl || "",
          pdfUrl: editing.pdfUrl || "",
          meetLink: editing.meetLink || "",
          affiliateLink: editing.affiliateLink || "",
          durationMinutes: Number(editing.durationMinutes ?? 0),
          orderIndex: Number(editing.orderIndex ?? chapters.length),
        };

        if (editing.id) {
          await updateChapter(editing.id, chapterData);
        } else {
          await createChapter({ lessonId: lesson.id, ...chapterData });
        }

        setEditing(null);
        await refreshChapters();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Unable to save this section.");
      }
    });
  }

  function handleDelete(chapterId: string) {
    if (!window.confirm("Delete this section?")) return;

    startTransition(async () => {
      setError(null);
      try {
        await deleteChapter(chapterId);
        await refreshChapters();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this section.");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--glass)] p-5 sm:p-6" aria-labelledby="sections-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--accent)]">Presentation Engine</p>
          <h2 id="sections-heading" className="mt-2 text-xl font-semibold">Sections</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{lesson.title}</p>
        </div>
        <button
          type="button"
          onClick={() => { setError(null); setEditing({ title: "", contentBody: "", orderIndex: chapters.length, durationMinutes: 0 }); }}
          disabled={isPending}
          className="min-h-10 rounded-full border border-[rgba(93,240,168,.28)] px-4 text-sm font-medium text-[var(--accent)] transition hover:bg-[rgba(93,240,168,.08)] disabled:opacity-50"
        >
          Add section
        </button>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-red-200">{error}</p>}

      {chapters.length > 0 ? (
        <ol className="mt-5 flex flex-col divide-y divide-[var(--line)]">
          {chapters.map((chapter, index) => (
            <li key={chapter.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="text-xs tabular-nums text-[var(--muted-2)]">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">{chapter.title}</p>
                <p className="mt-1 text-xs text-[var(--muted-2)]">
                  {chapter.durationMinutes || 0} min · {chapter.contentBody ? "Lesson text" : "No lesson text"}
                </p>
              </div>
              <button type="button" onClick={() => { setError(null); setEditing(chapter); }} className="text-xs text-[var(--muted)] transition hover:text-[var(--accent)]">Edit</button>
              <button type="button" onClick={() => handleDelete(chapter.id)} disabled={isPending} className="text-xs text-[var(--muted-2)] transition hover:text-red-300 disabled:opacity-50">Delete</button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-[var(--line-strong)] px-4 py-6 text-center text-sm text-[var(--muted)]">
          No sections yet. Add a short lesson, resource, or live session.
        </p>
      )}

      {editing && (
        <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4 border-t border-[var(--line)] pt-6">
          <h3 className="text-base font-semibold">{editing.id ? "Edit section" : "New section"}</h3>
          <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            Section title
            <input required maxLength={240} value={editing.title || ""} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            Lesson text
            <textarea rows={8} value={editing.contentBody || ""} onChange={(event) => setEditing({ ...editing, contentBody: event.target.value })} className="rounded-lg border border-[var(--line-strong)] bg-[var(--background)] px-3 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
              Audio URL
              <input type="url" value={editing.audioUrl || ""} onChange={(event) => setEditing({ ...editing, audioUrl: event.target.value })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
              PDF URL
              <input type="url" value={editing.pdfUrl || ""} onChange={(event) => setEditing({ ...editing, pdfUrl: event.target.value })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
              Live session URL
              <input type="url" value={editing.meetLink || ""} onChange={(event) => setEditing({ ...editing, meetLink: event.target.value })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
              Optional partner resource URL
              <input type="url" value={editing.affiliateLink || ""} onChange={(event) => setEditing({ ...editing, affiliateLink: event.target.value })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
              Duration in minutes
              <input type="number" min={0} max={100000} value={editing.durationMinutes ?? 0} onChange={(event) => setEditing({ ...editing, durationMinutes: Number(event.target.value) })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
              Display order
              <input type="number" min={0} max={100000} value={editing.orderIndex ?? chapters.length} onChange={(event) => setEditing({ ...editing, orderIndex: Number(event.target.value) })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={isPending} className="min-h-11 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-2)] disabled:opacity-50">
              {isPending ? "Saving…" : "Save section"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-full border border-[var(--line-strong)] px-5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}
