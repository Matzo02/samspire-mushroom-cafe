"use client";

import { useRef, useState } from "react";
import { MENU, SIGNATURES, TAG_LABELS, rupee, type MenuCategory, type Tag } from "@/data/menu";

const CATEGORIES: MenuCategory[] = [{ id: "picks", label: "Chef's picks", items: SIGNATURES }, ...MENU];

// "veg" is the default, so it gets no badge; neither does "chef" inside the Chef's picks tab
const badgeTags = (tags: Tag[], categoryId: string) =>
  tags.filter((t) => t !== "veg" && !(t === "chef" && categoryId === "picks"));

export function MenuTabs() {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id);
  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow/Home/End move between tabs (WAI-ARIA tabs pattern)
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = CATEGORIES.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActiveId(CATEGORIES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Menu categories">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            id={`tab-${c.id}`}
            className="tab"
            role="tab"
            aria-selected={c.id === active.id}
            aria-controls="menu-panel"
            tabIndex={c.id === active.id ? 0 : -1}
            onClick={() => setActiveId(c.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="menu__list" id="menu-panel" role="tabpanel" tabIndex={0} aria-labelledby={`tab-${active.id}`} key={active.id}>
        {active.items.map((it, i) => (
          <article className="item" key={it.name} style={{ animationDelay: `${i * 40}ms` }}>
            <h3>
              {it.name}
              {badgeTags(it.tags, active.id).map((t) => (
                <span key={t} className={`tag tag--${t}`}>
                  {TAG_LABELS[t]}
                </span>
              ))}
            </h3>
            <span className="item__price">{rupee(it.price)}</span>
            <p>{it.desc}</p>
          </article>
        ))}
      </div>
    </>
  );
}
