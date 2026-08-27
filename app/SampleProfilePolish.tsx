"use client";

import { useEffect } from "react";

export default function SampleProfilePolish() {
  useEffect(() => {
    function polishExampleLink() {
      const link = document.querySelector<HTMLAnchorElement>("a.example-profile-link");
      if (link) {
        Object.assign(link.style, {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "8px",
          padding: "13px 18px",
          borderRadius: "12px",
          background: "white",
          color: "#3f35c8",
          fontWeight: "800",
          textDecoration: "none",
          boxShadow: "0 8px 22px rgba(0,0,0,.16)"
        });
        link.textContent = "See an Example Profile →";
      }
    }

    function markSampleModal() {
      document.querySelectorAll<HTMLElement>(".modal").forEach((modal) => {
        const name = modal.querySelector("h2")?.textContent?.trim();
        if (name !== "Alex Morgan") return;
        if (!modal.querySelector("[data-sample-profile-notice]")) {
          const notice = document.createElement("div");
          notice.setAttribute("data-sample-profile-notice", "true");
          notice.textContent = "SAMPLE PROFILE — for demonstration only";
          Object.assign(notice.style, {
            display: "inline-block",
            marginBottom: "12px",
            padding: "7px 11px",
            borderRadius: "999px",
            background: "#f1efff",
            color: "#5546e8",
            fontSize: "12px",
            fontWeight: "800"
          });
          const head = modal.querySelector(".modal-head");
          modal.insertBefore(notice, head || modal.firstChild);
        }
      });
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const modal = target.closest<HTMLElement>(".modal");
      if (!modal || modal.querySelector("h2")?.textContent?.trim() !== "Alex Morgan") return;

      const action = target.closest<HTMLElement>("a,button");
      if (!action || action.classList.contains("close")) return;
      const label = action.textContent?.trim() || "";

      if (label.includes("View Full Listing")) {
        event.preventDefault();
        event.stopPropagation();
        alert("This is a sample YouListify profile. It shows what a real provider listing can look like.");
        window.location.href = "/sample-provider";
        return;
      }

      if (label.includes("Share profile") || label.includes("Call") || label.includes("Text") || label.includes("Email") || label.includes("Contact through YouListify")) {
        event.preventDefault();
        event.stopPropagation();
        alert("This is a sample YouListify profile. These actions work on real provider listings.");
      }
    }

    polishExampleLink();
    markSampleModal();
    const observer = new MutationObserver(() => {
      polishExampleLink();
      markSampleModal();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", handleClick, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
