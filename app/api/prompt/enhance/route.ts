import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { generateContent } from "@/lib/gemini";
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  const enhanced = await generateContent(`Rewrite as a detailed AI image prompt. Return ONLY the prompt:\n\n${prompt}`);
  return NextResponse.json({ enhanced });
}
