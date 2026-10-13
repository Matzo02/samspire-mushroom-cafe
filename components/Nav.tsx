"use client";

import { useEffect, useState } from "react";
import { Mushroom } from "./Mushroom";
import { SITE } from "@/data/site";

const LINKS = [
  { href: "#story", label: "Our Story" },
  { href: "#menu", label: "Menu" },
  { href: "#why", label: "Why Mushrooms" },
  { href: "#visit", label: "Visit" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}`} id="top">
      <div className="wrap nav__inner">
        <a className="brand" href="#top" aria-label="Samspire home">
          <Mushroom className="brand__mark" />
          <span>{SITE.name}</span>
        </a>
        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
        <nav id="nav-links" className={`nav__links${open ? " is-open" : ""}`}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>
              {l.label}
            </a>
          ))}
          <a className="btn btn--small" href={SITE.dineout} target="_blank" rel="noopener" onClick={close}>
            Book a table
          </a>
        </nav>
      </div>
    </header>
  );
}
