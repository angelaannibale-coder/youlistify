"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { SEARCH_VOCABULARY, coreServiceQuery, normalizeSearch, queryRequestsMobile, queryRequestsRemote } from "./searchVocabulary";

function rankedServices(query: string) {
  const q = normalizeSearch(query);
  if (!q) return [] as { name: string; score: number }[];
  const scores = new Map<string, number>();
  for (const [name, aliases] of Object.entries(SEARCH_VOCABULARY)) {
    let best = 0;
    for (const rawPhrase of [name, ...aliases]) {
      const phrase = normalizeSearch(rawPhrase);
      let score = 0;
      if (q === phrase) score = 100;
      else if (phrase.startsWith(q) && q.length >= 3) score = 80;
      else if (q.includes(phrase)) score = 78 + Math.min(12, phrase.length / 5);
      else if (phrase.includes(q) && q.length >= 4) score = 62;
      else {
        const qWords = q.split(" ").filter(w => w.length > 2);
        const pWords = phrase.split(" ").filter(w => w.length > 2);
        const overlap = qWords.filter(w => pWords.some(p => p === w || (w.length >= 5 && (p.startsWith(w) || w.startsWith(p))))).length;
        if (overlap >= 2) score = 48 + overlap * 6;
      }
      if (score > best) best = score;
    }
    if (best >= 50) scores.set(name, best);
  }
  return [...scores.entries()].map(([name, score]) => ({ name, score })).sort((a, b) => b.score - a.score).slice(0, 5);
}

function setReactInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function SearchVocabularyBridge() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const form = document.querySelector("form.search-card") as HTMLFormElement | null;
    if (!form) return;
    const inputs = form.querySelectorAll("input");
    const serviceInput = inputs[0] as HTMLInputElement | undefined;
    const remoteInput = Array.from(inputs).find((el) => (el as HTMLInputElement).type === "checkbox") as HTMLInputElement | undefined;
    const searchButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const serviceLabel = serviceInput?.closest("label") as HTMLElement | null;
    if (!serviceInput || !serviceLabel) return;

    let resubmitting = false;
    let knownServices: string[] = [];
    let mobileMenu: HTMLDivElement | null = null;

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    supabase.from("services").select("name").order("name", { ascending: true }).then(({ data }) => {
      knownServices = (data || []).map((item: any) => item.name).filter(Boolean);
    });

    const removeMobileMenu = () => {
      mobileMenu?.remove();
      mobileMenu = null;
    };

    const mobileMatches = (query: string) => {
      const core = coreServiceQuery(query);
      if (!queryRequestsMobile(query) || core.length < 2) return [];
      const q = normalizeSearch(core);
      return knownServices
        .filter((name) => {
          const n = normalizeSearch(name);
          return n.startsWith(q) || n.split(" ").some((word) => word.startsWith(q)) || n.includes(q);
        })
        .slice(0, 10);
    };

    const showMobileSuggestions = () => {
      removeMobileMenu();
      const matches = mobileMatches(serviceInput.value);
      if (!matches.length) return;

      const menu = document.createElement("div");
      menu.setAttribute("data-mobile-service-suggestions", "true");
      Object.assign(menu.style, {
        position: "absolute",
        top: "100%",
        left: "0",
        right: "0",
        zIndex: "40",
        background: "white",
        border: "1px solid #e6e9f0",
        borderRadius: "14px",
        marginTop: "6px",
        maxHeight: "260px",
        overflowY: "auto",
        boxShadow: "0 12px 30px rgba(0,0,0,.12)"
      });

      matches.forEach((name) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = name;
        Object.assign(button.style, {
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "11px 14px",
          border: "0",
          background: "white",
          cursor: "pointer"
        });
        button.addEventListener("pointerdown", (event) => event.preventDefault());
        button.addEventListener("click", () => {
          setReactInput(serviceInput, name);
          removeMobileMenu();
        });
        menu.appendChild(button);
      });

      serviceLabel.appendChild(menu);
      mobileMenu = menu;
    };

    const canonicalForQuery = (query: string) => {
      const ranked = rankedServices(query)[0]?.name;
      if (ranked) return ranked;

      const core = coreServiceQuery(query);
      if (!core || !queryRequestsMobile(query)) return null;
      const q = normalizeSearch(core);
      return knownServices.find((name) => {
        const n = normalizeSearch(name);
        return n === q || n.startsWith(q) || q.startsWith(n);
      }) || null;
    };

    const applyCanonicalSearch = () => {
      const original = serviceInput.value;
      const canonical = canonicalForQuery(original);
      const wantsRemote = queryRequestsRemote(original);
      const needsServiceRewrite = !!canonical && normalizeSearch(canonical) !== normalizeSearch(original);
      const needsRemoteToggle = wantsRemote && !!remoteInput && !remoteInput.checked;
      if (needsServiceRewrite && canonical) setReactInput(serviceInput, canonical);
      if (needsRemoteToggle && remoteInput) remoteInput.click();
      removeMobileMenu();
      return needsServiceRewrite || needsRemoteToggle;
    };

    const onInput = () => {
      if (queryRequestsMobile(serviceInput.value)) {
        window.setTimeout(showMobileSuggestions, 0);
      } else {
        removeMobileMenu();
      }
    };

    const onBlur = () => window.setTimeout(removeMobileMenu, 120);
    const onSearchPointerDown = () => applyCanonicalSearch();

    const onSubmit = (event: Event) => {
      if (resubmitting) {
        resubmitting = false;
        return;
      }
      const changed = applyCanonicalSearch();
      if (!changed) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.setTimeout(() => {
        resubmitting = true;
        form.requestSubmit();
      }, 0);
    };

    serviceInput.addEventListener("input", onInput);
    serviceInput.addEventListener("focus", onInput);
    serviceInput.addEventListener("blur", onBlur);
    searchButton?.addEventListener("pointerdown", onSearchPointerDown, true);
    form.addEventListener("submit", onSubmit, true);

    return () => {
      removeMobileMenu();
      serviceInput.removeEventListener("input", onInput);
      serviceInput.removeEventListener("focus", onInput);
      serviceInput.removeEventListener("blur", onBlur);
      searchButton?.removeEventListener("pointerdown", onSearchPointerDown, true);
      form.removeEventListener("submit", onSubmit, true);
    };
  }, []);
  return null;
}
