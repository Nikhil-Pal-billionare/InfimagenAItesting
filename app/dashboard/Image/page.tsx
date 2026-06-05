"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ImageTool() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt]       = useState(searchParams.get("prompt") ?? "");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<{ imageBase64: string; mimeType: string } | null>(null);
  const [error, setError]         = useState("");
  const [history, setHistory]     = useState<{ src: string; prompt: string }[]>([]);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      /* 🔥 ORIGINAL API CALL — PRESERVED */
      const res  = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Generation failed"); return; }

      setResult(data);
      setHistory((prev) => [{ src: `data:${data.mimeType};base64,${data.imageBase64}`, prompt }, ...prev.slice(0, 5)]);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTIONS = [
    "A neon-lit cyberpunk street at night",
    "Majestic snow leopard on mountain peak",
    "Abstract fluid art in gold and black",
    "Portrait in Renaissance painting style",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🖼️</span>
          <h1 className="text-2xl font-black text-white">Image Generation</h1>
        </div>
        <p className="text-sm text-white/30 ml-11">Create stunning images from text prompts using Imagen 4</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left — Input */}
        <div className="space-y-4">
          {/* Prompt */}
          <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <label className="text-xs font-semibold text-white/30 uppercase tracking-wider">Prompt</label>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.metaKey && generate()}
              placeholder="Describe the image you want to create..."
              rows={4}
              className="w-full bg-transparent px-4 pb-4 text-sm text-white placeholder-white/20 outline-none resize-none leading-relaxed"
            />
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/20">{prompt.length} chars · ⌘↵ to generate</span>
              <button
                onClick={() => setPrompt("")}
                className="text-xs text-white/20 hover:text-white/50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-xs text-white/25 mb-2 uppercase tracking-wider">Try these prompts</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/8 text-white/50 hover:text-white/80 px-3 py-1.5 rounded-lg transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all text-base shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              "✦ Generate Image"
            )}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right — Result */}
        <div className="space-y-4">
          <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden aspect-square flex items-center justify-center relative">
            {loading ? (
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-white/30">Creating your image…</p>
                <p className="text-xs text-white/15">This usually takes 10–20 seconds</p>
              </div>
            ) : result ? (
              <>
                <img
                  src={`data:${result.mimeType};base64,${result.imageBase64}`}
                  alt={prompt}
                  className="w-full h-full object-cover"
                />
                {/* Download overlay */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <a
                    href={`data:${result.mimeType};base64,${result.imageBase64}`}
                    download="infimagen.png"
                    className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-xl"
                  >
                    ↓ Download
                  </a>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center text-3xl">
                  🖼️
                </div>
                <p className="text-sm text-white/20">Your image will appear here</p>
                <p className="text-xs text-white/10">Type a prompt and click Generate</p>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <p className="text-xs text-white/25 uppercase tracking-wider mb-2">Recent</p>
              <div className="grid grid-cols-3 gap-2">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setResult({ imageBase64: h.src.split(",")[1], mimeType: "image/png" });
                      setPrompt(h.prompt);
                    }}
                    className="aspect-square rounded-xl overflow-hidden border border-white/8 hover:border-white/20 transition-colors"
                  >
                    <img src={h.src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ImagePage() {
  return (
    <Suspense>
      <ImageTool />
    </Suspense>
  );
}
