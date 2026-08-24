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

    const initialsFor = (displayName: string) => {
      const words = displayName
        .replace(/[^A-Za-z0-9\s.]/g, " ")
        .split(/\s+/)
        .map((word) => word.replace(/\./g, ""))
        .filter(Boolean);
      if (words.length === 0) return "P";
      if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    };

    const polish = () => {
      document.querySelectorAll<HTMLAnchorElement>(".category-head a").forEach((link) => {
        if (/view all categories|browse all categories/i.test(link.textContent || "")) link.remove();
      });

      // Always derive provider-card initials from the exact public name shown on that card.
      document.querySelectorAll<HTMLElement>("article.provider").forEach((card) => {
        const name = card.querySelector("h3")?.textContent?.trim();
        const avatar = card.querySelector<HTMLElement>(".provider-visual > span:first-child");
        if (name && avatar) avatar.textContent = initialsFor(name);
      });

      // Keep popup initials synchronized with the exact public name shown there too.
      document.querySelectorAll<HTMLElement>(".modal").forEach((modal) => {
        const popupName = modal.querySelector(".modal-head h2")?.textContent?.trim();
        const popupAvatar = modal.querySelector<HTMLElement>(".modal-head .avatar.large");
        if (popupName && popupAvatar) popupAvatar.textContent = initialsFor(popupName);

        const heading = modal.querySelector("h2");
        if (!heading || !/^Contact /i.test(heading.textContent || "")) return;
        const fields = modal.querySelectorAll<HTMLElement>("input, textarea");
        fields.forEach((field) => {
          field.style.display = "block";
          field.style.width = "100%";
          field.style.boxSizing = "border-box";
          field.style.border = "1px solid #dfe3eb";
          field.style.borderRadius = "14px";
          field.style.padding = "14px 16px";
          field.style.marginTop = "12px";
          field.style.background = "#fff";
          field.style.outline = "none";
          field.style.fontSize = "16px";
        });
        const textarea = modal.querySelector<HTMLTextAreaElement>("textarea");
        if (textarea) {
          textarea.style.minHeight = "130px";
          textarea.style.resize = "vertical";
        }
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
        const sampleButton = Array.from(heroCard.querySelectorAll("button")).find((button) => /call now|view sample|view full sample profile/i.test(button.textContent || ""));
        if (sampleButton && !sampleButton.hasAttribute("data-sample-safe")) {
          sampleButton.setAttribute("data-sample-safe", "true");
          sampleButton.textContent = "View profile";
          sampleButton.addEventListener("click", explainSample, true);
        } else if (sampleButton) sampleButton.textContent = "View profile";
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
