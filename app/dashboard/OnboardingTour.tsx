"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabaseClient";

interface Step {
  id: string;
  title: string;
  desc: string;
  icon: string;
  target: string | null;
  position?: "top" | "bottom" | "left" | "right";
}

const STEPS: Step[] = [
  {
    id: "welcome",
    title: "Welcome to InfiMagen! 🎉",
    desc: "This is your all-in-one AI creative studio. Generate stunning images, videos, thumbnails, scripts, and more — all powered by cutting-edge AI models.",
    icon: "👋",
    target: null,
  },
  {
    id: "logo",
    title: "Your Dashboard Home 🏠",
    desc: "Click the logo anytime to return to your dashboard home. This is your central hub for all your creations.",
    icon: "🏠",
    target: "tour-logo",
    position: "right",
  },
  {
    id: "home",
    title: "Home Navigation 🏡",
    desc: "This button takes you to the main dashboard where you can see all your recent activity, quick stats, and featured tools.",
    icon: "🏡",
    target: "tour-nav-home",
    position: "right",
  },
  {
    id: "library",
    title: "Your Image Library 🖼️",
    desc: "Click here to access your personal image library. All your generated images are saved here. You can also browse community creations for inspiration!",
    icon: "🖼️",
    target: "tour-nav-library",
    position: "right",
  },
  {
    id: "bgremove",
    title: "Background Remover ✂️",
    desc: "Remove backgrounds from any image instantly with AI. Just upload an image and get a clean cutout in seconds. Perfect for product photos and thumbnails!",
    icon: "✂️",
    target: "tour-nav-bgremove",
    position: "right",
  },
  {
    id: "more",
    title: "More Tools 📦",
    desc: "Click here to discover additional AI tools — Video Generator, Thumbnail Creator, Script Writer, Text-to-Speech, and more powerful features!",
    icon: "📦",
    target: "tour-nav-more",
    position: "right",
  },
  {
    id: "settings",
    title: "Settings & Preferences ⚙️",
    desc: "Manage your account settings, preferences, and configurations from here. Customize your experience to match your workflow.",
    icon: "⚙️",
    target: "tour-nav-settings",
    position: "right",
  },
  {
    id: "credits",
    title: "Your Credits Balance ⚡",
    desc: "This shows your remaining AI credits. You get 50 free credits every day! Image generation costs 20 credits, video generation costs 52 credits. Keep an eye on this!",
    icon: "⚡",
    target: "tour-credits",
    position: "top",
  },
  {
    id: "upgrade",
    title: "Upgrade Your Plan 🚀",
    desc: "Need more credits? Click here to upgrade! Starter (₹149), Pro (₹499), or Elite (₹999) plans give you way more daily credits and premium features.",
    icon: "🚀",
    target: "tour-upgrade",
    position: "top",
  },
  {
    id: "profile",
    title: "Your Profile 👤",
    desc: "This is your profile button. Click it to sign out or manage your account. Your initial is displayed here for quick identification.",
    icon: "👤",
    target: "tour-profile",
    position: "top",
  },
  {
    id: "done",
    title: "You're All Set! ✅",
    desc: "Tour complete! You're ready to create amazing AI content. Click 'Image Library' to generate your first masterpiece, or explore any tool you like. Happy creating! 🎨",
    icon: "✅",
    target: null,
  },
];

