import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") redirect("/dashboard");
  return (
    <div className="flex min-h-screen bg-[#080808] text-white">
      <aside className="fixed top-0 left-0 w-56 h-screen bg-[#0e0e0e] border-r border-white/5 flex flex-col z-40">
        <div className="h-14 flex items-center px-5 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-2.5">
            <span className="text-white text-xs font-black">I</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">InfiMagen</p>
            <p className="text-white/30 text-xs">Admin</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {[
            { href: "/admin", label: "Overview", icon: "📊" },
            { href: "/admin/users", label: "Users", icon: "👥" },
            { href: "/admin/waitlist", label: "Waitlist", icon: "📋" },
            { href: "/admin/revenue", label: "Revenue", icon: "💰" },
            { href: "/admin/usage", label: "Usage", icon: "📈" },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-xs text-white/30 hover:text-white/60">
            ← Back to App
          </a>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}
