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
    <section className={compact ? "yl-free-offer yl-free-offer-compact" : "yl-free-offer"}>
      <div className="yl-free-offer-card">
        <div className="yl-free-offer-copy">
          <div className="yl-free-offer-title">🎉 Create Your Free Listing</div>
          <div className="yl-free-offer-subtitle">Free for your first 3 months</div>
          <div className="yl-free-offer-detail">
            No commissions. No fees per lead. No credit card required.
            {!compact && " After your free period, you can choose whether to continue for one simple yearly fee. The price will be clearly disclosed before any charge."}
          </div>
        </div>
        {showButton && <a href="/list-service" className="yl-free-offer-button">Create Your Free Listing</a>}
      </div>
    </section>
  );
}

export default function FoundingProviderOffer() {
  const pathname = usePathname();
  const [providerTarget, setProviderTarget] = useState<HTMLElement | null>(null);
  const [listingTarget, setListingTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (pathname === "/") {
      const place = () => {
        const providerSection = document.querySelector("section.provider-cta");
        if (providerSection) setProviderTarget(makeMount("founding-offer-provider", providerSection, "afterend"));
      };
      place();
      const observer = new MutationObserver(place);
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }

    if (pathname === "/list-service") {
      const place = () => {
        const heading = Array.from(document.querySelectorAll("h1")).find((el) => el.textContent?.trim() === "List your service");
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
      {pathname === "/" && providerTarget && createPortal(<OfferCard compact />, providerTarget)}
      {pathname === "/list-service" && listingTarget && createPortal(<OfferCard showButton={false} />, listingTarget)}
    </>
  );
}
