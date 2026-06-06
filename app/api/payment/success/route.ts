import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PLAN_CREDITS, PlanId } from "@/lib/planCredits";
import crypto from "crypto";
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  if (!planId || !["starter", "pro", "elite"].includes(planId)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");
  if (generated_signature !== razorpay_signature) return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  const safePlan = planId as PlanId;
  const credits = PLAN_CREDITS[safePlan];
  await supabaseAdmin.from("payments").insert({ user_id: user.id, amount: 0, currency: "INR", provider: "razorpay", status: "success", razorpay_order_id, razorpay_payment_id, plan_name: safePlan });
  await supabaseAdmin.from("subscriptions").insert({ user_id: user.id, plan_name: safePlan, credits_granted: credits, status: "active", start_date: new Date().toISOString() });
  await supabaseAdmin.rpc("add_credits", { p_user_id: user.id, p_amount: credits, p_reason: "plan_purchase_paid", p_meta: { plan: safePlan, razorpay_order_id } });
  return NextResponse.json({ success: true, credits });
}
