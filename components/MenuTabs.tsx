"use client";

import { useRef, useState } from "react";
import { MENU, TAG_LABELS, rupee, type Tag } from "@/data/menu";

// "veg" is the default, so only the other tags get a badge
const badgeTags = (tags: Tag[]) => tags.filter((t) => t !== "veg");

export function MenuTabs() {
  const [activeId, setActiveId] = useState(MENU[0].id);
  const active = MENU.find((c) => c.id === activeId) ?? MENU[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow/Home/End move between tabs (WAI-ARIA tabs pattern)
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = MENU.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActiveId(MENU[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Menu categories">
        {MENU.map((c, i) => (
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
              {badgeTags(it.tags).map((t) => (
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
