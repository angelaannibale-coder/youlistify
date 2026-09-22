import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function slugBase(name: string) {
  return (name || "provider").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendNewProviderEmail(providerData: Record<string, unknown>, services: string[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("New provider notification skipped: RESEND_API_KEY is missing.");
    return false;
  }

  if (!providerData.email || !providerData.name) {
    console.error("New provider notification skipped: provider email or name is missing.");
    return false;
  }

  const location = [providerData.city, providerData.state].filter(Boolean).join(", ");
  const recipient = process.env.ADMIN_NOTIFY_EMAIL || "hello@youlistify.com";
  const businessName = String(providerData.business_name || "").trim();
  const providerName = [providerData.name, providerData.last_name].filter(Boolean).join(" ").trim();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "YouListify <support@youlistify.com>",
      to: [recipient],
      subject: `New YouListify provider: ${businessName || providerName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#17203a">
          <h1 style="margin-bottom:8px">New YouListify provider</h1>
          <p style="color:#667085;margin-top:0">A new provider listing was just created.</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:700">Provider</td><td>${esc(providerName)}</td></tr>
            ${businessName ? `<tr><td style="padding:8px 0;font-weight:700">Business</td><td>${esc(businessName)}</td></tr>` : ""}
            <tr><td style="padding:8px 0;font-weight:700">Email</td><td>${esc(providerData.email)}</td></tr>
            ${providerData.phone ? `<tr><td style="padding:8px 0;font-weight:700">Phone</td><td>${esc(providerData.phone)}</td></tr>` : ""}
            ${location ? `<tr><td style="padding:8px 0;font-weight:700">Location</td><td>${esc(location)}</td></tr>` : ""}
            ${providerData.service_mode ? `<tr><td style="padding:8px 0;font-weight:700">Service mode</td><td>${esc(providerData.service_mode)}</td></tr>` : ""}
            ${services.length ? `<tr><td style="padding:8px 0;font-weight:700;vertical-align:top">Services</td><td>${services.map(esc).join(", ")}</td></tr>` : ""}
          </table>
          <p style="margin-top:24px"><a href="https://youlistify.com" style="color:#5b4df5;font-weight:700">Open YouListify</a></p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("New provider notification failed:", detail);
    return false;
  }

  return true;
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
    if (!body || !Array.isArray(body.service_ids) || body.service_ids.length === 0) {
      return NextResponse.json({ error: "Please choose a service." }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    let userId: string | null = null;
    let userEmail = "";

    if (token) {
      const authClient = createClient(supabaseUrl, anonKey);
      const { data: { user }, error: userError } = await authClient.auth.getUser(token);
      if (userError || !user?.id) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
      userId = user.id;
      userEmail = user.email || "";
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    if (userId) {
      const { data: existing } = await admin
        .from("Providers")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ error: "This signed-in account already has a service listing." }, { status: 409 });
      }
    }

    const providerData = {
      name: String(body.name || "").trim(),
      last_name: String(body.last_name || "").trim(),
      business_name: String(body.business_name || "").trim(),
      phone: String(body.phone || "").trim(),
      email: userEmail || String(body.email || "").trim(),
      contact_call: Boolean(body.contact_call),
      contact_text: Boolean(body.contact_text),
      contact_email: Boolean(body.contact_email),
      contact_youlistify: Boolean(body.contact_youlistify),
      available_now: Boolean(body.available_now),
      service_mode: String(body.service_mode || "").trim(),
      customer_comes_to_me: Boolean(body.customer_comes_to_me),
      mobile_service: Boolean(body.mobile_service),
      city: String(body.city || "").trim(),
      state: String(body.state || "").trim(),
      zip_code: String(body.zip_code || "").trim(),
      bio: String(body.bio || "").trim(),
      pricing_methods: Array.isArray(body.pricing_methods) ? body.pricing_methods.map(String) : [],
      starting_price: body.starting_price === "" || body.starting_price == null ? null : Number(body.starting_price),
      flat_price: body.flat_price === "" || body.flat_price == null ? null : Number(body.flat_price),
      name_display: String(body.name_display || "full"),
      user_id: userId,
      profile_active: true
    };

    const { data: provider, error: providerError } = await admin
      .from("Providers")
      .insert([providerData])
      .select("id")
      .single();

    if (providerError || !provider) {
      return NextResponse.json({ error: providerError?.message || "Could not create listing" }, { status: 500 });
    }

    const serviceIds = Array.from(new Set(body.service_ids.map(Number).filter(Number.isFinite)));
    const { error: serviceError } = await admin
      .from("provider_services")
      .insert(serviceIds.map((serviceId) => ({ provider_id: provider.id, service_id: serviceId })));

    if (serviceError) {
      await admin.from("Providers").delete().eq("id", provider.id);
      return NextResponse.json({ error: serviceError.message }, { status: 500 });
    }

    const { data: serviceRows, error: serviceNameError } = await admin
      .from("services")
      .select("name")
      .in("id", serviceIds);

    if (serviceNameError) {
      console.error("Could not load services for new provider notification:", serviceNameError.message);
    }

    const notificationSent = await sendNewProviderEmail(
      providerData,
      (serviceRows || []).map((service) => String(service.name || "")).filter(Boolean)
    );

    return NextResponse.json({
      provider: {
        id: provider.id,
        slug: `${slugBase(providerData.name)}-${provider.id}`
      },
      notificationSent
    });
  } catch (error) {
    console.error("Create listing failed:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
