"use client";

import { useEffect, useRef, useState } from "react";

export type CaptionTrack = {
  readonly default?: boolean;
  readonly label: string;
  readonly src: string;
  readonly srcLang: string;
};

type CassettePlayerProps = {
  audioSrc: string;
  trackTitle: string;
  captionTracks?: readonly CaptionTrack[];
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CassettePlayer({ audioSrc, trackTitle, captionTracks = [] }: CassettePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(captionTracks.some((t) => t.default));
  const [cue, setCue] = useState("");
  const [failed, setFailed] = useState(false);

  // Metadata can load before React attaches listeners, so read it once on mount.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) setDuration(audio.duration);
    if (audio?.error) setFailed(true);
  }, []);

  // Show the active caption line inside the cassette instead of the browser's overlay.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || captionTracks.length === 0) return;
    const track = audio.textTracks[0];
    if (!track) return;
    track.mode = captionsOn ? "hidden" : "disabled";
    const onCue = () => {
      const active = track.activeCues?.[0] as VTTCue | undefined;
      setCue(active?.text ?? "");
    };
    track.addEventListener("cuechange", onCue);
    return () => track.removeEventListener("cuechange", onCue);
  }, [captionsOn, captionTracks.length]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setFailed(true));
    else audio.pause();
  }

  function skip(delta: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), duration || audio.duration || 0);
  }

  const progress = duration ? current / duration : 0;
  // Tape moves from the left reel to the right reel as it plays.
  const leftTape = 34 - progress * 16;
  const rightTape = 18 + progress * 16;

  return (
    <div className={`cassette${playing ? " is-playing" : ""}`}>
      <div className="cassette-body">
        <div className="cassette-screw tl" /><div className="cassette-screw tr" />
        <div className="cassette-screw bl" /><div className="cassette-screw br" />
        <div className="cassette-label">
          <span className="cassette-side">A</span>
          <p className="cassette-title" title={trackTitle}>{trackTitle}</p>
          <span className="cassette-time">{formatTime(current)} / {formatTime(duration)}</span>
        </div>
        <div className="cassette-window">
          <div className="cassette-reel left">
            <div className="cassette-tape" style={{ width: `${leftTape * 2}px`, height: `${leftTape * 2}px` }} />
            <div className="cassette-hub"><i /><i /><i /></div>
          </div>
          <div className="cassette-reel right">
            <div className="cassette-tape" style={{ width: `${rightTape * 2}px`, height: `${rightTape * 2}px` }} />
            <div className="cassette-hub"><i /><i /><i /></div>
          </div>
        </div>
        <div className="cassette-bottom" />
      </div>

      {captionsOn && captionTracks.length > 0 && (
        <p className="cassette-caption" aria-live="polite">{cue || "\u00a0"}</p>
      )}

      <div className="cassette-deck">
        <button type="button" className="cassette-key" onClick={() => skip(-10)} aria-label="Rewind 10 seconds">⏪</button>
        <button type="button" className="cassette-key primary" onClick={toggle} aria-label={playing ? "Pause" : "Play"} aria-pressed={playing}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button type="button" className="cassette-key" onClick={() => skip(10)} aria-label="Forward 10 seconds">⏩</button>
        <input
          type="range"
          className="cassette-seek"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
          aria-label={`Seek ${trackTitle}`}
          style={{ ["--p" as string]: `${progress * 100}%` }}
        />
        {captionTracks.length > 0 && (
          <button type="button" className={`cassette-key cc${captionsOn ? " on" : ""}`} onClick={() => { const enabled = !captionsOn; setCaptionsOn(enabled); if (!enabled) setCue(""); }} aria-pressed={captionsOn} aria-label="Toggle captions">CC</button>
        )}
      </div>

      {failed && <p className="cassette-error">This audio couldn&apos;t be played. Try again later.</p>}

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        crossOrigin={captionTracks.length > 0 ? "anonymous" : undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setFailed(true)}
      >
        {captionTracks.map((t) => (
          <track key={t.src} kind="captions" src={t.src} srcLang={t.srcLang} label={t.label} default={t.default} />
        ))}
      </audio>
    </div>
  );
}

export default CassettePlayer;
