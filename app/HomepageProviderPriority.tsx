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
        const headings = Array.from(document.querySelectorAll("h1,h2,h3"));
        const browseHeading = headings.find((el) =>
          /browse (by )?(service|categor)/i.test(el.textContent?.trim() || "")
        );
        const browseSection = browseHeading?.closest("section");

        if (browseSection && browseSection.nextElementSibling !== providerSection) {
          browseSection.insertAdjacentElement("afterend", providerSection);
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
