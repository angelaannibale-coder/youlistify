import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const postId = Number(body?.postId);
    const senderName = String(body?.senderName || "").trim();
    const senderEmail = String(body?.senderEmail || "").trim();
    const message = String(body?.message || "").trim();

    if (!postId || !senderName || !senderEmail || !message) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    if (senderName.length > 120 || senderEmail.length > 254 || message.length > 5000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !anonKey) return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });

    const publicClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: post, error: postError } = await publicClient
      .from("work_posts")
      .select("id,title,user_id,status,contact_youlistify,contact_email_address")
      .eq("id", postId)
      .maybeSingle();

    if (postError) return NextResponse.json({ error: `Could not verify this post: ${postError.message}`, code: postError.code }, { status: 500 });
    if (!post) return NextResponse.json({ error: "This work post could not be found" }, { status: 404 });
    if (post.status !== "active") return NextResponse.json({ error: `This post is currently ${post.status} and is not accepting new messages` }, { status: 409 });
    if (!post.contact_youlistify) return NextResponse.json({ error: "Contact through YouListify is turned off for this post" }, { status: 409 });

    const { error: insertError } = await publicClient.from("work_post_messages").insert({
      work_post_id: post.id,
      sender_name: senderName,
      sender_email: senderEmail,
      message
    });
    if (insertError) return NextResponse.json({ error: insertError.message, code: insertError.code }, { status: 500 });

    const recipients = new Set<string>();
    if (post.contact_email_address) recipients.add(post.contact_email_address);

    if (serviceRoleKey && post.user_id) {
      try {
        const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
        const { data: ownerData } = await admin.auth.admin.getUserById(post.user_id);
        if (ownerData.user?.email) recipients.add(ownerData.user.email);
      } catch (error) {
        console.error("Could not resolve owner email", error);
      }
    }

    let notificationSent = false;
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && recipients.size > 0) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "YouListify <messages@youlistify.com>",
          to: Array.from(recipients),
          reply_to: senderEmail,
          subject: `New YouListify message from ${senderName}`,
          html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#182033"><h2>New message through YouListify</h2><p><strong>For:</strong> ${escapeHtml(post.title)}</p><p><strong>From:</strong> ${escapeHtml(senderName)}</p><p><strong>Reply email:</strong> ${escapeHtml(senderEmail)}</p><p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g,"<br>")}</p><hr/><p>This message was sent privately through YouListify.</p><p><a href="https://youlistify.com/dashboard" style="display:inline-block;background:#5b4df5;color:white;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Open My Dashboard</a></p></div>`
        })
      });
      notificationSent = response.ok;
      if (!response.ok) console.error("Resend work notification failed", await response.text());
    }

    return NextResponse.json({ ok: true, notificationSent });
  } catch (error) {
    console.error("work-message route failed", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'\"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char] || char));
}
