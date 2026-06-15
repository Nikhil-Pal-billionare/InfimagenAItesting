"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";

const MOTION_PRESETS = [
  { id: "auto",   label: "Auto",    icon: "✨", desc: "AI decides" },
  { id: "subtle", label: "Subtle",  icon: "🌊", desc: "Gentle motion" },
  { id: "strong", label: "Dynamic", icon: "⚡", desc: "Dramatic motion" },
];

const DURATION_OPTIONS = [3, 5, 8];

type VideoTemplate = {
  id: string;
  title: string;
  image_url: string;
  prompt: string;
  is_free: boolean;
  category: string;
};

export default function VideoPage() {
  const supabase = createClient();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [mode, setMode]               = useState<"text" | "image" | "animation">("text");
  const [prompt, setPrompt]           = useState("");
  const [animDesc, setAnimDesc]       = useState("");
  const [imageUrl, setImageUrl]       = useState<string | null>(null);
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [motionPreset, setMotionPreset] = useState("auto");
  const [duration, setDuration]       = useState(5);
  const [loading, setLoading]         = useState(false);
  const [progress, setProgress]       = useState(0);
  const [result, setResult]           = useState<string | null>(null);
  const [error, setError]             = useState("");

  // Templates
  const [templates, setTemplates]     = useState<VideoTemplate[]>([]);
  const [isPaid, setIsPaid]           = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [showProPopup, setShowProPopup]         = useState(false);
  const [showPromptModal, setShowPromptModal]   = useState(false);
  const [copied, setCopied]           = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sub } = await supabase
        .from("subscriptions").select("id")
        .eq("user_id", user.id).eq("status", "active").maybeSingle();
      setIsPaid(!!sub);

      const { data: tmpl } = await supabase
        .from("video_templates")
        .select("id, title, image_url, prompt, is_free, category")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      setTemplates(tmpl ?? []);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTemplateClick(t: VideoTemplate) {
    if (!t.is_free && !isPaid) { setShowProPopup(true); return; }
    setSelectedTemplate(t);
    setShowPromptModal(true);
  }

  function useThisPrompt() {
    if (!selectedTemplate) return;
    setPrompt(selectedTemplate.prompt);
    setMode("text");
    setShowPromptModal(false);
  }

  function copyPrompt() {
    if (!selectedTemplate) return;
    navigator.clipboard.writeText(selectedTemplate.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function generate() {
    if (loading) return;
    if (mode === "text" && !prompt.trim()) { setError("Prompt required"); return; }
    if (mode === "image" && !imageFile && !imageUrl) { setError("Image required"); return; }
    if (mode === "animation" && !animDesc.trim()) { setError("Animation description required"); return; }

    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 6, 85));
    }, 2000);

    try {
      let finalPrompt = prompt;
      let finalImageUrl = imageUrl;
      let finalMode = mode as string;

      // Animation mode — Gemini se prompt generate karo
      if (mode === "animation") {
        const gemRes = await fetch("/api/prompt/enhance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Convert this animation description into a detailed video generation prompt for Wan2.1 AI model. Make it cinematic and detailed. Animation description: "${animDesc}". Return ONLY the video prompt, nothing else.`
          }),
        });
        const gemData = await gemRes.json();
        finalPrompt = gemData.enhanced ?? animDesc;
        finalMode = "text";
      }

      // Image upload if needed
      if (mode === "image" && imageFile) {
        setProgress(10);
        const form = new FormData();
        form.append("image", imageFile);
        const upRes = await fetch("/api/media/upload", {
          method: "POST", body: form,
        });
        const upData = await upRes.json();
        finalImageUrl = upData.url;
      }

      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: finalMode,
          prompt: finalPrompt,
          imageUrl: finalImageUrl,
          motionPreset,
          duration,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Generation failed"); return; }

      clearInterval(interval);
      setProgress(100);
      setResult(data.videoUrl);

    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🎬</span>
          <h1 className="text-2xl font-black text-white">AI Video Generator</h1>
        </div>
        <p className="text-sm text-white/30 ml-11">Wan 2.1 — Text · Image · Animation</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mb-12">

        {/* Left */}
        <div className="space-y-4">

          {/* Mode tabs */}
          <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
            {([
              { id: "text",      label: "Text to Video",  icon: "📝" },
              { id: "image",     label: "Image to Video", icon: "🖼️" },
              { id: "animation", label: "Animation",      icon: "✨" },
            ] as const).map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${mode === m.id ? "bg-violet-600 text-white shadow-lg" : "text-white/40 hover:text-white/70"}`}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Text mode */}
          {mode === "text" && (
            <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <label className="text-xs font-semibold text-white/30 uppercase tracking-wider">Describe your video</label>
              </div>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cinematic shot of mountains at golden hour, slow camera pan..."
                rows={4}
                className="w-full bg-transparent px-4 pb-4 text-sm text-white placeholder-white/20 outline-none resize-none leading-relaxed" />
            </div>
          )}

          {/* Image mode */}
          {mode === "image" && (
            <div className="space-y-3">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/8">
                  <img src={imagePreview} alt="Input" className="w-full h-48 object-cover" />
                  <button onClick={() => { setImagePreview(null); setImageFile(null); setImageUrl(null); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white/60 hover:text-white">×</button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-violet-500/50 transition-all">
                  <div className="text-3xl mb-3">🖼️</div>
                  <p className="text-sm text-white/50 font-medium">Click to upload image</p>
                  <p className="text-xs text-white/20 mt-1">JPG, PNG, WEBP</p>
                </button>
              )}
              <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <label className="text-xs font-semibold text-white/30 uppercase tracking-wider">Motion description (optional)</label>
                </div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Camera slowly zooms in, gentle wind effect..."
                  rows={3}
                  className="w-full bg-transparent px-4 pb-4 text-sm text-white placeholder-white/20 outline-none resize-none" />
              </div>
            </div>
          )}

          {/* Animation mode */}
          {mode === "animation" && (
            <div className="space-y-3">
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3.5">
                <p className="text-xs text-violet-400 font-semibold mb-1">✨ How it works</p>
                <p className="text-xs text-white/40 leading-relaxed">Apni animation idea describe karo — Gemini AI usse ek perfect video prompt mein convert karega, phir Wan 2.1 se video banega.</p>
              </div>
              <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <label className="text-xs font-semibold text-white/30 uppercase tracking-wider">Animation Description</label>
                </div>
                <textarea value={animDesc} onChange={(e) => setAnimDesc(e.target.value)}
                  placeholder="Ek aadmi desert mein chal raha hai, camera uske peeche se follow karta hai, dramatic sunset hai, slow motion..."
                  rows={5}
                  className="w-full bg-transparent px-4 pb-4 text-sm text-white placeholder-white/20 outline-none resize-none leading-relaxed" />
              </div>
            </div>
          )}

          {/* Motion Presets */}
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Motion Style</p>
            <div className="grid grid-cols-3 gap-2">
              {MOTION_PRESETS.map((preset) => (
                <button key={preset.id} onClick={() => setMotionPreset(preset.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${motionPreset === preset.id ? "bg-violet-600/20 border-violet-500/40 text-white" : "bg-white/3 border-white/8 text-white/40 hover:text-white/70"}`}>
                  <div className="text-lg mb-1">{preset.icon}</div>
                  <div className="text-xs font-semibold">{preset.label}</div>
                  <div className="text-[10px] text-white/25 mt-0.5">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Duration</p>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${duration === d ? "bg-violet-600/20 border-violet-500/40 text-white" : "bg-white/3 border-white/8 text-white/40 hover:text-white/70"}`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {mode === "animation" ? "Generating prompt + video…" : "Generating video…"} ({Math.round(progress)}%)</>
            ) : "🎬 Generate Video"}
          </button>

          {loading && (
            <div className="space-y-2">
              <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-white/25 text-center">
                {mode === "animation" ? "Step 1: Gemini prompt generate kar raha hai… Step 2: Video banega" : "Video ban rahi hai… usually 30–90 seconds"}
              </p>
            </div>
          )}

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}
        </div>

        {/* Right — Preview */}
        <div className="space-y-4">
          <p className="text-xs text-white/25 uppercase tracking-wider">Preview</p>
          <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">
                    {mode === "animation" ? "✨" : "🎬"}
                  </div>
                </div>
                <p className="text-sm text-white/40">
                  {mode === "animation" ? "Gemini + Wan 2.1 working…" : "Wan 2.1 working…"}
                </p>
                <p className="text-xs text-white/20">{Math.round(progress)}% complete</p>
              </div>
            ) : result ? (
              <video src={result} controls autoPlay loop className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <div className="text-4xl mb-3 opacity-20">🎬</div>
                <p className="text-sm text-white/20">Video preview yahan aayega</p>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-[#111] border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50 font-medium">Video ready! 🎉</p>
                <p className="text-xs text-white/20">Wan 2.1 · MP4</p>
              </div>
              <a href={result} download="infimagen-video.mp4" target="_blank"
                className="text-xs bg-violet-600/80 hover:bg-violet-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
                ↓ Download
              </a>
            </div>
          )}

          <div className="bg-white/3 border border-white/5 rounded-xl p-3">
            <p className="text-xs text-white/30 font-semibold mb-1.5">Credits per video:</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/20">Wan 2.1 ({duration}s)</span>
              <span className="text-xs text-white/50 font-bold">52 credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIDEO TEMPLATES ── */}
      {templates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Video Templates ({templates.length})
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Free</span>
              <span className="text-xs bg-violet-500/15 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">Pro</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {templates.map((t) => (
              <div key={t.id} onClick={() => handleTemplateClick(t)}
                className="rounded-xl overflow-hidden relative group cursor-pointer w-full border border-white/8 hover:border-violet-500/40 transition-all"
                style={{ aspectRatio: "16/9" }}>
                <img src={t.image_url} alt={t.title} className="w-full h-full object-cover" />

                {/* Badge */}
                <div className="absolute top-2 right-2">
                  {t.is_free
                    ? <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">FREE</span>
                    : <span className="text-[9px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full">PRO</span>}
                </div>

                {/* Lock */}
                {!t.is_free && !isPaid && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-3xl">🔒</span>
                  </div>
                )}

                {/* Hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs font-bold bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg">
                    {!t.is_free && !isPaid ? "Upgrade to Pro" : "View Prompt"}
                  </span>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm font-semibold">{t.title}</p>
                  {t.category && <p className="text-white/40 text-xs capitalize">{t.category}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro Popup */}
      {showProPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProPopup(false)}>
          <div className="bg-[#111] border border-violet-500/30 rounded-2xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-lg font-bold text-white mb-2">Pro Templates</h2>
            <p className="text-sm text-white/50 mb-5">Ye templates sirf paid users ke liye hain!</p>
            <div className="space-y-2">
              <a href="/payment?plan=starter" className="block w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm">Starter — ₹149</a>
              <a href="/payment?plan=pro" className="block w-full bg-violet-700/50 border border-violet-500/30 text-white/80 font-semibold py-3 rounded-xl text-sm">Pro — ₹499</a>
            </div>
            <button onClick={() => setShowProPopup(false)} className="mt-4 text-xs text-white/25 hover:text-white/50">Maybe later</button>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {showPromptModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPromptModal(false)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">{selectedTemplate.title}</h2>
              <button onClick={() => setShowPromptModal(false)} className="text-white/30 hover:text-white text-lg">×</button>
            </div>
            <img src={selectedTemplate.image_url} alt={selectedTemplate.title} className="w-full rounded-xl mb-3 aspect-video object-cover" />
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 mb-3">
              <p className="text-xs text-white/60 leading-relaxed">{selectedTemplate.prompt}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyPrompt}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${copied ? "bg-emerald-600 text-white" : "bg-white/8 border border-white/10 text-white/60 hover:text-white"}`}>
                {copied ? "✓ Copied!" : "Copy Prompt"}
              </button>
              <button onClick={useThisPrompt} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                Use This →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
