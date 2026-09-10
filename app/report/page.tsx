"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

const supportEmails = ["support@youlistify.com", "hello@youlistify.com"];
const supportEmailText = supportEmails.join(", ");

export default function ReportPage() {
  const [details, setDetails] = useState({ type: "listing", title: "", url: "", id: "" });
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [concern, setConcern] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [copiedAction, setCopiedAction] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") === "post" ? "post" : "listing";
    setDetails({
      type,
      title: params.get("title") || "",
      url: params.get("url") || "",
      id: params.get("id") || ""
    });
  }, []);

  const typeLabel = details.type === "post" ? "post" : "listing";
  const reportText = useMemo(() => {
    return [
      `Report type: ${typeLabel}`,
      `Title: ${details.title || "Not provided"}`,
      `Link: ${details.url || "Not provided"}`,
      details.id ? `ID: ${details.id}` : "",
      "",
      `Reporter name: ${reporterName || "Not provided"}`,
      `Reporter email: ${reporterEmail || "Not provided"}`,
      "",
      "Concern:",
      concern || "Not provided"
    ].filter(Boolean).join("\n");
  }, [concern, details.id, details.title, details.url, reporterEmail, reporterName, typeLabel]);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!concern.trim()) {
      setError("Please describe the concern.");
      return;
    }

    if (reporterEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())) {
      setError("Please enter a valid email address, or leave it blank.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeLabel,
          title: details.title,
          url: details.url,
          id: details.id,
          reporterName: reporterName.trim(),
          reporterEmail: reporterEmail.trim(),
          concern: concern.trim()
        })
      });

      if (!response.ok) {
        let result: any = {};
        try {
          result = await response.json();
        } catch {}
        setError(result.error || "The report could not be sent yet. Please try again.");
        setSending(false);
        return;
      }

      setSending(false);
      setSent(true);
    } catch {
      setSending(false);
      setError("The report could not be sent yet. Please try again.");
    }
  }

  async function copyReportDetails() {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopiedAction("details");
      window.setTimeout(() => setCopiedAction(""), 2000);
    } catch {
      const input = document.createElement("textarea");
      input.value = reportText;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedAction("details");
      window.setTimeout(() => setCopiedAction(""), 2000);
    }
  }

  async function copySupportEmail() {
    try {
      await navigator.clipboard.writeText(supportEmailText);
    } catch {
      const input = document.createElement("textarea");
      input.value = supportEmailText;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopiedAction("email");
    window.setTimeout(() => setCopiedAction(""), 2000);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb", padding: "40px 18px", fontFamily: "Arial,sans-serif" }}>
      <section style={{ maxWidth: 680, margin: "0 auto", background: "white", borderRadius: 24, padding: "clamp(24px,5vw,42px)", boxShadow: "0 12px 35px rgba(0,0,0,.07)" }}>
        <a href={details.url || "/"} style={{ color: "#5b4df5", fontWeight: 800, textDecoration: "none" }}>Back to {typeLabel}</a>
        {sent ? (
          <div style={{ textAlign: "center", padding: "28px 0 8px" }}>
            <h1 style={{ margin: "0 0 12px", color: "#171b36", fontSize: "clamp(32px,6vw,44px)" }}>Report sent</h1>
            <p style={{ color: "#667085", lineHeight: 1.6, fontSize: 17 }}>Thanks for helping keep YouListify useful and safe. Support now has the exact {typeLabel} link and your note.</p>
            <a href={details.url || "/"} style={{ display: "inline-block", marginTop: 16, background: "#5b4df5", color: "white", padding: "13px 18px", borderRadius: 11, textDecoration: "none", fontWeight: 800 }}>Done</a>
          </div>
        ) : (
          <>
            <p style={{ margin: "28px 0 8px", color: "#5b4df5", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>YouListify support</p>
            <h1 style={{ margin: "0 0 12px", color: "#171b36", fontSize: "clamp(34px,7vw,48px)", lineHeight: 1.08 }}>Report this {typeLabel}</h1>
            <p style={{ color: "#667085", lineHeight: 1.65, fontSize: 17, marginTop: 0 }}>Tell us what looks unsafe, inaccurate, spammy, or abusive. This form includes the exact {typeLabel} you came from.</p>

            <div style={{ background: "#f8f8fb", border: "1px solid #e4e7ef", borderRadius: 16, padding: 16, margin: "22px 0" }}>
              <p style={{ margin: "0 0 6px", color: "#667085", fontWeight: 800 }}>Reporting</p>
              <p style={{ margin: 0, color: "#171b36", fontWeight: 900, fontSize: 18 }}>{details.title || `This ${typeLabel}`}</p>
              {details.url && <p style={{ margin: "8px 0 0", color: "#667085", wordBreak: "break-word", fontSize: 14 }}>{details.url}</p>}
            </div>

            <form onSubmit={submitReport}>
              <input value={reporterName} onChange={event => setReporterName(event.target.value)} placeholder="Your name (optional)" style={field} />
              <input value={reporterEmail} onChange={event => setReporterEmail(event.target.value)} type="email" placeholder="Your email (optional)" style={field} />
              <textarea value={concern} onChange={event => setConcern(event.target.value)} placeholder="What should YouListify review?" rows={6} style={{ ...field, minHeight: 150, resize: "vertical" }} />
              {error && <p style={{ color: "#b42318", fontWeight: 800, lineHeight: 1.4, margin: "0 0 12px" }}>{error}</p>}
              <button type="submit" disabled={sending} style={{ width: "100%", background: "#5b4df5", color: "white", padding: "14px 18px", borderRadius: 11, border: 0, fontWeight: 900, fontSize: 16, cursor: "pointer" }}>{sending ? "Sending..." : "Send report"}</button>
            </form>

            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              <button type="button" onClick={copyReportDetails} style={secondaryButton}>{copiedAction === "details" ? "Report details copied" : "Copy report details"}</button>
              <button type="button" onClick={copySupportEmail} style={secondaryButton}>{copiedAction === "email" ? "YouListify email copied" : "Copy YouListify email"}</button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

const field = { width: "100%", boxSizing: "border-box" as const, padding: 13, border: "1px solid #d1d5db", borderRadius: 10, fontSize: 16, marginBottom: 12 };
const secondaryButton = { padding: "13px 18px", borderRadius: 11, border: "1px solid #d9dce7", textDecoration: "none", fontWeight: 800, color: "#4f46e5", background: "white", cursor: "pointer" };
