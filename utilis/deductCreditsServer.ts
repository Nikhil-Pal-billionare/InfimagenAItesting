import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function deductCreditsServer({ userId, amount, reason = "usage", meta = {} }: { userId: string; amount: number; reason?: string; meta?: Record<string, unknown>; }) {
  if (amount === 0) return { success: true };
  const { error } = await supabaseAdmin.rpc("deduct_credits", {
    p_user_id: userId, p_amount: amount, p_reason: reason, p_meta: meta,
  });
  if (error) throw new Error(error.message);
  return { success: true };
}
export async function refundCreditsServer({ userId, amount, reason = "refund", meta = {} }: { userId: string; amount: number; reason?: string; meta?: Record<string, unknown>; }) {
  return deductCreditsServer({ userId, amount: -Math.abs(amount), reason, meta });
}
