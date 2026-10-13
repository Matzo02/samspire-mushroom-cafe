"use client";

import { useEffect } from "react";

// Clicking any mushroom button or tab releases a puff of spores
export function SporeBurst() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(".btn, .tab");
      if (!target) return;
      for (let i = 0; i < 10; i++) {
        const spore = document.createElement("span");
        const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
        const dist = 30 + Math.random() * 40;
        spore.className = "spore-burst";
        spore.style.left = `${e.clientX}px`;
        spore.style.top = `${e.clientY}px`;
        spore.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
        spore.style.setProperty("--dy", `${Math.sin(angle) * dist - 20}px`);
        document.body.appendChild(spore);
        spore.addEventListener("animationend", () => spore.remove());
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
