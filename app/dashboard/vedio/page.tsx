"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Clip = {
  id: number;
  url: string;
  image: { picture: string }[];
  duration: number;
  video_files: { link: string; quality: string; width: number }[];
};

function VideoTool() {
  const searchParams = useSearchParams();
  const [desc, setDesc]         = useState(searchParams.get("prompt") ?? "");
  const [loading, setLoading]   = useState(false);
  const [clips, setClips]       = useState<Clip[]>([]);
  const [scenes, setScenes]     = useState<string[]>([]);
  const [error, setError]       = useState("");

  async function generate() {
    if (!desc.trim() || loading) return;
    setLoading(true);
    setError("");
    setClips([]);
    setScenes([]);

    try {
      /* 🔥 ORIGINAL API CALL — PRESERVED */
      const res  = await fetch("/api/broll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Generation failed"); return; }
      setClips(data.clips ?? []);
      setScenes(data.scenes ?? []);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const EXAMPLES = [
    "A documentary about ocean conservation",
    "Corporate team collaboration video",
    "Tech product launch highlight reel",
    "Travel vlog through Southeast Asia",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🎬</span>
          <h1 className="text-2xl font-black text-white">B-Roll Video</h1>
        </div>
        <p className="text-sm text-white/30 ml-11">AI-matched video clips from Pexels for your content</p>
      </div>

      {/* Input card */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-5 mb-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">
            Describe your video
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe the type of video or scene you need footage for..."
            rows={3}
            className="w-full bg-white/5 border border-white/8 focus:border-violet-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none transition-colors leading-relaxed"
          />
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              onClick={() => setDesc(e)}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/8 text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg transition-all"
            >
              {e}
            </button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={loading || !desc.trim()}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Finding footage…
            </>
          ) : "✦ Generate B-Roll"}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Scenes used */}
      {scenes.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-white/25 uppercase tracking-wider mb-2">Search queries used</p>
          <div className="flex flex-wrap gap-2">
            {scenes.map((s, i) => (
              <span key={i} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results grid */}
      {loading && (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video bg-[#111] border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {clips.length > 0 && (
        <div>
          <p className="text-xs text-white/25 uppercase tracking-wider mb-3">Found {clips.length} clips</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clips.map((clip) => {
              const hd = clip.video_files?.find((f) => f.quality === "hd") ?? clip.video_files?.[0];
              return (
                <div key={clip.id} className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden group">
                  <div className="relative aspect-video">
                    {hd?.link ? (
                      <video
                        src={hd.link}
                        poster={clip.image?.[0]?.picture}
                        controls
                        className="w-full h-full object-cover"
                        preload="none"
                      />
                    ) : (
                      <img
                        src={clip.image?.[0]?.picture}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-xs text-white/30">{clip.duration}s · {hd?.width}p</span>
                    {hd?.link && (
                      <a
                        href={hd.link}
                        download={`clip-${clip.id}.mp4`}
                        className="text-xs bg-white/8 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-all"
                      >
                        ↓ Download
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VideoPage() {
  return (
    <Suspense>
      <VideoTool />
    </Suspense>
  );
}
