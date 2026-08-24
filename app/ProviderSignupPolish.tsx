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

    const markRequiredFields = () => {
      requiredFields.forEach(({ selector }) => {
        const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
        if (field) field.required = true;
      });

      const stateSelect = Array.from(document.querySelectorAll<HTMLSelectElement>("select"))
        .find((select) => Array.from(select.options).some((option) => option.textContent === "Select state"));
      if (stateSelect) stateSelect.required = true;
    };

    const validateBeforeSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.tagName !== "FORM") return;

      for (const { selector, message } of requiredFields) {
        const field = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
        if (field && !field.value.trim()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          alert(message);
          field.focus();
          field.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }

      const email = form.querySelector<HTMLInputElement>('input[placeholder="Email"]');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        event.preventDefault();
        event.stopImmediatePropagation();
        alert("Please enter a valid email address.");
        email.focus();
        return;
      }

      const stateSelect = Array.from(form.querySelectorAll<HTMLSelectElement>("select"))
        .find((select) => Array.from(select.options).some((option) => option.textContent === "Select state"));
      if (stateSelect && !stateSelect.value) {
        event.preventDefault();
        event.stopImmediatePropagation();
        alert("Please select your state.");
        stateSelect.focus();
        stateSelect.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      // The page's existing save handler separately requires at least one service.
      // service_mode always has Local / Remote / Both selected by default.
    };

    const polish = () => {
      markRequiredFields();

      const buttons = Array.from(document.querySelectorAll("button"));
      const createButton = buttons.find((button) => button.textContent?.trim() === "Create My Account");
      if (!createButton) return;

      createButton.textContent = "Create My Free Account";

      const main = createButton.closest("main");
      if (!main) return;

      const paragraphs = Array.from(main.querySelectorAll("p"));
      const benefitParagraph = paragraphs.find((p) =>
        p.textContent?.includes("Create your free provider account to manage your listing")
      );
      if (benefitParagraph) {
        benefitParagraph.textContent =
          "Create your free account so you can come back anytime to edit your listing, add services, update pricing, change availability, upload photos, and manage your profile.";
      }

      if (!main.querySelector("[data-existing-provider-signin]")) {
        const signIn = document.createElement("p");
        signIn.setAttribute("data-existing-provider-signin", "true");
        signIn.style.marginTop = "14px";
        signIn.style.fontSize = "14px";
        signIn.style.color = "#667085";
        signIn.innerHTML = 'Already have an account? <a href="/sign-in" style="color:#5b4cf0;font-weight:700;text-decoration:none">Sign in</a>';
        createButton.insertAdjacentElement("afterend", signIn);
      }
    };

    polish();
    document.addEventListener("submit", validateBeforeSubmit, true);
    const observer = new MutationObserver(polish);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.removeEventListener("submit", validateBeforeSubmit, true);
    };
  }, [pathname]);

  return null;
}
