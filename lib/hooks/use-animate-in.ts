"use client";

import { useEffect } from "react";

const ANIM_SELECTOR = ".fade-in-section, .anim-left, .anim-right, .anim-scale";

export function useAnimateIn() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    document.querySelectorAll(ANIM_SELECTOR).forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

// Keep old name as alias for backward compat
export { useAnimateIn as useFadeIn };
