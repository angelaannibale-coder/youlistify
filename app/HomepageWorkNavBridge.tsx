"use client";

import { useEffect } from "react";

export default function HomepageWorkNavBridge() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const actions = document.querySelector(".header-actions");
    if (!actions || actions.querySelector("[data-work-nav]")) return;

    const link = document.createElement("a");
    link.href = "/work";
    link.textContent = "Jobs / Gigs / Tasks";
    link.setAttribute("data-work-nav", "true");
    link.className = "work-nav-link";
    actions.insertBefore(link, actions.firstChild);

    return () => link.remove();
  }, []);

  return null;
}
