"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ProviderSignupPolish() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/list-service") return;

    const requiredFields = [
      { selector: 'input[placeholder="First name"]', message: "Please enter your first name." },
      { selector: 'input[placeholder="Phone"]', message: "Please enter your phone number." },
      { selector: 'input[placeholder="Email"]', message: "Please enter your email address." },
      { selector: 'input[placeholder="City"]', message: "Please enter your city." },
      { selector: 'input[placeholder="ZIP code"]', message: "Please enter your ZIP code." },
      { selector: 'textarea[placeholder="Describe your services..."]', message: "Please tell customers about your services." },
    ];

    const findState = (root: ParentNode = document) => Array.from(root.querySelectorAll<HTMLSelectElement>("select")).find((select) => Array.from(select.options).some((option) => option.textContent === "Select state"));
    const findMode = (root: ParentNode = document) => Array.from(root.querySelectorAll<HTMLSelectElement>("select")).find((select) => Array.from(select.options).some((option) => option.value === "remote"));

    const polish = () => {
      requiredFields.forEach(({ selector }) => {
        const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
        if (field) field.required = true;
      });

      const state = findState();
      if (state) {
        state.required = true;
        state.style.minHeight = "54px";
        state.style.fontSize = "16px";
        state.style.fontWeight = "600";
        state.style.width = "100%";
        if (!state.previousElementSibling?.matches('[data-field-label="state"]')) {
          const label = document.createElement("div");
          label.dataset.fieldLabel = "state";
          label.textContent = "State";
          label.style.fontWeight = "700";
          label.style.color = "#344054";
          label.style.marginBottom = "6px";
          state.insertAdjacentElement("beforebegin", label);
        }
      }

      const mode = findMode();
      if (mode) {
        mode.style.minHeight = "54px";
        mode.style.fontSize = "16px";
        mode.style.fontWeight = "600";
        mode.style.width = "100%";
        document.querySelectorAll('[data-field-label="mode"]').forEach((label) => label.remove());
      }

      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
      const accountButton = buttons.find((button) => button.textContent?.trim() === "Create My Account");
      if (accountButton) accountButton.textContent = "Create My Free Account";
    };

    const validateBeforeSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.tagName !== "FORM") return;

      for (const { selector, message } of requiredFields) {
        const field = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
        if (field && !field.value.trim()) {
          event.preventDefault(); event.stopImmediatePropagation(); alert(message); field.focus(); field.scrollIntoView({ behavior: "smooth", block: "center" }); return;
        }
      }

      const email = form.querySelector<HTMLInputElement>('input[placeholder="Email"]');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        event.preventDefault(); event.stopImmediatePropagation(); alert("Please enter a valid email address."); email.focus(); return;
      }

      const state = findState(form);
      if (state && !state.value) {
        event.preventDefault(); event.stopImmediatePropagation(); alert("Please select your state."); state.focus(); state.scrollIntoView({ behavior: "smooth", block: "center" }); return;
      }

      const checkedService = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')).some((box) => !/Hourly rate|Flat rate|Contact for pricing/i.test(box.closest("label")?.textContent || ""));
      if (!checkedService) return;

      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submit && !submit.disabled) {
        submit.disabled = true;
        submit.dataset.originalText = submit.textContent || "Create Listing";
        submit.textContent = "Creating your listing…";
        submit.style.opacity = "0.72";
        submit.style.cursor = "wait";
        window.setTimeout(() => {
          if (document.body.contains(submit)) {
            submit.disabled = false;
            submit.textContent = submit.dataset.originalText || "Create Listing";
            submit.style.opacity = "1";
            submit.style.cursor = "pointer";
          }
        }, 12000);
      }
    };

    polish();
    document.addEventListener("submit", validateBeforeSubmit, true);
    const observer = new MutationObserver(polish);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); document.removeEventListener("submit", validateBeforeSubmit, true); };
  }, [pathname]);

  return null;
}
