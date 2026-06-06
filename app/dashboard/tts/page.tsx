"use client";

import { useState, useRef } from "react";

const VOICES = [
  { id: "alloy",   label: "Alloy",   desc: "Balanced, neutral",    gender: "Neutral" },
  { id: "echo",    label: "Echo",    desc: "Soft, warm",            gender: "Male" },
  { id: "fable",   label: "Fable",   desc: "Expressive, dynamic",   gender: "Male" },
  { id: "onyx",    label: "Onyx",    desc: "Deep, authoritative",   gender: "Male" },
  { id: "nova",    label: "Nova",    desc: "Friendly, upbeat",      gender: "Female" },
  { id: "shimmer", label: "Shimmer", desc: "Soft, soothing",        gender: "Female" },
];

export default function TTSPage() {
  const audioRef   = useRef<HTMLAudioElement>(null);
  const [text, setText]         = useState("");
  const [voice, setVoice]       = useState("alloy");
  const [loading, setLoading]   = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError]       = useState("");
  const [playing, setPlaying]   = useState(false);

  async function generate() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setAudioUrl(null);

    try {
      /* 🔥 API CALL — calls /api/voiceover-generator route */
      const res  = await fetch("/api/voiceover-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "TTS generation failed");
        return;
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      setAudioUrl(url);
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const SAMPLES = [
    "Welcome to InfiMagen, the AI-powered creative platform built for creators like you.",
    "In this video, I'm going to show you the top 10 productivity hacks that changed my life.",
    "Are you tired of spending hours creating content? Let me show you a better way.",
  ];

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const estSeconds = Math.ceil(wordCount / 2.5);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🔊</span>
          <h1 className="text-2xl font-black text-white">Text to Speech</h1>
        </div>
        <p className="text-sm text-white/30 ml-11">Convert your scripts to natural-sounding voiceovers</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Left — Text input */}
        <div className="space-y-4">
          <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <label className="text-xs font-semibold text-white/30 uppercase tracking-wider">Your Script</label>
              {text && (
                <span className="text-xs text-white/20">
                  {wordCount} words · ~{estSeconds}s audio
                </span>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your script or type text to convert to speech..."
              rows={10}
              className="w-full bg-transparent px-4 pb-4 text-sm text-white placeholder-white/20 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Sample texts */}
          <div>
            <p className="text-xs text-white/25 uppercase tracking-wider mb-2">Sample texts</p>
            <div className="space-y-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.slice(0, 20)}
                  onClick={() => setText(s)}
                  className="w-full text-left text-xs bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/10 text-white/35 hover:text-white/60 px-3 py-2.5 rounded-xl transition-all leading-relaxed"
                >
                  "{s.slice(0, 80)}…"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !text.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating audio…
              </>
            ) : "✦ Generate Voiceover"}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right — Voice picker + Player */}
        <div className="space-y-4">
          {/* Voice selection */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-semibold text-white/30 uppercase tracking-wider">Voice</label>
            <div className="space-y-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoice(v.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                    voice === v.id
                      ? "bg-violet-600/20 border-violet-500/40"
                      : "bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/10"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${voice === v.id ? "text-violet-300" : "text-white/60"}`}>
                      {v.label}
                    </p>
                    <p className="text-xs text-white/25">{v.desc}</p>
                  </div>
                  <span className="text-xs text-white/20 bg-white/5 px-2 py-0.5 rounded-full">
                    {v.gender}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio player */}
          {audioUrl && (
            <div className="bg-[#111] border border-white/8 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Generated Audio</p>
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
              <a
                href={audioUrl}
                download="voiceover.mp3"
                className="block w-full text-center text-xs bg-white/8 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white px-4 py-2.5 rounded-xl transition-all"
              >
                ↓ Download MP3
              </a>
            </div>
          )}

          {/* Info */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 space-y-2">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">How it works</p>
            {["Paste your script", "Choose a voice", "Click generate", "Download MP3"].map((step, i) => (
              <div key={step} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 text-xs flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs text-white/35">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
