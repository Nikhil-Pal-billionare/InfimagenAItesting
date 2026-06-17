export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const NAV = [
    { href: "/dashboard", label: "Home", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )},
    { href: "/dashboard/projects", label: "Projects", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )},
    { href: "/dashboard/remove-bg", label: "BG Remove", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[72px] bg-[#0d0d0d] border-r border-white/5 flex-col items-center py-4 z-50">
        <Link href="/dashboard" className="mb-6 flex-shrink-0">
          <img 
  src="https://lrdwqsllipznxajlyyea.supabase.co/storage/v1/object/public/media-uploads/1000055271-removebg-preview.png" 
  alt="InfiMagen" 
  className="w-8 h-8 rounded-full object-cover"
/>
        </Link>
        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all group relative"
              title={item.label}
            >
              {item.icon}
              <span className="absolute left-12 px-2 py-1 bg-white/10 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 h-12">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <img src="https://lrdwqsllipznxajlyyea.supabase.co/storage/v1/object/public/media-uploads/1000055271-removebg-preview.png" alt="logo" className="w-7 h-7 rounded-full object-cover" />
          </div>
          <span className="text-white font-bold text-sm">InfiMagen</span>
        </Link>

        <button onClick={() => setMenuOpen(!menuOpen)} className="text-white/60">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="md:ml-[72px] pt-12 md:pt-0">
        {menuOpen && (
          <nav className="md:hidden fixed top-12 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-white/5 flex flex-col z-40">
            {[
              { href: "/dashboard/thumbnail", label: "Thumbnail" },
              { href: "/dashboard/Script", label: "Script" },
              { href: "/dashboard/tts", label: "TTS" },
              { href: "/dashboard/remove-bg", label: "BG Remover" },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                {item.label}
              </Link>
            ))}
            <button onClick={signOut}
              className="w-full text-white/30 text-sm py-2 hover:text-white/60 transition-all"
            >
              Sign Out
            </button>
          </nav>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
