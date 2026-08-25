import { NextResponse } from "next/server";

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Email service is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.name) {
    return NextResponse.json({ ok: false, error: "Missing provider information." }, { status: 400 });
  }

  const services = Array.isArray(body.services) ? body.services.filter(Boolean) : [];
  const location = [body.city, body.state].filter(Boolean).join(", ");
  const recipient = process.env.ADMIN_NOTIFY_EMAIL || "hello@youlistify.com";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "YouListify <support@youlistify.com>",
      to: [recipient],
      subject: `New YouListify provider: ${body.businessName || body.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#17203a">
          <h1 style="margin-bottom:8px">New YouListify provider 🎉</h1>
          <p style="color:#667085;margin-top:0">A new provider listing was just created.</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:700">Provider</td><td>${esc(body.name)}</td></tr>
            ${body.businessName ? `<tr><td style="padding:8px 0;font-weight:700">Business</td><td>${esc(body.businessName)}</td></tr>` : ""}
            <tr><td style="padding:8px 0;font-weight:700">Email</td><td>${esc(body.email)}</td></tr>
            ${body.phone ? `<tr><td style="padding:8px 0;font-weight:700">Phone</td><td>${esc(body.phone)}</td></tr>` : ""}
            ${location ? `<tr><td style="padding:8px 0;font-weight:700">Location</td><td>${esc(location)}</td></tr>` : ""}
            ${body.serviceMode ? `<tr><td style="padding:8px 0;font-weight:700">Service mode</td><td>${esc(body.serviceMode)}</td></tr>` : ""}
            ${services.length ? `<tr><td style="padding:8px 0;font-weight:700;vertical-align:top">Services</td><td>${services.map(esc).join(", ")}</td></tr>` : ""}
          </table>
          <p style="margin-top:24px"><a href="https://youlistify.com" style="color:#5b4df5;font-weight:700">Open YouListify</a></p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Admin provider notification failed:", detail);
    return NextResponse.json({ ok: false, error: "Notification could not be sent." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
