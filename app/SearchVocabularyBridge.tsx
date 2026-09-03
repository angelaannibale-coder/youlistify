"use client";

import { useEffect } from "react";
import { queryRequestsRemote } from "./searchVocabulary";

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
      const wantsRemote = queryRequestsRemote(serviceInput.value);
      const needsRemoteToggle = wantsRemote && !!remoteInput && !remoteInput.checked;
      if (needsRemoteToggle && remoteInput) remoteInput.click();
      return needsRemoteToggle;
    };

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

    searchButton?.addEventListener("pointerdown", onSearchPointerDown, true);
    form.addEventListener("submit", onSubmit, true);

    return () => {
      searchButton?.removeEventListener("pointerdown", onSearchPointerDown, true);
      form.removeEventListener("submit", onSubmit, true);
    };
  }, []);
  return null;
}
