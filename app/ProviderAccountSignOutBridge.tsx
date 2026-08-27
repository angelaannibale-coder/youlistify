"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProviderAccountSignOutBridge() {
  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;

    async function signOut() {
      await supabase.auth.signOut();
      window.location.href = "/";
    }

    function addButton(container: HTMLElement, marker: string) {
      if (container.querySelector(`[data-youlistify-signout="${marker}"]`)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Sign out";
      button.setAttribute("data-youlistify-signout", marker);
      button.style.border = "1px solid #ddd";
      button.style.background = "white";
      button.style.color = "#374151";
      button.style.padding = "10px 16px";
      button.style.borderRadius = "10px";
      button.style.cursor = "pointer";
      button.style.fontWeight = "600";
      button.style.marginLeft = "10px";
      button.addEventListener("click", signOut);
      container.appendChild(button);
    }

    async function apply() {
      if (cancelled) return;
      const path = window.location.pathname;
      if (!path.startsWith("/dashboard/edit") && !path.startsWith("/provider/")) return;

      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;

      if (path.startsWith("/dashboard/edit")) {
        const backLink = Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).find((a) =>
          (a.textContent || "").includes("Back to Dashboard")
        );
        const topRow = backLink?.parentElement as HTMLElement | null;
        if (topRow) addButton(topRow, "edit");
        return;
      }

      if (path.startsWith("/provider/")) {
        const backLink = Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).find((a) =>
          (a.textContent || "").includes("Back to Edit Listing")
        );
        if (!backLink) return;
        let row = backLink.parentElement as HTMLElement | null;
        if (!row) return;
        if (!row.dataset.youlistifyOwnerNav) {
          const wrapper = document.createElement("div");
          wrapper.dataset.youlistifyOwnerNav = "true";
          wrapper.style.display = "flex";
          wrapper.style.alignItems = "center";
          wrapper.style.justifyContent = "space-between";
          wrapper.style.gap = "12px";
          wrapper.style.flexWrap = "wrap";
          backLink.parentNode?.insertBefore(wrapper, backLink);
          wrapper.appendChild(backLink);
          row = wrapper;
        }
        addButton(row, "profile");
      }
    }

    apply();
    observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
