"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const TOOLS = [
  { href: "/dashboard/Image",     icon: "🖼️", label: "Image" },
  { href: "/dashboard/video",     icon: "🎬", label: "Video" },
  { href: "/dashboard/thumbnail", icon: "🎨", label: "Thumbnail" },
  { href: "/dashboard/Script",    icon: "📝", label: "Script" },
  { href: "/dashboard/tts",       icon: "🔊", label: "Speech" },
  { href: "#", icon: "⬆️", label: "Upscale", badge: "Soon" },
  { href: "#", icon: "✏️", label: "Draw",    badge: "Soon" },
];

const CATEGORIES = ["All", "Photography", "Animals", "Anime", "Architecture", "Character", "Food", "Sci-Fi"];

type Generation = {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
};

export default function DashboardHome() {
  const router   = useRouter();
  const supabase = createClient();

  const [prompt, setPrompt]           = useState("");
  const [activeTab, setActiveTab]     = useState<"image" | "video">("image");
  const [bannerBg, setBannerBg]       = useState<string | null>(null);
  const [category, setCategory]       = useState("All");
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/sign-in"); return; }

      // Banner
      const { data: banner } = await supabase
        .from("app_settings").select("value").eq("key", "dashboard_banner").single();
      if (banner?.value) setBannerBg(banner.value);

      // Community generations — public images
      const { data: gens } = await supabase
        .from("generations")
        .select("id, image_url, prompt, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(12);

      setGenerations(gens ?? []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleGenerate() {
    if (!prompt.trim()) return;
    const route = activeTab === "image" ? "/dashboard/Image" : "/dashboard/video";
    router.push(`${route}?prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-white">

      {/* ── HERO BANNER ── */}
      <div className="relative w-full" style={{ height: "56vw", maxHeight: 420, minHeight: 220 }}>
        {bannerBg ? (
          <img src={bannerBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#2a1000] to-[#0d0d0d]">
            <div className="absolute inset-0 opacity-60" style={{
              background: "radial-gradient(ellipse at 60% 40%, rgba(180,80,20,0.5) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(100,40,10,0.4) 0%, transparent 50%)"
            }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white font-black text-center select-none"
            style={{ fontSize: "clamp(2.2rem, 8vw, 6rem)", letterSpacing: "-0.02em", textShadow: "0 2px 40px rgba(0,0,0,0.8)", fontFamily: "'Arial Black', 'Impact', sans-serif" }}>
            YOURS TO CREATE
          </h1>
        </div>

        {/* Prompt Bar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 md:px-8 md:pb-6">
          <div className="max-w-3xl mx-auto bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <button className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0 hover:bg-white/15 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              <input
                type="text" value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Type a prompt..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
              />
              <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)" stroke="none">
                  <path d="M12 2l2.4 7.6H22l-6.4 4.6 2.4 7.6L12 17.2l-6 4.6 2.4-7.6L2 9.6h7.6z"/>
                </svg>
              </button>
              <button onClick={handleGenerate} disabled={!prompt.trim()}
                className="text-white/40 disabled:opacity-30 text-sm font-medium px-3 py-1.5 rounded-xl hover:text-white transition-all">
                Generate
              </button>
            </div>
            <div className="flex items-center gap-5 px-4 pb-3.5 pt-0.5 border-t border-white/5 overflow-x-auto">
              {([{ icon: "🖼️", label: "Image", tab: "image" as const }, { icon: "🎬", label: "Video", tab: "video" as const }]).map((t) => (
                <button key={t.tab} onClick={() => setActiveTab(t.tab)}
                  className={`flex items-center gap-1.5 text-xs font-medium py-1 border-b-2 transition-all whitespace-nowrap ${activeTab === t.tab ? "border-violet-500 text-white" : "border-transparent text-white/35 hover:text-white/60"}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TOOL ICONS ── */}
      <div className="px-4 md:px-8 pt-6 pb-4">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 md:gap-8 flex-wrap">
          {TOOLS.map((tool) => (
            <a key={tool.label} href={tool.badge ? "#" : tool.href}
              className="flex flex-col items-center gap-2 group relative">
              {tool.badge && (
                <span className="absolute -top-1.5 -right-3 bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none z-10">
                  {tool.badge}
                </span>
              )}
              <div className={`w-14 h-14 rounded-full border flex items-center justify-center text-2xl transition-all ${tool.badge ? "bg-white/3 border-white/8 opacity-40" : "bg-[#1a1a1a] border-white/12 hover:border-violet-500/50 hover:bg-violet-500/10 group-hover:scale-105"}`}>
                {tool.icon}
              </div>
              <span className={`text-xs font-medium transition-colors ${tool.badge ? "text-white/25" : "text-white/45 group-hover:text-white/80"}`}>
                {tool.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 mx-4 md:mx-8 my-2" />

      {/* ── COMMUNITY CREATIONS ── */}
      <div className="px-4 md:px-8 pt-4 pb-10">
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <h2 className="text-lg font-bold text-white">Community Creations</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-violet-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
              🔥 Trending ▾
            </button>
            <button className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 text-white/60 text-xs font-semibold px-3 py-1.5 rounded-lg">
              ⊞ All
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`whitespace-nowrap text-xs font-medium px-3.5 py-2 rounded-full border transition-all flex-shrink-0 ${category === cat ? "bg-violet-600/80 border-violet-500/50 text-white" : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="columns-2 md:columns-3 gap-2 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="break-inside-avoid rounded-xl bg-white/5 animate-pulse"
                style={{ height: i % 3 === 0 ? 240 : i % 3 === 1 ? 200 : 180 }} />
            ))}
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🖼️</p>
            <p className="text-white/30 text-sm">Koi image abhi tak generate nahi ki</p>
            <p className="text-white/15 text-xs mt-1">Pehli image generate karo — yahan dikhegi!</p>
            <a href="/dashboard/Image"
              className="inline-block mt-4 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
              Generate Karo →
            </a>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-2 space-y-2">
            {generations.map((gen, i) => (
              <div key={gen.id}
                className="break-inside-avoid rounded-xl overflow-hidden relative group cursor-pointer"
                style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/3" }}>
                <img
                  src={gen.image_url}
                  alt={gen.prompt}
                  className="w-full h-full object-cover min-h-[140px]"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-end">
                  <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 w-full">
                    <p className="text-white text-xs font-medium line-clamp-2">{gen.prompt}</p>
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(gen.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

