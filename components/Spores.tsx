"use client";

import { useEffect, useState } from "react";
import { Mushroom } from "./Mushroom";

// Clicking any mushroom button or tab releases a puff of spores
export function SporeBurst() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(".btn, .tab, .to-top");
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

// Mushroom that pops up from the bottom corner once you scroll down
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <a href="#top" className={`to-top${show ? " is-visible" : ""}`} aria-label="Back to top" tabIndex={show ? 0 : -1}>
      <Mushroom />
    </a>
  );
}
