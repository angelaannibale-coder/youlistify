"use client";

import { useEffect } from "react";
import { SEARCH_VOCABULARY, normalizeSearch, queryRequestsRemote } from "./searchVocabulary";

function canonicalService(query: string) {
  const q = normalizeSearch(query);
  if (!q) return null;

  let best: { name: string; score: number } | null = null;
  for (const [name, aliases] of Object.entries(SEARCH_VOCABULARY)) {
    const phrases = [name, ...aliases].map(normalizeSearch);
    for (const phrase of phrases) {
      let score = 0;
      if (q === phrase) score = 100;
      else if (q.includes(phrase)) score = 80 + Math.min(15, phrase.length / 4);
      else if (phrase.includes(q) && q.length >= 4) score = 55;
      else {
        const qWords = q.split(" ").filter(w => w.length > 2);
        const pWords = phrase.split(" ").filter(w => w.length > 2);
        const overlap = qWords.filter(w => pWords.some(p => p === w || (w.length >= 5 && (p.startsWith(w) || w.startsWith(p))))).length;
        if (overlap >= 2) score = 45 + overlap * 5;
      }
      if (score && (!best || score > best.score)) best = { name, score };
    }
  }
  return best && best.score >= 50 ? best.name : null;
}

function setReactInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export default function SearchVocabularyBridge() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const form = document.querySelector("form.search-card") as HTMLFormElement | null;
    if (!form) return;
    let resubmitting = false;

    const onSubmit = (event: Event) => {
      if (resubmitting) {
        resubmitting = false;
        return;
      }

      const inputs = form.querySelectorAll("input");
      const serviceInput = inputs[0] as HTMLInputElement | undefined;
      const remoteInput = Array.from(inputs).find((el) => (el as HTMLInputElement).type === "checkbox") as HTMLInputElement | undefined;
      if (!serviceInput) return;

      const original = serviceInput.value;
      const canonical = canonicalService(original);
      const wantsRemote = queryRequestsRemote(original);
      const needsServiceRewrite = !!canonical && normalizeSearch(canonical) !== normalizeSearch(original);
      const needsRemoteToggle = wantsRemote && !!remoteInput && !remoteInput.checked;
      if (!needsServiceRewrite && !needsRemoteToggle) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (needsServiceRewrite && canonical) setReactInput(serviceInput, canonical);
      if (needsRemoteToggle && remoteInput) {
        remoteInput.click();
      }

      window.setTimeout(() => {
        resubmitting = true;
        form.requestSubmit();
      }, 40);
    };

    form.addEventListener("submit", onSubmit, true);
    return () => form.removeEventListener("submit", onSubmit, true);
  }, []);

  return null;
}
