"use client";

import { usePathname } from "next/navigation";

export default function SafetyFooterLink() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  const linkStyle = { color: "#5b4df5", fontWeight: 750, textDecoration: "none", fontSize: "14px" } as const;

  return (
    <div style={{ textAlign: "center", padding: "16px 20px 26px", background: "#fff", borderTop: "1px solid #eef0f5" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "8px 16px" }}>
        <a href="/safety" style={linkStyle}>Safety &amp; Resources</a>
        <a href="/privacy" style={linkStyle}>Privacy Policy</a>
        <a href="/terms" style={linkStyle}>Terms of Use</a>
        <a href="/support" style={linkStyle}>Contact &amp; Support</a>
      </div>
    </div>
  );
}
