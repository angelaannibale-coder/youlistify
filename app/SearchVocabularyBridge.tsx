"use client";

import { useEffect } from "react";
import { SEARCH_VOCABULARY, normalizeSearch, queryRequestsRemote } from "./searchVocabulary";

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

function canonicalService(query: string) {
  return rankedServices(query)[0]?.name || null;
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
    if (!serviceInput) return;
    let resubmitting = false;

    const applyCanonicalSearch = () => {
      const original = serviceInput.value;
      const canonical = canonicalService(original);
      const wantsRemote = queryRequestsRemote(original);
      const needsServiceRewrite = !!canonical && normalizeSearch(canonical) !== normalizeSearch(original);
      const needsRemoteToggle = wantsRemote && !!remoteInput && !remoteInput.checked;
      if (needsServiceRewrite && canonical) setReactInput(serviceInput, canonical);
      if (needsRemoteToggle && remoteInput) remoteInput.click();
      return needsServiceRewrite || needsRemoteToggle;
    };

    // The homepage React UI owns the one visible autocomplete dropdown.
    // This bridge remains only for vocabulary normalization when a search is submitted.
    const onSearchPointerDown = () => {
      applyCanonicalSearch();
    };

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

    searchButton?.addEventListener("pointerdown", onSearchPointerDown, true);
    form.addEventListener("submit", onSubmit, true);
    return () => {
      searchButton?.removeEventListener("pointerdown", onSearchPointerDown, true);
      form.removeEventListener("submit", onSubmit, true);
    };
  }, []);
  return null;
}
