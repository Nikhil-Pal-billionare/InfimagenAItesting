```tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const NAV = [
  { href: "/dashboard",           icon: "⬡",  label: "Home" },
  { href: "/dashboard/Image",     icon: "🖼️", label: "Image" },
  { href: "/dashboard/video",     icon: "🎬", label: "Video" },
  { href: "/dashboard/thumbnail", icon: "🎨", label: "Thumbnail" },
  { href: "/dashboard/Script",    icon: "📝", label: "Script" },
  { href: "/dashboard/tts",       icon: "🔊", label: "TTS" },
];

function Sidebar({ credits, userEmail }: { credits: number | null; userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  async function signOut() { await supabase.auth.signOut(); router.push("/"); }
  const initials = userEmail?.[0]?.toUpperCase() ?? "U";
  return (
    <aside className="fixed top-0 left-0 h-screen w-16 md:w-56 bg-[#0e0e0e] border-r border-white/5 flex flex-col z-40">
      <div className="h-14 flex items-center justify-center md:justify-start px-3 md:px-4 border-b border-white/5 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-black">I</span>
        </div>
        <span className="hidden md:block ml-2.5 text-white font-bold text-sm">InfiMagen</span>
      </div>
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} title={item.label}
              className={`flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-violet-600/20 text-violet-300" : "text-white/35 hover:text-white/70 hover:bg-white/5"}`}>
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              <span className="hidden md:block font-medium truncate">{item.label}</span>
              {active && <span className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 md:p-3 border-t border-white/5 space-y-2 flex-shrink-0">
        <div className="hidden md:flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">⚡</span>
            <span className="text-xs text-white/40">Credits</span>
          </div>
          <span className="text-sm font-bold text-white">{credits === null ? "…" : credits.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2.5 px-1 md:px-2 py-1 rounded-xl hover:bg-white/5 cursor-pointer group" onClick={signOut} title="Sign out">
          <div className="w-7 h-7 rounded-full bg-violet-600/40 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-violet-200 text-xs font-bold">{initials}</span>
          </div>
          <div className="hidden md:block flex-1 min-w-0">
            <p className="text-xs text-white/50 truncate">{userEmail}</p>
            <p className="text-xs text-white/20 group-hover:text-red-400">Sign out</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/sign-in"); return; }
      setUserEmail(user.email ?? "");
      const res = await fetch("/api/credits/get");
      const json = await res.json();
      setCredits(json.balance ?? 0);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex min-h-screen bg-[#080808]">
      <Sidebar credits={credits} userEmail={userEmail} />
      <main className="flex-1 ml-16 md:ml-56 min-h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
```
