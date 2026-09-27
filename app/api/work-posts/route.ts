import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const publicFields = `
id,created_at,post_type,title,description,category,city,state,zip_code,remote,
pay_type,pay_amount,status,contact_call,contact_text,contact_email,
contact_youlistify,contact_phone,contact_email_address,application_url
`;
const listFields = "id,created_at,post_type,title,description,category,city,state,remote,pay_type,pay_amount";

export async function GET(req: NextRequest) {
  try {
    if (process.env.VERCEL_ENV === "preview") {
      const productionUrl = `https://youlistify.com/api/work-posts${req.nextUrl.search}`;
      const productionResponse = await fetch(productionUrl, { cache: "no-store" });
      if (productionResponse.ok) return NextResponse.json(await productionResponse.json());
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid post" }, { status: 400 });
      const { data, error } = await admin
        .from("work_posts")
        .select(publicFields)
        .eq("status", "active")
        .eq("id", id)
        .maybeSingle();
      if (error) return NextResponse.json({ error: "Could not load post" }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      return NextResponse.json({ post: sanitizePost(data) });
    }

    const { data, error } = await admin
      .from("work_posts")
      .select(listFields)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) return NextResponse.json({ error: "Could not load posts" }, { status: 500 });
    return NextResponse.json({ posts: (data || []).map(sanitizePost) });
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Missing post details" }, { status: 400 });

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    let userId: string | null = null;

    if (token) {
      const authClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data: { user }, error } = await authClient.auth.getUser(token);
      if (error || !user?.id) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
      userId = user.id;
    }

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const postType = String(body.post_type || "task").trim();
    const payType = String(body.pay_type || "contact").trim();
    const contactPhone = String(body.contact_phone || "").trim();
    const contactEmailAddress = String(body.contact_email_address || "").trim();
    const applicationUrl = String(body.application_url || "").trim();

    if (!["job", "gig", "task"].includes(postType)) {
      return NextResponse.json({ error: "Choose a valid post type." }, { status: 400 });
    }
    if (!title || !description) {
      return NextResponse.json({ error: "Please add a title and description." }, { status: 400 });
    }
    if (!["hourly", "flat", "salary", "contact"].includes(payType)) {
      return NextResponse.json({ error: "Choose a valid pay type." }, { status: 400 });
    }

    const hasResponseMethod =
      Boolean(body.contact_call) ||
      Boolean(body.contact_text) ||
      Boolean(body.contact_email) ||
      Boolean(body.contact_youlistify) ||
      Boolean(applicationUrl);
    if (!hasResponseMethod) {
      return NextResponse.json({ error: "Choose at least one way for people to respond." }, { status: 400 });
    }
    if (!userId && !contactEmailAddress) {
      return NextResponse.json({ error: "Please enter an email so you can manage this post after creating your account." }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await admin
      .from("work_posts")
      .insert({
        user_id: userId,
        post_type: postType,
        title,
        description,
        category: String(body.category || "").trim() || null,
        city: String(body.city || "").trim() || null,
        state: String(body.state || "").trim() || null,
        zip_code: String(body.zip_code || "").trim() || null,
        remote: Boolean(body.remote),
        pay_type: payType,
        pay_amount: body.pay_amount === "" || body.pay_amount == null ? null : Number(body.pay_amount),
        contact_call: Boolean(body.contact_call),
        contact_text: Boolean(body.contact_text),
        contact_email: Boolean(body.contact_email),
        contact_youlistify: Boolean(body.contact_youlistify),
        contact_phone: contactPhone || null,
        contact_email_address: contactEmailAddress || null,
        application_url: applicationUrl || null,
        status: "active"
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Could not create post" }, { status: 500 });
    }

    return NextResponse.json({ post: { id: data.id, user_id: userId } });
  } catch (error) {
    console.error("Create work post failed:", error);
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
