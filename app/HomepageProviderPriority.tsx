"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function HomepageProviderPriority() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const placeProviderSection = () => {
      const providerSection = document.querySelector("section.provider-cta");
      if (providerSection) {
        const heroSection = document.querySelector("section.hero");

        if (heroSection && heroSection.nextElementSibling !== providerSection) {
          heroSection.insertAdjacentElement("afterend", providerSection);
        }

        const exampleLink = providerSection.querySelector<HTMLAnchorElement>(".example-profile-link");
        if (exampleLink) {
          Object.assign(exampleLink.style, {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "12px",
            padding: "13px 18px",
            borderRadius: "12px",
            background: "white",
            color: "#3f35c8",
            fontWeight: "800",
            textDecoration: "none",
            boxShadow: "0 8px 22px rgba(0,0,0,.16)"
          });
        }
      }

      const sampleCard = document.querySelector<HTMLElement>(".profile-card");
      if (sampleCard && !sampleCard.querySelector("[data-home-sample-badge]")) {
        const badge = document.createElement("div");
        badge.setAttribute("data-home-sample-badge", "true");
        badge.textContent = "SAMPLE PROFILE";
        Object.assign(badge.style, {
          display: "flex",
          width: "max-content",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
          padding: "9px 26px",
          borderRadius: "999px",
          background: "#4f46e5",
          color: "white",
          fontSize: "13px",
          fontWeight: "900",
          letterSpacing: ".03em",
          boxShadow: "0 6px 16px rgba(79,70,229,.22)"
        });
        sampleCard.insertBefore(badge, sampleCard.firstChild);
      }

      const listLink = document.querySelector<HTMLAnchorElement>(".header-actions .list-link");
      if (listLink && listLink.textContent !== "List Your Service") {
        listLink.textContent = "List Your Service";
      }
    };

    const openSampleProfile = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLButtonElement>(".profile-card .profile-bottom button");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.href = "/sample-provider";
    };

    placeProviderSection();
    const observer = new MutationObserver(placeProviderSection);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", openSampleProfile, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", openSampleProfile, true);
    };
  }, [pathname]);

  return null;
}
