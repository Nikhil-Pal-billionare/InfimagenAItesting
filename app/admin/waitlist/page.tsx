import { createClient } from "@/lib/supabaseServer";

function isAdmin(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || "";
  const admins = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!email && admins.includes(email.toLowerCase());
}

const STATUS_STYLES: Record<string, string> = {
  waitlisted: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  invited:    "bg-blue-500/10 text-blue-300 border-blue-500/20",
  paid:       "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

export default async function AdminWaitlistPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdmin(user?.email)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-4xl mb-3">🔒</p>
          <h1 className="text-xl font-bold text-white">Admin Only</h1>
          <p className="text-white/30 text-sm mt-1">You don't have access to this page.</p>
        </div>
      </div>
    );
  }

  const status = searchParams?.status ?? "all";
  let query = supabase
    .from("waitlist")
    .select("email, status, joined_at, whatsapp, role")
    .order("joined_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;

  const counts: Record<string, number> = { all: (data ?? []).length };
  (data ?? []).forEach((r) => {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Waitlist</h1>
        <p className="text-sm text-white/30 mt-0.5">People waiting for access</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "waitlisted", "invited", "paid"].map((s) => (
          <a
            key={s}
            href={`/admin/waitlist${s !== "all" ? `?status=${s}` : ""}`}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors capitalize ${
              status === s
                ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/8"
            }`}
          >
            {s} {counts[s] !== undefined ? `(${counts[s]})` : ""}
          </a>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error.message}</p>}

      <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">WhatsApp</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(data ?? []).map((row, i) => (
                <tr key={i} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-white/70">{row.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLES[row.status] ?? "bg-white/5 text-white/40 border-white/10"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/30 text-xs">
                    {new Date(row.joined_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-white/30 text-xs">{row.whatsapp ?? "—"}</td>
                  <td className="px-5 py-3 text-white/30 text-xs">{row.role ?? "—"}</td>
                </tr>
              ))}
              {(data ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-white/20 text-sm">
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
