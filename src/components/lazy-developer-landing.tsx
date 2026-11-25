"use client";

import { useEffect } from "react";
import { lazyDeveloperMarkup } from "@/components/lazy-developer-markup";

export default function LazyDeveloperLanding() {
  useEffect(() => {
    const faqButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".faq-question")
    );

    function setFaq(button: HTMLButtonElement, open: boolean) {
      const answer = document.getElementById(
        button.getAttribute("aria-controls") ?? ""
      );
      button.setAttribute("aria-expanded", String(open));
      if (answer) answer.hidden = !open;
    }

    faqButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const willOpen = button.getAttribute("aria-expanded") !== "true";
        faqButtons.forEach((other) => setFaq(other, false));
        if (willOpen) setFaq(button, true);
      });
    });

    const menu = document.getElementById("menu-dialog");
    const menuToggle = document.getElementById("menu-toggle");

    function openMenu() {
      if (!menu) return;
      menu.hidden = false;
      menuToggle?.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      menu.querySelector<HTMLButtonElement>(".menu-close")?.focus();
    }

    function closeMenu() {
      if (!menu || menu.hidden) return;
      menu.hidden = true;
      menuToggle?.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      menuToggle?.focus();
    }

    menuToggle?.addEventListener("click", openMenu);
    menu?.querySelectorAll("[data-close-menu]").forEach((element) => {
      element.addEventListener("click", closeMenu);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);

    document.querySelectorAll<HTMLElement>("[data-scroll]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = document.querySelector<HTMLElement>(
          button.getAttribute("data-scroll") ?? ""
        );
        if (!target) return;
        closeMenu();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    const cookieBanner = document.getElementById("cookie-banner");
    const cookieKey = "tld-cookie-choice";

    try {
      if (localStorage.getItem(cookieKey)) cookieBanner?.setAttribute("hidden", "");
    } catch {
      /* Storage may be unavailable; keep the banner visible. */
    }

    document.querySelectorAll<HTMLButtonElement>("[data-cookie]").forEach((button) => {
      button.addEventListener("click", () => {
        try {
          localStorage.setItem(
            cookieKey,
            button.getAttribute("data-cookie") ?? ""
          );
        } catch {
          /* Ignore storage failures. */
        }
        cookieBanner?.setAttribute("hidden", "");
      });
    });

    document
      .getElementById("cookie-preferences")
      ?.addEventListener("click", () => {
        cookieBanner?.removeAttribute("hidden");
      });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, []);

  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: lazyDeveloperMarkup }} />;
}
