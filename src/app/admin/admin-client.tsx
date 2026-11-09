"use client";

import { useState, useEffect, useTransition } from "react";
import type { Track, Lesson } from "@/lib/types";
import { getTracks, getLessons, createTrack, createLesson, updateLesson, deleteLesson as deleteLessonAction } from "./actions";

export default function AdminDashboard() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Lesson> | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => { loadTracks(); }, []);
  useEffect(() => { if (selectedTrack) loadLessonsData(selectedTrack); }, [selectedTrack]);

  async function loadTracks() {
    const data = await getTracks();
    setTracks(data);
    if (data.length > 0 && !selectedTrack) setSelectedTrack(data[0].id);
  }

  async function loadLessonsData(trackId: string) {
    const data = await getLessons(trackId);
    setLessons(data);
  }

  async function handleSaveLesson() {
    if (!editing || !selectedTrack) return;
    startTransition(async () => {
      if (editing.id) {
        const { id, ...rest } = editing;
        await updateLesson(id, rest);
      } else {
        await createLesson({ trackId: selectedTrack, title: editing.title || "Untitled", description: editing.description || undefined, orderIndex: editing.orderIndex ?? lessons.length, isPublished: editing.isPublished ?? false });
      }
      setEditing(null);
      loadLessonsData(selectedTrack);
    });
  }

  async function handleDeleteLesson(id: string) {
    if (!confirm("Delete this lesson?")) return;
    startTransition(async () => {
      await deleteLessonAction(id);
      if (selectedTrack) loadLessonsData(selectedTrack);
    });
  }

  async function handleAddTrack() {
    const title = prompt("Track title:");
    if (!title) return;
    const type = prompt("Type (internal or affiliate):", "internal");
    startTransition(async () => {
      await createTrack(title, type || "internal");
      loadTracks();
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Presentation Engine</h1>
          <p className="text-[#9aa6c4] text-sm mt-1">Manage tracks, lessons, and resources</p>
        </div>
        <button onClick={handleAddTrack} disabled={isPending} className="px-5 py-2.5 rounded-full bg-[rgba(93,240,168,.1)] border border-[rgba(93,240,168,.2)] text-[#5df0a8] text-sm font-semibold hover:bg-[rgba(93,240,168,.2)] transition">
          + New Track
        </button>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              selectedTrack === t.id
                ? "bg-[#5df0a8] text-[#032018]"
                : "bg-[rgba(16,24,48,.65)] text-[#9aa6c4] hover:bg-[rgba(150,175,230,.22)]"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-8">
        {lessons.map((l) => (
          <div key={l.id} className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(12,18,38,.55)] border border-[rgba(150,175,230,.12)]">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{l.title}</h3>
                {!l.isPublished && <span className="text-xs text-yellow-400 bg-[rgba(255,210,122,.1)] px-2 py-0.5 rounded">Draft</span>}
              </div>
              <div className="flex gap-3 mt-1 text-xs text-[#6b7796]">
                {l.description && <span className="text-xs text-[#6b7796] truncate">{l.description}</span>}
              </div>
            </div>
            <button onClick={() => setEditing(l)} className="text-sm text-[#9aa6c4] hover:text-white transition">Edit</button>
            <button onClick={() => handleDeleteLesson(l.id)} className="text-sm text-red-400 hover:text-red-300 transition">Delete</button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setEditing({ title: "", description: "", orderIndex: lessons.length, isPublished: false })}
        className="px-5 py-2.5 rounded-full bg-[rgba(16,24,48,.65)] text-[#9aa6c4] text-sm font-semibold hover:bg-[rgba(150,175,230,.22)] transition"
      >
        + Add Lesson
      </button>

      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#060a18] border border-[rgba(150,175,230,.22)] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5">{editing.id ? "Edit Lesson" : "New Lesson"}</h2>
            <div className="space-y-4">
              <input placeholder="Lesson title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[rgba(16,24,48,.65)] border border-[rgba(150,175,230,.22)] text-sm focus:border-[#5df0a8] focus:outline-none transition" />
              <textarea placeholder="Description" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl bg-[rgba(16,24,48,.65)] border border-[rgba(150,175,230,.22)] text-sm focus:border-[#5df0a8] focus:outline-none transition resize-none" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isPublished || false} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} className="accent-[#5df0a8]" />
                Published
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveLesson} disabled={isPending} className="flex-1 px-5 py-3 rounded-xl bg-[#5df0a8] text-[#032018] font-bold text-sm hover:bg-[#2fd38a] transition disabled:opacity-50">
                {isPending ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditing(null)} className="px-5 py-3 rounded-xl bg-[rgba(16,24,48,.65)] text-[#9aa6c4] text-sm hover:bg-[rgba(150,175,230,.22)] transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
