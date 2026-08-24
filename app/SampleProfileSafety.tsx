"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SampleProfileSafety() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const explainSample = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      alert("This is a sample YouListify profile. Real provider listings let customers call, text, email, or contact providers directly.");
    };

    const polish = () => {
      // Homepage hero sample card.
      const heroCard = document.querySelector(".profile-card");
      if (heroCard && heroCard.textContent?.includes("Alex Morgan")) {
        const title = heroCard.querySelector(".profile-title");
        if (title && !title.querySelector("[data-sample-badge]")) {
          const badge = document.createElement("span");
          badge.setAttribute("data-sample-badge", "true");
          badge.textContent = "Sample Profile";
          badge.style.cssText = "display:inline-block;width:max-content;margin-top:5px;padding:4px 8px;border-radius:999px;background:#f1efff;color:#5546e8;font-size:11px;font-weight:800;";
          title.appendChild(badge);
        }

        const callButton = Array.from(heroCard.querySelectorAll("button")).find((button) =>
          /call now/i.test(button.textContent || "")
        );
        if (callButton && !callButton.hasAttribute("data-sample-safe")) {
          callButton.setAttribute("data-sample-safe", "true");
          callButton.textContent = "View sample";
          callButton.addEventListener("click", explainSample, true);
        }
      }

      // If the fallback Alex sample ever appears in search results or its popup,
      // clearly label it and prevent fake phone/text/email actions.
      const containers = Array.from(document.querySelectorAll("article.provider, .modal"));
      containers.forEach((container) => {
        if (!container.textContent?.includes("Alex Morgan")) return;

        const heading = container.querySelector("h2,h3");
        if (heading && !container.querySelector("[data-sample-badge]")) {
          const badge = document.createElement("span");
          badge.setAttribute("data-sample-badge", "true");
          badge.textContent = "Sample Profile";
          badge.style.cssText = "display:inline-block;margin-left:8px;padding:4px 8px;border-radius:999px;background:#f1efff;color:#5546e8;font-size:11px;font-weight:800;vertical-align:middle;";
          heading.appendChild(badge);
        }

        container.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"], a[href^="sms:"], a[href^="mailto:"]').forEach((link) => {
          if (link.hasAttribute("data-sample-safe")) return;
          link.setAttribute("data-sample-safe", "true");
          link.removeAttribute("href");
          link.style.cursor = "pointer";
          link.addEventListener("click", explainSample, true);
        });
      });
    };

    polish();
    const observer = new MutationObserver(polish);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
