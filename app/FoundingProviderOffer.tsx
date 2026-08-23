"use client";

import { usePathname } from "next/navigation";

export default function FoundingProviderOffer() {
  const pathname = usePathname();
  const show = pathname === "/" || pathname === "/list-service";
  if (!show) return null;

  return (
    <section
      style={{
        maxWidth: pathname === "/list-service" ? "760px" : "1040px",
        margin: pathname === "/list-service" ? "24px auto -40px" : "26px auto",
        padding: "0 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg,#f5f3ff,#ffffff)",
          border: "1px solid #ddd8ff",
          borderRadius: "18px",
          padding: "18px 22px",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(79,70,229,.07)",
        }}
      >
        <div style={{ color: "#5b4cf0", fontWeight: 800, fontSize: "14px", letterSpacing: ".04em", marginBottom: "5px" }}>
          FOUNDING PROVIDER OFFER 🎉
        </div>
        <div style={{ color: "#182033", fontWeight: 800, fontSize: "22px", marginBottom: "6px" }}>
          Founding Providers List Free
        </div>
        <div style={{ color: "#667085", fontSize: "15px", lineHeight: 1.55 }}>
          List your services free for your first 3 months. No commissions. No fees per lead. No credit card required.
          After your free period, you can choose to continue with one simple annual membership. The annual price will be clearly disclosed before any charge.
        </div>
        {pathname === "/" && (
          <a
            href="/list-service"
            style={{
              display: "inline-block",
              marginTop: "12px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#5b4cf0",
              color: "white",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Become a Founding Provider
          </a>
        )}
      </div>
    </section>
  );
}
