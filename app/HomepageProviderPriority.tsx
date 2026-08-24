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
      }

      const listLink = document.querySelector<HTMLAnchorElement>(".header-actions .list-link");
      if (listLink && listLink.textContent !== "List Your Service") {
        listLink.textContent = "List Your Service";
      }
    };

    placeProviderSection();
    const observer = new MutationObserver(placeProviderSection);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
