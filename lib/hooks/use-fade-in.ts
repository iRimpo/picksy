"use client";

import { useEffect } from "react";

export function useFadeIn() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document
      .querySelectorAll(".fade-in-section")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
