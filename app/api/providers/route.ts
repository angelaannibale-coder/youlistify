import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const publicFields = `
id,created_at,name,last_name,business_name,phone,email,city,state,zip_code,
service_mode,display_city,bio,available_now,profile_active,name_display,contact_call,
contact_text,contact_email,contact_youlistify,customer_comes_to_me,mobile_service,
pricing_methods,starting_price,flat_price,profile_photo,gallery_photos,user_id,
provider_services (services (name))
`;

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const id = req.nextUrl.searchParams.get("id");

    let query = admin
      .from("Providers")
      .select(publicFields)
      .eq("profile_active", true);

    if (id) {
      if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
      const { data, error } = await query.eq("id", id).maybeSingle();
      if (error) return NextResponse.json({ error: "Could not load provider" }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      let isOwner = false;
      const authHeader = req.headers.get("authorization") || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (token) {
        const authClient = createClient(supabaseUrl, anonKey);
        const { data: { user } } = await authClient.auth.getUser(token);
        isOwner = Boolean(user && data.user_id === user.id);
      }
      return NextResponse.json({ provider: sanitizeProvider(data), isOwner });
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(1000);
    if (error) return NextResponse.json({ error: "Could not load providers" }, { status: 500 });
    return NextResponse.json({ providers: (data || []).map(sanitizeProvider) });
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

function sanitizeProvider(provider: any) {
  const { user_id: _privateUserId, ...safeProvider } = provider;
  const showCity = provider.service_mode !== "remote" || provider.display_city !== false;
  return {
    ...safeProvider,
    city: showCity ? provider.city : null,
    state: showCity ? provider.state : null,
    zip_code: showCity ? provider.zip_code : null,
    phone: provider.contact_call || provider.contact_text ? provider.phone : null,
    email: provider.contact_email ? provider.email : null
  };
}
