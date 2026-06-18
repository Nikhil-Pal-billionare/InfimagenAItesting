"use client";

import { useState, useEffect, useRef } from "react";
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
    title: "You are All Set! ✅",
    desc: "Tour complete! You are ready to create amazing AI content. Click Image Library to generate your first masterpiece, or explore any tool you like. Happy creating! 🎨",
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
  const [tooltipPos, setTooltipPos] = useState({ top: "50%", left: "50%" });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const current = STEPS[step];

  // Check if tour should show
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

  // Calculate positions
  useEffect(() => {
    if (!show) return;

    function updatePositions() {
      if (!current.target) {
        setTargetRect(null);
        setTooltipPos({ top: "50%", left: "50%" });
        return;
      }

      const el = document.getElementById(current.target);
      if (!el) {
        setTargetRect(null);
        setTooltipPos({ top: "50%", left: "50%" });
        return;
      }

      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      // Calculate tooltip position
      const tooltipEl = tooltipRef.current;
      const tw = tooltipEl?.offsetWidth || 340;
      const th = tooltipEl?.offsetHeight || 240;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const padding = 16;
      const gap = 20;

      const pos = current.position || "bottom";
      let top = 0;
      let left = 0;

      switch (pos) {
        case "top":
          top = rect.top - th - gap;
          left = rect.left + rect.width / 2 - tw / 2;
          break;
        case "bottom":
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - tw / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - th / 2;
          left = rect.left - tw - gap;
          break;
        case "right":
          top = rect.top + rect.height / 2 - th / 2;
          left = rect.right + gap;
          break;
      }

      if (left < padding) left = padding;
      if (left + tw > vw - padding) left = vw - tw - padding;
      if (top < padding) top = padding;
      if (top + th > vh - padding) top = vh - th - padding;

      setTooltipPos({ top: `${top}px`, left: `${left}px` });
    }

    const t1 = setTimeout(updatePositions, 100);
    const t2 = setTimeout(updatePositions, 400);
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [show, step, current.target, current.position]);

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

  if (loading || !show) return null;

  const hasTarget = !!current.target && !!targetRect;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;

  // Spotlight padding around target
  const spotPadding = 8;
  const spotX = hasTarget ? targetRect!.left - spotPadding : 0;
  const spotY = hasTarget ? targetRect!.top - spotPadding : 0;
  const spotW = hasTarget ? targetRect!.width + spotPadding * 2 : 0;
  const spotH = hasTarget ? targetRect!.height + spotPadding * 2 : 0;
  const spotR = 16; // border radius

  return (
    <div className="fixed inset-0" style={{ zIndex: 99999 }}>
      {/* SVG Overlay with Mask for Spotlight */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: hasTarget ? "none" : "auto" }}
      >
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width={vw} height={vh} fill="white" />
            {hasTarget && (
              <rect
                x={spotX}
                y={spotY}
                width={spotW}
                height={spotH}
                rx={spotR}
                ry={spotR}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={vw}
          height={vh}
          fill="rgba(0,0,0,0.75)"
          mask="url(#tour-mask)"
          onClick={finish}
          style={{ pointerEvents: "auto", cursor: "default" }}
        />
      </svg>

      {/* Glowing border around target */}
      {hasTarget && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: spotY,
            left: spotX,
            width: spotW,
            height: spotH,
            borderRadius: spotR,
            border: "3px solid #8b5cf6",
            boxShadow: "0 0 0 4px rgba(139,92,246,0.3), 0 0 30px 8px rgba(139,92,246,0.5), inset 0 0 20px rgba(139,92,246,0.1)",
            animation: "tourPulse 2s ease-in-out infinite",
            zIndex: 100000,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: "340px",
          maxWidth: "calc(100vw - 32px)",
          pointerEvents: "auto",
          zIndex: 100001,
          transform: tooltipPos.top === "50%" ? "translate(-50%, -50%)" : "none",
        }}
      >
        <div className="relative bg-[#111] border border-violet-500/40 rounded-2xl p-6 shadow-2xl shadow-violet-500/10">
          {/* Arrow pointing to target */}
          {hasTarget && (
            <div
              className="absolute w-3 h-3 bg-[#111] border rotate-45"
              style={{
                ...(current.position === "right" && { left: "-7px", top: "50%", marginTop: "-6px", borderRight: "none", borderTop: "none", borderColor: "rgba(139,92,246,0.4)" }),
                ...(current.position === "left" && { right: "-7px", top: "50%", marginTop: "-6px", borderLeft: "none", borderBottom: "none", borderColor: "rgba(139,92,246,0.4)" }),
                ...(current.position === "bottom" && { top: "-7px", left: "50%", marginLeft: "-6px", borderLeft: "none", borderBottom: "none", borderColor: "rgba(139,92,246,0.4)" }),
                ...(current.position === "top" && { bottom: "-7px", left: "50%", marginLeft: "-6px", borderRight: "none", borderTop: "none", borderColor: "rgba(139,92,246,0.4)" }),
                ...(current.position === undefined && { display: "none" }),
              }}
            />
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 h-1.5 bg-violet-500"
                    : i < step
                    ? "w-1.5 h-1.5 bg-violet-500/40"
                    : "w-1.5 h-1.5 bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Step counter */}
          <div className="text-center text-[10px] text-white/30 mb-3 font-medium uppercase tracking-wider">
            Step {step + 1} of {STEPS.length}
          </div>

          {/* Icon */}
          <div className="text-5xl text-center mb-4">{current.icon}</div>

          {/* Content */}
          <h2 className="text-lg font-bold text-white text-center mb-3">
            {current.title}
          </h2>
          <p className="text-sm text-white/60 text-center leading-relaxed mb-6">
            {current.desc}
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all"
            >
              {step === STEPS.length - 1 ? "Start Creating!" : "Next"}
            </button>
          </div>

          {/* Skip */}
          {step < STEPS.length - 1 && (
            <button
              onClick={finish}
              className="w-full mt-3 text-xs text-white/20 hover:text-white/50 transition-colors"
            >
              Skip tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

