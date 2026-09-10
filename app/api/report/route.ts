import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body?.type === "post" ? "post" : "listing";
    const title = String(body?.title || "").trim();
    const url = String(body?.url || "").trim();
    const id = String(body?.id || "").trim();
    const reporterName = String(body?.reporterName || "").trim();
    const reporterEmail = String(body?.reporterEmail || "").trim();
    const concern = String(body?.concern || "").trim();

    if (!concern) return NextResponse.json({ error: "Please describe the concern" }, { status: 400 });
    if (concern.length > 5000) return NextResponse.json({ error: "The report is too long" }, { status: 400 });
    if (reporterName.length > 120 || reporterEmail.length > 254) return NextResponse.json({ error: "Reporter details are too long" }, { status: 400 });
    if (reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: "Server configuration incomplete" }, { status: 500 });

    const reportLines = [
      `Report type: ${type}`,
      `Title: ${title || "Not provided"}`,
      `Link: ${url || "Not provided"}`,
      id ? `ID: ${id}` : "",
      "",
      `Reporter name: ${reporterName || "Not provided"}`,
      `Reporter email: ${reporterEmail || "Not provided"}`,
      "",
      "Concern:",
      concern
    ].filter(Boolean);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "YouListify <messages@youlistify.com>",
        to: ["support@youlistify.com"],
        reply_to: reporterEmail || undefined,
        subject: `Report YouListify ${type}${title ? `: ${title}` : ""}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#182033"><h2>Report YouListify ${escapeHtml(type)}</h2><p><strong>Title:</strong> ${escapeHtml(title || "Not provided")}</p><p><strong>Link:</strong> ${url ? `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>` : "Not provided"}</p>${id ? `<p><strong>ID:</strong> ${escapeHtml(id)}</p>` : ""}<p><strong>Reporter name:</strong> ${escapeHtml(reporterName || "Not provided")}</p><p><strong>Reporter email:</strong> ${escapeHtml(reporterEmail || "Not provided")}</p><p><strong>Concern:</strong></p><p>${escapeHtml(concern).replace(/\n/g, "<br>")}</p><hr/><pre style="white-space:pre-wrap;background:#f8f8fb;padding:12px;border-radius:10px">${escapeHtml(reportLines.join("\n"))}</pre></div>`
      })
    });

    if (!response.ok) {
      console.error("Resend report failed", await response.text());
      return NextResponse.json({ error: "The report could not be sent yet" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("report route failed", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] || char));
}
