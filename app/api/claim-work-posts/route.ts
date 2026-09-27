import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Missing session" }, { status: 401 });

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: { user }, error: userError } = await authClient.auth.getUser(token);
    if (userError || !user?.id || !user.email) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await admin
      .from("work_posts")
      .update({ user_id: user.id, updated_at: new Date().toISOString() })
      .is("user_id", null)
      .ilike("contact_email_address", user.email)
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ claimed: data || [] });
  } catch (error) {
    console.error("Claim work posts failed:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
