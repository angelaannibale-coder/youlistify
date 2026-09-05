import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const publicFields = `
id,created_at,post_type,title,description,category,city,state,zip_code,remote,
pay_type,pay_amount,status,contact_call,contact_text,contact_email,
contact_youlistify,contact_phone,contact_email_address,application_url
`;

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const id = req.nextUrl.searchParams.get("id");

    let query = admin.from("work_posts").select(publicFields).eq("status", "active");

    if (id) {
      if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid post" }, { status: 400 });
      const { data, error } = await query.eq("id", id).maybeSingle();
      if (error) return NextResponse.json({ error: "Could not load post" }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      return NextResponse.json({ post: sanitizePost(data) });
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(1000);
    if (error) return NextResponse.json({ error: "Could not load posts" }, { status: 500 });
    return NextResponse.json({ posts: (data || []).map(sanitizePost) });
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

function sanitizePost(post: any) {
  return {
    ...post,
    contact_phone: post.contact_call || post.contact_text ? post.contact_phone : null,
    contact_email_address: post.contact_email ? post.contact_email_address : null
  };
}
