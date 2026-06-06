import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabaseAdmin.from("credit_logs").select("id, reason, created_at").eq("user_id", user.id).lt("amount", 0).order("created_at", { ascending: false }).limit(20);
  return NextResponse.json({ history: data ?? [] });
}
