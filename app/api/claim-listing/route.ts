import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Missing session" }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });
    }

    const authClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: userError } = await authClient.auth.getUser(token);
    if (userError || !user?.id || !user.email) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const selectFields = "id,name,last_name,business_name,email,phone,city,state,bio,name_display,user_id";

    const { data: owned } = await admin
      .from("Providers")
      .select(selectFields)
      .eq("user_id", user.id)
      .maybeSingle();

    if (owned) return NextResponse.json({ provider: owned });

    const { data: matching, error: matchError } = await admin
      .from("Providers")
      .select(selectFields)
      .ilike("email", user.email)
      .is("user_id", null);

    if (matchError) return NextResponse.json({ error: "Could not look up listing" }, { status: 500 });
    if (!matching || matching.length === 0) return NextResponse.json({ error: "No matching unclaimed listing" }, { status: 404 });
    if (matching.length > 1) return NextResponse.json({ error: "Multiple matching listings require support review" }, { status: 409 });

    const match = matching[0];
    const { data: claimed, error: claimError } = await admin
      .from("Providers")
      .update({ user_id: user.id })
      .eq("id", match.id)
      .is("user_id", null)
      .select(selectFields)
      .single();

    if (claimError || !claimed) return NextResponse.json({ error: "Could not connect listing" }, { status: 500 });

    return NextResponse.json({ provider: claimed });
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