export default function OnboardingTour() {
  const supabase = createClient();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const current = STEPS[step];

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const tourDone = localStorage.getItem(`tour_done_${user.id}`);
      if (!tourDone) {
        setTimeout(() => setShow(true), 1200);
      }
      setLoading(false);
    }
    check();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!show || !current.target) {
      setTargetRect(null);
      return;
    }
    const updateRect = () => {
      const el = document.getElementById(current.target!);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };
    updateRect();
    const timeout = setTimeout(updateRect, 100);
    return () => clearTimeout(timeout);
  }, [show, step, current.target, windowSize]);

  async function finish() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) localStorage.setItem(`tour_done_${user.id}`, "true");
    setShow(false);
    setStep(0);
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  const getTooltipPosition = useCallback(() => {
    if (!targetRect || !tooltipRef.current) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
    const tooltipWidth = tooltipRef.current.offsetWidth || 320;
    const tooltipHeight = tooltipRef.current.offsetHeight || 200;
    const padding = 16;
    const arrowSize = 12;
    const position = current.position || "bottom";
    let top = 0, left = 0;

    switch (position) {
      case "top":
        top = targetRect.top - tooltipHeight - arrowSize - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = targetRect.bottom + arrowSize + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - arrowSize - padding;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + arrowSize + padding;
        break;
    }

    if (left < padding) left = padding;
    if (left + tooltipWidth > windowSize.width - padding) left = windowSize.width - tooltipWidth - padding;
    if (top < padding) top = padding;
    if (top + tooltipHeight > windowSize.height - padding) top = windowSize.height - tooltipHeight - padding;

    return { top: `${top}px`, left: `${left}px`, transform: "none" };
  }, [targetRect, current.position, windowSize]);

  const getArrowClass = () => {
    if (!targetRect) return "";
    const pos = current.position || "bottom";
    const base = "absolute w-3 h-3 bg-[#111] border rotate-45 ";
    switch (pos) {
      case "top": return base + "bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r border-violet-500/30";
      case "bottom": return base + "top-[-6px] left-1/2 -translate-x-1/2 border-t border-l border-violet-500/30";
      case "left": return base + "right-[-6px] top-1/2 -translate-y-1/2 border-t border-r border-violet-500/30";
      case "right": return base + "left-[-6px] top-1/2 -translate-y-1/2 border-b border-l border-violet-500/30";
    }
  };

  if (loading || !show) return null;

  const tooltipStyle = getTooltipPosition();
  const hasTarget = !!current.target && !!targetRect;

  return (
    <>
      <div className="fixed inset-0 z-[100]">
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300" onClick={finish} />
        {hasTarget && (
          <>
            <div className="absolute bg-black/75 backdrop-blur-sm" style={{ top: 0, left: 0, right: 0, height: `${targetRect.top}px` }} />
            <div className="absolute bg-black/75 backdrop-blur-sm" style={{ top: `${targetRect.bottom}px`, left: 0, right: 0, bottom: 0 }} />
            <div className="absolute bg-black/75 backdrop-blur-sm" style={{ top: `${targetRect.top}px`, left: 0, width: `${targetRect.left}px`, height: `${targetRect.height}px` }} />
            <div className="absolute bg-black/75 backdrop-blur-sm" style={{ top: `${targetRect.top}px`, left: `${targetRect.right}px`, right: 0, height: `${targetRect.height}px` }} />
            <div className="absolute pointer-events-none z-[101]" style={{
              top: `${targetRect.top - 4}px`, left: `${targetRect.left - 4}px`,
              width: `${targetRect.width + 8}px`, height: `${targetRect.height + 8}px`,
              borderRadius: "12px",
              boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.6), 0 0 20px 4px rgba(139, 92, 246, 0.3)",
              animation: "tour-pulse 2s ease-in-out infinite",
            }} />
          </>
        )}
      </div>

      <div ref={tooltipRef} className="fixed z-[102] pointer-events-auto" style={tooltipStyle}>
        <div className="relative bg-[#111] border border-violet-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-violet-500/10">
          {hasTarget && <div className={getArrowClass()} />}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i === step ? "w-6 h-1.5 bg-violet-500" : i < step ? "w-1.5 h-1.5 bg-violet-500/40" : "w-1.5 h-1.5 bg-white/10"}`} />
            ))}
          </div>
          <div className="text-center text-[10px] text-white/20 mb-3 font-medium uppercase tracking-wider">Step {step + 1} of {STEPS.length}</div>
          <div className="text-5xl text-center mb-4">{current.icon}</div>
          <h2 className="text-lg font-bold text-white text-center mb-3">{current.title}</h2>
          <p className="text-sm text-white/50 text-center leading-relaxed mb-6">{current.desc}</p>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={prev} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">← Back</button>
            )}
            <button onClick={next} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/20">
              {step === STEPS.length - 1 ? "Start Creating! 🚀" : "Next →"}
            </button>
          </div>
          {step < STEPS.length - 1 && (
            <button onClick={finish} className="w-full mt-3 text-xs text-white/20 hover:text-white/40 transition-colors">Skip tour</button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes tour-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.6), 0 0 20px 4px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 0 5px rgba(139, 92, 246, 0.8), 0 0 30px 8px rgba(139, 92, 246, 0.5); }
        }
      `}</style>
    </>
  );
}

