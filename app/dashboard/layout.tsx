"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const NAV = [
  { href: "/dashboard",           icon: "⌂",  label: "Home" },
  { href: "/dashboard/Image",     icon: "⊞",  label: "Library" },
  { href: "/dashboard/Script",    icon: "…",  label: "More" },
];

const BOTTOM_NAV = [
  { href: "/dashboard/tts",       icon: "⚙",  label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase  = createClient();
  const router    = useRouter();
  const pathname  = usePathname();
  const [credits, setCredits]   = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [initial, setInitial]   = useState("U");

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/sign-in"); return; }
      setUserEmail(user.email ?? "");
      setInitial((user.email?.[0] ?? "U").toUpperCase());
      const res  = await fetch("/api/credits/get");
      const json = await res.json();
      setCredits(json.balance ?? 0);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-[#080808]">

      {/* ── SIDEBAR — Leonardo style narrow icon sidebar ── */}
      <aside className="fixed top-0 left-0 h-screen w-[72px] bg-[#0d0d0d] border-r border-white/5 flex flex-col items-center py-4 z-50">

        {/* Logo */}
        <Link href="/dashboard" className="mb-6 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white text-base font-black">I</span>
          </div>
        </Link>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {[
            { href: "/dashboard",           label: "Home",    svg: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>, svg2: <polyline points="9 22 9 12 15 12 15 22"/> },
            { href: "/dashboard/Image",     label: "Library", svg: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
            { href: "#",                    label: "More",    svg: <><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></> },
          ].map((item) => {
            const active = item.href !== "#" && (item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all group ${
                  active ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke={active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:stroke-white/70 transition-all">
                  {item.svg}
                  {item.svg2}
                </svg>
                <span className={`text-[9px] font-medium transition-colors ${active ? "text-white/80" : "text-white/25 group-hover:text-white/50"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="w-8 h-px bg-white/8 my-2" />

        {/* Bottom items */}
        <div className="flex flex-col items-center gap-1 w-full px-2 mb-3">
          {/* Settings */}
          <Link href="/dashboard/tts" className="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl hover:bg-white/5 transition-all group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white/60 transition-all">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
            <span className="text-[9px] font-medium text-white/25 group-hover:text-white/50 transition-colors">Settings</span>
          </Link>

          {/* Credits pill */}
          <div className="w-full flex flex-col items-center gap-1 py-2 px-1">
            <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/25 rounded-lg px-2 py-1.5 w-full justify-center">
              <span className="text-emerald-400 text-xs">⬡</span>
              <span className="text-emerald-300 text-xs font-bold">{credits === null ? "…" : credits}</span>
            </div>
            <button
              onClick={() => router.push("/payment?plan=pro")}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all"
            >
              Upgrade
            </button>
          </div>

          {/* Avatar / sign out */}
          <button
            onClick={signOut}
            title={`${userEmail} — Sign out`}
            className="w-10 h-10 rounded-full bg-violet-600/40 border-2 border-violet-500/40 flex items-center justify-center hover:border-violet-400/60 transition-all mt-1"
          >
            <span className="text-violet-200 text-sm font-bold">{initial}</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 ml-[72px] min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

