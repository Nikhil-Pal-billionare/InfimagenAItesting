import { createClient } from "@/lib/supabaseServer";

function StatCard({
  label,
  value,
  sub,
  color = "violet",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    violet: "from-violet-500/10 border-violet-500/20 text-violet-300",
    blue:   "from-blue-500/10 border-blue-500/20 text-blue-300",
    green:  "from-emerald-500/10 border-emerald-500/20 text-emerald-300",
    amber:  "from-amber-500/10 border-amber-500/20 text-amber-300",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/40 w-20 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white/60 w-8 text-right">{value}</span>
    </div>
  );
}

export default async function AdminOverview() {
  const supabase = createClient();

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const since7d  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

  const [
    { count: totalUsers },
    { count: activeSubs },
    { count: todaySignups },
    { count: yesterdaySignups },
    { count: todayLogins },
    revenue,
    credits24h,
    credits7d,
    usageByType,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", yesterdayStart).lt("created_at", todayStart),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_sign_in_at", todayStart),
    supabase.from("subscriptions").select("amount").eq("status", "active").gte("created_at", since24h),
    supabase.from("credit_logs").select("amount").gte("created_at", since24h),
    supabase.from("credit_logs").select("amount").gte("created_at", since7d),
    supabase.from("credit_logs").select("reason, amount").gte("created_at", since7d),
  ]);

  const totalRevenue   = revenue.data?.reduce((s, r) => s + r.amount, 0) ?? 0;
  const credits24hSum  = credits24h.data?.reduce((s, c) => s + Math.abs(c.amount), 0) ?? 0;
  const credits7dSum   = credits7d.data?.reduce((s, c)  => s + Math.abs(c.amount), 0) ?? 0;

  // Usage breakdown by type
  const usageMap: Record<string, number> = {};
  (usageByType.data ?? []).forEach((row) => {
    const key = row.reason ?? "other";
    usageMap[key] = (usageMap[key] ?? 0) + Math.abs(row.amount);
  });
  const usageEntries = Object.entries(usageMap).sort((a, b) => b[1] - a[1]);
  const maxUsage = usageEntries[0]?.[1] ?? 1;

  const signupChange = (yesterdaySignups ?? 0) > 0
    ? Math.round((((todaySignups ?? 0) - (yesterdaySignups ?? 0)) / (yesterdaySignups ?? 1)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-white/30 mt-0.5">
          {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users"         value={totalUsers ?? 0}          sub="All time"        color="violet" />
        <StatCard label="Active Subscriptions" value={activeSubs ?? 0}          sub="Currently active" color="blue"   />
        <StatCard label="Revenue (24h)"        value={`₹${totalRevenue}`}       sub="New subscriptions" color="green"  />
        <StatCard label="Credits Used (24h)"   value={credits24hSum}            sub={`${credits7dSum} this week`} color="amber"  />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Today's activity */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Today's Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-white">{todaySignups ?? 0}</p>
                <p className="text-xs text-white/30">New Signups</p>
              </div>
              <div className={`text-sm font-semibold px-2.5 py-1 rounded-full ${signupChange >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {signupChange >= 0 ? "+" : ""}{signupChange}% vs yesterday
              </div>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-white">{todayLogins ?? 0}</p>
                <p className="text-xs text-white/30">Logins Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage breakdown */}
        <div className="xl:col-span-2 bg-[#111] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Usage Breakdown (7 days)</h2>
          {usageEntries.length === 0 ? (
            <p className="text-sm text-white/20 text-center py-6">No usage data yet</p>
          ) : (
            <div className="space-y-3">
              {usageEntries.slice(0, 8).map(([reason, count]) => (
                <MiniBar key={reason} label={reason.replace(/_/g, " ")} value={count} max={maxUsage} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscription types */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-1">Platform Health</h2>
        <p className="text-xs text-white/20 mb-4">Quick snapshot</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Conversion Rate", value: totalUsers && activeSubs ? `${Math.round(((activeSubs ?? 0) / (totalUsers ?? 1)) * 100)}%` : "0%" },
            { label: "Credits / User / Day", value: totalUsers ? Math.round(credits24hSum / Math.max(totalUsers ?? 1, 1)) : 0 },
            { label: "Subs Purchased Today", value: revenue.data?.length ?? 0 },
            { label: "Tools Used Today", value: credits24h.data?.length ?? 0 },
          ].map((item) => (
            <div key={item.label} className="bg-white/3 rounded-lg p-4">
              <p className="text-xs text-white/30 mb-1">{item.label}</p>
              <p className="text-xl font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
