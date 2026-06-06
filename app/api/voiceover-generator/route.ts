import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CREDIT_COSTS } from "@/lib/creditCosts";

// Uses Google Gemini TTS (no separate credentials needed)
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, voice = "alloy" } = await req.json();
  if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 });

  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 150);
  const cost = CREDIT_COSTS.VOICEOVER_PER_MIN * minutes;

  const { error } = await supabaseAdmin.rpc("deduct_credits", {
    p_user_id: user.id, p_amount: cost, p_reason: "voiceover_generation", p_meta: { voice, words: wordCount },
  });
  if (error) return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });

  // Use Google TTS via Gemini API (no service account needed)
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "en-US", name: voice === "nova" || voice === "shimmer" ? "en-US-Wavenet-F" : "en-US-Wavenet-D" },
        audioConfig: { audioEncoding: "MP3" },
      }),
    }
  );

  if (!response.ok) {
    // Refund on failure
    try {
  await supabaseAdmin.rpc("deduct_credits", {
    p_user_id: user.id,
    p_amount: -cost,
    p_reason: "refund_tts_failed",
    p_meta: {}
  });
} catch (refundError) {
  console.error("TTS refund failed:", refundError);
  }
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }

  const data = await response.json();
  const audioBuffer = Buffer.from(data.audioContent, "base64");
  return new Response(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg", "Content-Length": String(audioBuffer.length) },
  });
}
