"use client";

import { useState, useRef } from "react";

const PROVIDERS = [
  {
    id: "google",
    label: "Google TTS",
    icon: "🔵",
    desc: "Fast & reliable",
    voices: [
      { id: "alloy",   label: "David",   desc: "Clear, professional", gender: "Male" },
      { id: "echo",    label: "James",   desc: "Warm, friendly",      gender: "Male" },
      { id: "fable",   label: "Robert",  desc: "Deep, authoritative", gender: "Male" },
      { id: "onyx",    label: "Michael", desc: "Strong, confident",   gender: "Male" },
      { id: "nova",    label: "Emma",    desc: "Bright, upbeat",      gender: "Female" },
      { id: "shimmer", label: "Sophia",  desc: "Soft, soothing",      gender: "Female" },
    ],
  },
  {
    id: "elevenlabs",
    label: "ElevenLabs",
    icon: "⚡",
    desc: "Ultra realistic",
    voices: [
      { id: "alloy",   label: "Rachel",  desc: "Calm, professional",  gender: "Female" },
      { id: "echo",    label: "Domi",    desc: "Strong, confident",   gender: "Female" },
      { id: "fable",   label: "Bella",   desc: "Soft, warm",          gender: "Female" },
      { id: "onyx",    label: "Antoni",  desc: "Well-rounded",        gender: "Male" },
      { id: "nova",    label: "Elli",    desc: "Emotional, clear",    gender: "Female" },
      { id: "shimmer", label: "Dorothy", desc: "Pleasant, natural",   gender: "Female" },
    ],
  },
];

export default function TTSPage() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [text, setText]         = useState("");
  const [provider, setProvider] = useState("google");
  const [voice, setVoice]       = useState("alloy");
  const [loading, setLoading]   = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError]       = useState("");

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;
  const wordCount  = text.trim().split(/\s+/).filter(Boolean).length;
  const estSeconds = Math.ceil(wordCount / 2.5);

  async function generate() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setAudioUrl(null);
    try {
      const res = await fetch("/api/voiceover-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, provider }),
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

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🔊</span>
          <h1 className="text-2xl font-black text-white">Text to Speech</h1>
        </div>
        <p className="text-sm text-white/30 ml-11">Convert scripts to natural-sounding voiceovers</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">

        {/* Left */}
        <div className="space-y-4">

          {/* Provider selection */}
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">AI Engine</p>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button key={p.id} onClick={() => { setProvider(p.id); setVoice("alloy"); }}
                  className={`p-3 rounded-xl border text-left transition-all ${provider === p.id ? "bg-violet-600/20 border-violet-500/40" : "bg-white/3 border-white/8 hover:bg-white/5"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{p.icon}</span>
                    <span className={`text-sm font-bold ${provider === p.id ? "text-violet-300" : "text-white/60"}`}>{p.label}</span>
                  </div>
                  <p className="text-xs text-white/25">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <label className="text-xs font-semibold text-white/30 uppercase tracking-wider">Your Script</label>
              {text && <span className="text-xs text-white/20">{wordCount} words · ~{estSeconds}s</span>}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Paste your script or type text to convert to speech..."
              rows={8}
              className="w-full bg-transparent px-4 pb-4 text-sm text-white placeholder-white/20 outline-none resize-none leading-relaxed" />
          </div>

          <button onClick={generate} disabled={loading || !text.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating audio…</>
            ) : "✦ Generate Voiceover"}
          </button>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}
        </div>

        {/* Right */}
        <div className="space-y-4">

          {/* Voice selection */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-semibold text-white/30 uppercase tracking-wider">
              Voice — {currentProvider.label}
            </label>
            <div className="space-y-2">
              {currentProvider.voices.map((v) => (
                <button key={v.id} onClick={() => setVoice(v.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${voice === v.id ? "bg-violet-600/20 border-violet-500/40" : "bg-white/3 border-white/5 hover:bg-white/8"}`}>
                  <div>
                    <p className={`text-sm font-medium ${voice === v.id ? "text-violet-300" : "text-white/60"}`}>{v.label}</p>
                    <p className="text-xs text-white/25">{v.desc}</p>
                  </div>
                  <span className="text-xs text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{v.gender}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio player */}
          {audioUrl && (
            <div className="bg-[#111] border border-white/8 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Generated Audio</p>
              <audio ref={audioRef} src={audioUrl} controls className="w-full"  />
              <a href={audioUrl} download="voiceover.mp3"
                className="block w-full text-center text-xs bg-white/8 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white px-4 py-2.5 rounded-xl transition-all">
                ↓ Download MP3
              </a>
            </div>
          )}

          {/* Credits info */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 space-y-1.5">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Credits</p>
            <p className="text-xs text-white/30">16 credits per minute of audio</p>
            {wordCount > 0 && (
              <p className="text-xs text-violet-400 font-semibold">
                ~{Math.ceil(wordCount / 150) * 16} credits for this text
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
