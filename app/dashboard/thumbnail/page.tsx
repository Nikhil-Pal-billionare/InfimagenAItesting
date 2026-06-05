"use client";

import { useState } from "react";

export default function ThumbnailPage() {
  const [prompt, setPrompt]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ imageBase64: string; mimeType: string } | null>(null);
  const [error, setError]     = useState("");

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      /* 🔥 ORIGINAL API CALL — PRESERVED */
      const res  = await fetch("/api/ai/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Generation failed"); return; }
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTIONS = [
    "10 Life-changing habits for 2025, bold text, dark cinematic background",
    "YouTube gaming thumbnail with shocked face, bright colors",
    "Minimal tech tutorial cover with code on screen",
    "Travel vlog cover — Bali sunset with silhouette",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🎨</span>
          <h1 className="text-2xl font-black text-white">Thumbnail Creator</h1>
        </div>
        <p className="text-sm text-white/30 ml-11">Generate YouTube-ready thumbnails in 16:9</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <label className="text-xs font-semibold text-white/30 uppercase tracking-wider">Describe your thumbnail</label>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.metaKey && generate()}
              placeholder="Describe the thumbnail — include text, colors, mood, subject..."
              rows={5}
              className="w-full bg-transparent px-4 pb-4 text-sm text-white placeholder-white/20 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Tips */}
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5">
            <p className="text-xs text-amber-400/80 font-semibold mb-1.5">💡 Tips for better thumbnails</p>
            <ul className="space-y-1">
              {["Mention bold text for titles", "Specify the emotion (shocked, happy, curious)", "Include colors or style (dark, neon, minimal)", "Add 'YouTube thumbnail' at the end"].map((t) => (
                <li key={t} className="text-xs text-white/30 flex items-start gap-1.5">
                  <span className="text-white/20 mt-0.5">·</span>{t}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-xs text-white/25 uppercase tracking-wider">Examples</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                className="w-full text-left text-xs bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/10 text-white/40 hover:text-white/70 px-3 py-2.5 rounded-xl transition-all leading-relaxed"
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : "✦ Generate Thumbnail"}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right — Preview (16:9) */}
        <div className="space-y-3">
          <p className="text-xs text-white/25 uppercase tracking-wider">Preview (16:9)</p>
          <div className="relative w-full aspect-video bg-[#111] border border-white/8 rounded-2xl overflow-hidden flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                <p className="text-xs text-white/30">Creating your thumbnail…</p>
              </div>
            ) : result ? (
              <>
                <img
                  src={`data:${result.mimeType};base64,${result.imageBase64}`}
                  alt={prompt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <a
                    href={`data:${result.mimeType};base64,${result.imageBase64}`}
                    download="thumbnail.png"
                    className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-xl"
                  >
                    ↓ Download PNG
                  </a>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-20">🎨</div>
                <p className="text-xs text-white/15">16:9 thumbnail preview</p>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-[#111] border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 font-medium">Thumbnail ready!</p>
                <p className="text-xs text-white/20">1280×720 · PNG</p>
              </div>
              <a
                href={`data:${result.mimeType};base64,${result.imageBase64}`}
                download="thumbnail.png"
                className="text-xs bg-violet-600/80 hover:bg-violet-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                ↓ Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
