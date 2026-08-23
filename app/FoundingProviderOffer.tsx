"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

function makeMount(id: string, anchor: Element, position: "beforebegin" | "afterend" | "beforeend") {
  const existing = document.getElementById(id);
  if (existing) return existing;
  const mount = document.createElement("div");
  mount.id = id;
  anchor.insertAdjacentElement(position, mount);
  return mount;
}

function OfferCard({ compact = false, showButton = true }: { compact?: boolean; showButton?: boolean }) {
  return (
    <section style={{ maxWidth: "1040px", margin: compact ? "14px auto 18px" : "28px auto", padding: "0 20px", boxSizing: "border-box" }}>
      <div
        style={{
          background: "linear-gradient(135deg,#f5f3ff,#ffffff)",
          border: "1px solid #ddd8ff",
          borderRadius: compact ? "14px" : "18px",
          padding: compact ? "12px 18px" : "18px 22px",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(79,70,229,.07)",
        }}
      >
        <div style={{ color: "#5b4cf0", fontWeight: 800, fontSize: compact ? "12px" : "14px", letterSpacing: ".04em", marginBottom: "4px" }}>
          FOUNDING PROVIDER OFFER 🎉
        </div>
        <div style={{ color: "#182033", fontWeight: 800, fontSize: compact ? "18px" : "22px", marginBottom: compact ? "3px" : "6px" }}>
          Founding Providers List Free
        </div>
        <div style={{ color: "#667085", fontSize: compact ? "13px" : "15px", lineHeight: 1.5 }}>
          Your first 3 months are free. No commissions, no fees per lead, and no credit card required.
          {!compact && " After your free period, you can choose to continue with one simple annual membership. The annual price will be clearly disclosed before any charge."}
        </div>
        {showButton && (
          <a
            href="/list-service"
            style={{
              display: "inline-block",
              marginTop: compact ? "8px" : "12px",
              padding: compact ? "8px 15px" : "10px 18px",
              borderRadius: "10px",
              background: "#5b4cf0",
              color: "white",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: compact ? "13px" : "15px",
            }}
          >
            Become a Founding Provider
          </a>
        )}
      </div>
    </section>
  );
}

export default function FoundingProviderOffer() {
  const pathname = usePathname();
  const [topTarget, setTopTarget] = useState<HTMLElement | null>(null);
  const [lowerTarget, setLowerTarget] = useState<HTMLElement | null>(null);
  const [listingTarget, setListingTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (pathname === "/") {
      const place = () => {
        const header = document.querySelector("header.topbar");
        if (header) setTopTarget(makeMount("founding-offer-top", header, "afterend"));

        const heading = Array.from(document.querySelectorAll("h1,h2,h3"))
          .find((el) => el.textContent?.trim() === "Tell us what you're looking for.");
        const section = heading?.closest("section");
        if (section) setLowerTarget(makeMount("founding-offer-lower", section, "beforebegin"));
      };

      place();
      const observer = new MutationObserver(place);
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }

    if (pathname === "/list-service") {
      const place = () => {
        const heading = Array.from(document.querySelectorAll("h1"))
          .find((el) => el.textContent?.trim() === "List your service");
        const form = heading?.closest("main")?.querySelector("form");
        if (form) setListingTarget(makeMount("founding-offer-listing", form, "beforebegin"));
      };

      place();
      const observer = new MutationObserver(place);
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [pathname]);

  return (
    <>
      {pathname === "/" && topTarget && createPortal(<OfferCard compact />, topTarget)}
      {pathname === "/" && lowerTarget && createPortal(<OfferCard />, lowerTarget)}
      {pathname === "/list-service" && listingTarget && createPortal(<OfferCard showButton={false} />, listingTarget)}
    </>
  );
}
