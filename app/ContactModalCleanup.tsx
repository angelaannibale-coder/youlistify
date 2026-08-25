"use client";

import { useEffect } from "react";

export default function ContactModalCleanup() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const backdrops = Array.from(document.querySelectorAll<HTMLElement>(".modal-backdrop"));
      if (backdrops.length < 2) return;

      const contactBackdrop = backdrops.find((backdrop) => {
        const heading = backdrop.querySelector(".modal > h2")?.textContent || "";
        return /^Contact /i.test(heading.trim());
      });
      if (!contactBackdrop) return;

      const contactModal = contactBackdrop.querySelector<HTMLElement>(".modal");
      if (!contactModal) return;

      const clickedClose = !!target.closest(".close") && contactModal.contains(target.closest(".close"));
      const clickedBackdrop = target === contactBackdrop;
      if (!clickedClose && !clickedBackdrop) return;

      const providerBackdrop = backdrops.find((backdrop) => backdrop !== contactBackdrop);
      const providerClose = providerBackdrop?.querySelector<HTMLButtonElement>(".modal .close");

      if (providerClose) {
        window.setTimeout(() => providerClose.click(), 0);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
