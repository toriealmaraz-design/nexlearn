"use client";

import { useState, useTransition } from "react";
import type { Chapter, Lesson, Track } from "@/lib/types";
import { CURRICULUM_PHASES } from "@/lib/curriculum-phases";
import ChapterManager from "./chapter-manager";
import { createLesson, createTrack, deleteLesson as deleteLessonAction, getChapters, getLessons, getTracks, updateLesson } from "./actions";

interface AdminDashboardProps {
  initialTracks: Track[];
  initialLessons: Lesson[];
  initialChapters: Chapter[];
}

export default function AdminDashboard({ initialTracks, initialLessons, initialChapters }: AdminDashboardProps) {
  const [tracks, setTracks] = useState(initialTracks);
  const [lessons, setLessons] = useState(initialLessons);
  const [chapters, setChapters] = useState(initialChapters);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(initialTracks[0]?.id ?? null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(initialLessons[0]?.id ?? null);
  const [editing, setEditing] = useState<Partial<Lesson> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? null;

  async function refreshLessons(trackId: string, preferredLessonId?: string) {
    const nextLessons = await getLessons(trackId);
    const nextSelectedLesson = nextLessons.find((lesson) => lesson.id === preferredLessonId) ?? nextLessons[0] ?? null;
    setLessons(nextLessons);
    setSelectedLessonId(nextSelectedLesson?.id ?? null);
    setChapters(nextSelectedLesson ? await getChapters(nextSelectedLesson.id) : []);
  }

  function selectTrack(trackId: string) {
    startTransition(async () => {
      setError(null);
      try {
        setSelectedTrack(trackId);
        setSelectedLessonId(null);
        setLessons([]);
        setChapters([]);
        await refreshLessons(trackId);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load this track.");
      }
    });
  }

  function selectLesson(lessonId: string) {
    startTransition(async () => {
      setError(null);
      try {
        setSelectedLessonId(lessonId);
        setChapters(await getChapters(lessonId));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load this lesson.");
      }
    });
  }

  function handleSaveLesson() {
    if (!editing || !selectedTrack) return;

    startTransition(async () => {
      setError(null);
      try {
        const lessonData = {
          title: editing.title || "Untitled module",
          description: editing.description || "",
          orderIndex: Number(editing.orderIndex ?? lessons.length),
          isPublished: Boolean(editing.isPublished),
          phase: editing.phase ?? "foundations",
        };
        const preferredLessonId = editing.id;

        if (editing.id) {
          await updateLesson(editing.id, lessonData);
        } else {
          await createLesson({ trackId: selectedTrack, ...lessonData });
        }

        setEditing(null);
        await refreshLessons(selectedTrack, preferredLessonId);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Unable to save this module.");
      }
    });
  }

  function handleDeleteLesson(lessonId: string) {
    if (!window.confirm("Delete this module and its sections?")) return;

    startTransition(async () => {
      setError(null);
      try {
        await deleteLessonAction(lessonId);
        if (selectedTrack) await refreshLessons(selectedTrack);
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this module.");
      }
    });
  }

  function handleAddTrack() {
    const title = window.prompt("Track title:");
    if (!title?.trim()) return;
    const type = window.prompt("Type (internal or affiliate):", "internal");
    if (type !== "internal" && type !== "affiliate") {
      setError("Choose internal or affiliate for the track type.");
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        await createTrack(title, type);
        const nextTracks = await getTracks();
        setTracks(nextTracks);
        const createdTrack = nextTracks.find((track) => track.title === title.trim());
        if (createdTrack) {
          setSelectedTrack(createdTrack.id);
          await refreshLessons(createdTrack.id);
        }
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : "Unable to create this track.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--accent)]">NexLearn admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Presentation Engine</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Group modules into phases, publish lessons, and update resources without a redeploy.</p>
        </div>
        <button type="button" onClick={handleAddTrack} disabled={isPending} className="min-h-10 rounded-full border border-[rgba(93,240,168,.28)] px-4 text-sm font-medium text-[var(--accent)] transition hover:bg-[rgba(93,240,168,.08)] disabled:opacity-50">
          New track
        </button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-red-200">{error}</p>}

      <div className="mt-8 flex flex-wrap gap-2" aria-label="Learning tracks">
        {tracks.map((track) => (
          <button key={track.id} type="button" onClick={() => selectTrack(track.id)} disabled={isPending} aria-pressed={selectedTrack === track.id} className={`min-h-10 rounded-full border px-4 text-sm font-medium transition disabled:opacity-50 ${selectedTrack === track.id ? "border-[var(--accent)] bg-[rgba(93,240,168,.1)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
            {track.title}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)]">
        <section aria-labelledby="modules-heading">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 id="modules-heading" className="text-lg font-semibold">Modules</h2>
              <p className="mt-1 text-xs text-[var(--muted-2)]">Order and publish each module.</p>
            </div>
            <button type="button" onClick={() => setEditing({ title: "", description: "", orderIndex: lessons.length, isPublished: false, phase: "foundations" })} disabled={!selectedTrack || isPending} className="min-h-9 rounded-full border border-[var(--line-strong)] px-3 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--accent)] disabled:opacity-50">
              Add module
            </button>
          </div>

          <ol className="mt-4 flex flex-col divide-y divide-[var(--line)] rounded-xl border border-[var(--line)] bg-[var(--glass)] px-4">
            {lessons.map((lesson, index) => (
              <li key={lesson.id} className="flex flex-wrap items-center gap-3 py-4">
                <span className="text-xs tabular-nums text-[var(--muted-2)]">{String(index + 1).padStart(2, "0")}</span>
                <button type="button" onClick={() => selectLesson(lesson.id)} aria-pressed={selectedLessonId === lesson.id} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-medium text-[var(--foreground)]">{lesson.title}</span>
                  <span className="mt-1 block text-xs text-[var(--muted-2)]">{CURRICULUM_PHASES.find((phase) => phase.id === lesson.phase)?.label ?? "Foundations"} · {lesson.isPublished ? "Published" : "Draft"}</span>
                </button>
                <button type="button" onClick={() => setEditing(lesson)} className="text-xs text-[var(--muted)] transition hover:text-[var(--accent)]">Edit</button>
                <button type="button" onClick={() => handleDeleteLesson(lesson.id)} disabled={isPending} className="text-xs text-[var(--muted-2)] transition hover:text-red-300 disabled:opacity-50">Delete</button>
              </li>
            ))}
            {lessons.length === 0 && <li className="py-8 text-center text-sm text-[var(--muted)]">No modules in this track yet.</li>}
          </ol>
        </section>

        <div>
          {selectedLesson ? (
            <ChapterManager key={selectedLesson.id} lesson={selectedLesson} initialChapters={chapters} />
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-10 text-center text-sm text-[var(--muted)]">
              Select a module to add or edit its sections.
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form role="dialog" aria-modal="true" aria-labelledby="module-editor-heading" onSubmit={(event) => { event.preventDefault(); handleSaveLesson(); }} className="flex max-h-[90vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-2xl border border-[var(--line-strong)] bg-[var(--background)] p-6 shadow-2xl">
            <div>
              <h2 id="module-editor-heading" className="text-xl font-semibold">{editing.id ? "Edit module" : "New module"}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Choose a phase, set its order, and publish when it is ready.</p>
            </div>
            <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
              Module title
              <input required maxLength={240} value={editing.title || ""} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
              Short description
              <textarea rows={3} maxLength={5000} value={editing.description || ""} onChange={(event) => setEditing({ ...editing, description: event.target.value })} className="rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-3 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
                Curriculum phase
                <select value={editing.phase || "foundations"} onChange={(event) => setEditing({ ...editing, phase: event.target.value as Lesson["phase"] })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]">
                  {CURRICULUM_PHASES.map((phase) => <option key={phase.id} value={phase.id}>{phase.label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
                Display order
                <input type="number" min={0} max={100000} value={editing.orderIndex ?? lessons.length} onChange={(event) => setEditing({ ...editing, orderIndex: Number(event.target.value) })} className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--glass)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <input type="checkbox" checked={Boolean(editing.isPublished)} onChange={(event) => setEditing({ ...editing, isPublished: event.target.checked })} className="size-4 accent-[var(--accent)]" />
              Published and available without sign-in
            </label>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={isPending} className="min-h-11 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--accent-2)] disabled:opacity-50">{isPending ? "Saving…" : "Save module"}</button>
              <button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-full border border-[var(--line-strong)] px-5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
