import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const emailRedirectTo = "https://youlistify.com/dashboard";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Please enter an email and password." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo }
    });

    if (resendError) {
      console.error("Listing account confirmation resend failed:", resendError.message);
      return NextResponse.json({ error: resendError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Listing account creation failed:", error);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
