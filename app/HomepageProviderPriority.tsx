"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function HomepageProviderPriority() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const placeProviderSection = () => {
      const hero = document.querySelector("section.hero");
      const providerSection = document.querySelector("section.provider-cta");
      if (hero && providerSection && hero.nextElementSibling !== providerSection) {
        hero.insertAdjacentElement("afterend", providerSection);
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
