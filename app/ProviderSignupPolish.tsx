"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ProviderSignupPolish() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/list-service") return;

    const polish = () => {
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
    const observer = new MutationObserver(polish);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
