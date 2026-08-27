"use client";

import { useEffect } from "react";

export default function ReviewDisplayCleanup() {
  useEffect(() => {
    let observer: MutationObserver | null = null;

    function cleanZeroReviews() {
      document.querySelectorAll<HTMLElement>("article.provider").forEach((card) => {
        const rating = card.querySelector<HTMLElement>(".meta > span:first-child");
        if (!rating) return;
        const text = (rating.textContent || "").replace(/\s+/g, " ").trim();
        if (/★\s*0(?:\.0+)?\s*\(0\)/.test(text)) {
          rating.style.display = "none";
        }
      });

      document.querySelectorAll<HTMLElement>(".modal-rating").forEach((rating) => {
        const text = (rating.textContent || "").replace(/\s+/g, " ").trim();
        if (/★\s*0(?:\.0+)?\s*·\s*0\s+reviews?/i.test(text)) {
          rating.style.display = "none";
        }
      });
    }

    cleanZeroReviews();
    observer = new MutationObserver(cleanZeroReviews);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer?.disconnect();
  }, []);

  return null;
}
