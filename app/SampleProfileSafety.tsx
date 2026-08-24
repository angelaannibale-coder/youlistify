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
      alert("This is an example YouListify listing. Real provider listings let customers contact providers directly.");
    };

    const polish = () => {
      // All categories are already visible, so the old link to Available Now is redundant.
      document.querySelectorAll<HTMLAnchorElement>(".category-head a").forEach((link) => {
        if (/view all categories|browse all categories/i.test(link.textContent || "")) link.remove();
      });

      const heroCard = document.querySelector(".profile-card");
      if (heroCard && heroCard.textContent?.includes("Alex Morgan")) {
        const title = heroCard.querySelector(".profile-title");
        if (title && !title.querySelector("[data-sample-badge]")) {
          const badge = document.createElement("span");
          badge.setAttribute("data-sample-badge", "true");
          badge.textContent = "Example";
          badge.style.cssText = "display:inline-block;width:max-content;margin-top:4px;color:#777;font-size:10px;font-weight:600;letter-spacing:.02em;";
          title.appendChild(badge);
        }

        const sampleButton = Array.from(heroCard.querySelectorAll("button")).find((button) =>
          /call now|view sample|view full sample profile/i.test(button.textContent || "")
        );
        if (sampleButton && !sampleButton.hasAttribute("data-sample-safe")) {
          sampleButton.setAttribute("data-sample-safe", "true");
          sampleButton.textContent = "View profile";
          sampleButton.addEventListener("click", explainSample, true);
        } else if (sampleButton) {
          sampleButton.textContent = "View profile";
        }
      }

      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4"));
      const miniHeading = headings.find((el) => /your own.*mini.*site|mini.*site.*youlistify/i.test(el.textContent || ""));
      const miniSection = miniHeading?.closest("section,div");
      if (miniSection && !miniSection.querySelector("[data-example-profile-link]")) {
        const link = document.createElement("a");
        link.setAttribute("data-example-profile-link", "true");
        link.href = "/sample-provider";
        link.textContent = "See an Example Profile →";
        link.style.cssText = "display:inline-flex;align-items:center;justify-content:center;width:max-content;margin-top:18px;padding:11px 17px;background:#ffffff;color:#342b87;border-radius:999px;font-weight:800;font-size:15px;line-height:1.2;text-decoration:none;box-shadow:0 5px 16px rgba(0,0,0,.12);";
        miniSection.appendChild(link);
      }

      const containers = Array.from(document.querySelectorAll("article.provider, .modal"));
      containers.forEach((container) => {
        if (!container.textContent?.includes("Alex Morgan")) return;
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
