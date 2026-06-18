"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";

const STEPS = [
  {
    id: "welcome",
    title: "InfiMagen mein aapka swagat hai! 🎉",
    desc: "Ye ek powerful AI platform hai jisme aap images, videos, thumbnails, scripts aur bahut kuch bana sakte ho. Chalte hain ek quick tour pe!",
    icon: "👋",
    target: null,
  },
  {
    id: "credits",
    title: "Credits kya hote hain? ⚡",
    desc: "Har feature use karne pe credits lagte hain. Aapko rooz 50 free credits milte hain! Image banane pe 20 credits, video pe 52 credits lagte hain.",
    icon: "⚡",
    target: "credits-pill",
  },
  {
    id: "image",
    title: "AI Image Generation 🖼️",
    desc: "Image pe click karo, koi bhi prompt likho aur Imagen 4 se stunning images banao. Community images bhi dekh sakte ho neeche!",
    icon: "🖼️",
    target: "nav-image",
  },
  {
    id: "video",
    title: "AI Video Generator 🎬",
    desc: "Text se video, Image se video, ya Animation describe karke video banao. Wan 2.1 model use hota hai — ekdum cinematic quality!",
    icon: "🎬",
    target: "nav-video",
  },
  {
    id: "thumbnail",
    title: "Thumbnail Creator 🎨",
    desc: "YouTube ke liye 16:9 thumbnails banao. Ready-made templates bhi hain — click karo, prompt copy karo aur generate karo!",
    icon: "🎨",
    target: "nav-thumbnail",
  },
  {
    id: "upgrade",
    title: "Upgrade karo 🚀",
    desc: "Free plan mein 50 credits/day milte hain. Zyada features ke liye Starter (₹149), Pro (₹499) ya Elite (₹999) plan lo aur zyada credits pao!",
    icon: "🚀",
    target: "upgrade-btn",
  },
  {
    id: "done",
    title: "Ab sab ready hai! ✅",
    desc: "Tour complete ho gaya. Ab apni pehli image banao — 'Image' pe click karo aur koi bhi prompt likho. All the best! 🎉",
    icon: "✅",
    target: null,
  },
];

export default function OnboardingTour() {
  const supabase = createClient();
  const [show, setShow]       = useState(false);
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check localStorage if tour already done
      const tourDone = localStorage.getItem(`tour_done_${user.id}`);
      if (!tourDone) {
        // Small delay for page to load
        setTimeout(() => setShow(true), 1500);
      }
      setLoading(false);
    }
    check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function finish() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) localStorage.setItem(`tour_done_${user.id}`, "true");
    setShow(false);
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  if (loading || !show) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" onClick={finish} />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#111] border border-violet-500/30 rounded-2xl p-6 max-w-sm w-full pointer-events-auto shadow-2xl shadow-violet-500/10"
          onClick={(e) => e.stopPropagation()}>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div key={i} className={`rounded-full transition-all ${i === step ? "w-6 h-1.5 bg-violet-500" : i < step ? "w-1.5 h-1.5 bg-violet-500/40" : "w-1.5 h-1.5 bg-white/10"}`} />
            ))}
          </div>

          {/* Icon */}
          <div className="text-5xl text-center mb-4">{current.icon}</div>

          {/* Content */}
          <h2 className="text-lg font-bold text-white text-center mb-3">{current.title}</h2>
          <p className="text-sm text-white/50 text-center leading-relaxed mb-6">{current.desc}</p>

          {/* Buttons */}
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={prev}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all">
                ← Back
              </button>
            )}
            <button onClick={next}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all">
              {step === STEPS.length - 1 ? "Start Creating! 🚀" : "Next →"}
            </button>
          </div>

          {/* Skip */}
          {step < STEPS.length - 1 && (
            <button onClick={finish} className="w-full mt-3 text-xs text-white/20 hover:text-white/40 transition-colors">
              Skip tour
            </button>
          )}
        </div>
      </div>
    </>
  );
}
