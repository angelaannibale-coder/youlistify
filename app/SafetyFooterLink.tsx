"use client";

import { usePathname } from "next/navigation";

export default function SafetyFooterLink() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <div
      style={{
        textAlign: "center",
        padding: "18px 20px 26px",
        background: "#fff",
        borderTop: "1px solid #eef0f5",
      }}
    >
      <a
        href="/safety"
        style={{
          color: "#5b4df5",
          fontWeight: 800,
          textDecoration: "none",
          fontSize: "16px",
        }}
      >
        Safety &amp; Resources
      </a>
    </div>
  );
}
