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

    const openSampleProfile = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      window.location.href = "/sample-provider";
    };

    const polish = () => {
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

        const sampleButton = Array.from(heroCard.querySelectorAll("button")).find((button) =>
          /call now|view sample/i.test(button.textContent || "")
        );
        if (sampleButton && !sampleButton.hasAttribute("data-sample-safe")) {
          sampleButton.setAttribute("data-sample-safe", "true");
          sampleButton.textContent = "View Full Sample Profile";
          sampleButton.addEventListener("click", openSampleProfile, true);
        }
      }

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

        const fullListing = Array.from(container.querySelectorAll<HTMLAnchorElement>("a")).find((link) =>
          /view full listing/i.test(link.textContent || "")
        );
        if (fullListing && !fullListing.hasAttribute("data-sample-profile-link")) {
          fullListing.setAttribute("data-sample-profile-link", "true");
          fullListing.href = "/sample-provider";
        }
      });
    };

    polish();
    const observer = new MutationObserver(polish);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
