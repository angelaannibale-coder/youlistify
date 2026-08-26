"use client";

import { useEffect } from "react";

const STORAGE_KEY = "youlistify_pending_provider_notification";

export default function NewProviderNotificationBridge() {
  useEffect(() => {
    if (window.location.pathname !== "/list-service") return;

    let sending = false;

    function captureListingForm() {
      const form = document.querySelector("form") as HTMLFormElement | null;
      if (!form) return;

      const inputs = Array.from(form.querySelectorAll("input, select, textarea")) as Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
      const byPlaceholder = (placeholder: string) =>
        (inputs.find((el) => el instanceof HTMLInputElement && el.placeholder === placeholder) as HTMLInputElement | undefined)?.value?.trim() || "";

      const checkedServices = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
        .map((checkbox) => checkbox.closest("label")?.textContent?.trim() || "")
        .filter(Boolean)
        .filter((label) => !/Hourly rate|Flat rate|Contact for pricing/i.test(label));

      const selects = Array.from(form.querySelectorAll("select")) as HTMLSelectElement[];
      const stateSelect = selects.find((select) => select.querySelector('option[value="FL"]'));
      const modeSelect = selects.find((select) => ["local", "remote", "both"].includes(select.value));

      const payload = {
        name: [byPlaceholder("First name"), byPlaceholder("Last name")].filter(Boolean).join(" "),
        businessName: byPlaceholder("Business name (optional)"),
        phone: byPlaceholder("Phone"),
        email: byPlaceholder("Email"),
        city: byPlaceholder("City"),
        state: stateSelect?.value || "",
        serviceMode: modeSelect?.value || "",
        services: checkedServices,
        capturedAt: Date.now(),
      };

      if (payload.name && payload.email) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    }

    async function maybeNotify() {
      if (sending) return;
      const successHeading = Array.from(document.querySelectorAll("h1, h2")).find((el) =>
        el.textContent?.includes("Your listing has been created!")
      );
      if (!successHeading) return;

      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      let payload: any;
      try {
        payload = JSON.parse(raw);
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      if (payload.notified || Date.now() - Number(payload.capturedAt || 0) > 30 * 60 * 1000) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      sending = true;
      payload.notified = true;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      try {
        const response = await fetch("/api/admin/new-provider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          payload.notified = false;
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
          console.error("New provider admin notification failed");
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        payload.notified = false;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        console.error("New provider admin notification failed", error);
      } finally {
        sending = false;
      }
    }

    const onSubmit = () => captureListingForm();
    document.addEventListener("submit", onSubmit, true);

    const observer = new MutationObserver(() => maybeNotify());
    observer.observe(document.body, { childList: true, subtree: true });
    maybeNotify();

    return () => {
      document.removeEventListener("submit", onSubmit, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
