"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function publicProviderName(p: any) {
  return p.business_name ||
    (p.name_display === "first"
      ? (p.name || "Provider")
      : p.name_display === "initial"
      ? `${p.name || "Provider"}${p.last_name ? " " + p.last_name.charAt(0) + "." : ""}`
      : ([p.name, p.last_name].filter(Boolean).join(" ") || "Provider"));
}

export default function ProfilePhotoBridge() {
  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;
    const photoByName = new Map<string, string>();

    function applyPhoto(el: HTMLElement, url: string) {
      el.style.backgroundImage = `url(${url})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.backgroundRepeat = "no-repeat";
      el.textContent = "";
    }

    function applyPhotos() {
      document.querySelectorAll("article.provider").forEach((card) => {
        const name = card.querySelector("h3")?.textContent?.trim();
        if (!name) return;
        const url = photoByName.get(name);
        if (!url) return;
        const avatar = card.querySelector(".provider-visual > span") as HTMLElement | null;
        if (avatar) applyPhoto(avatar, url);
      });

      document.querySelectorAll(".modal .modal-head").forEach((head) => {
        const name = head.querySelector("h2")?.textContent?.trim();
        if (!name) return;
        const url = photoByName.get(name);
        if (!url) return;
        const avatar = head.querySelector(".avatar.large") as HTMLElement | null;
        if (avatar) applyPhoto(avatar, url);
      });
    }

    async function loadPhotos() {
      const { data, error } = await supabase
        .from("Providers")
        .select("name,last_name,business_name,name_display,profile_photo");

      if (cancelled || error || !data) return;

      data.forEach((provider: any) => {
        if (provider.profile_photo) {
          photoByName.set(publicProviderName(provider), provider.profile_photo);
        }
      });

      applyPhotos();
      observer = new MutationObserver(applyPhotos);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    loadPhotos();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
