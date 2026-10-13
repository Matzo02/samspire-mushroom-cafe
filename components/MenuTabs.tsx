"use client";

import { useState } from "react";
import { MENU, TAG_LABELS, rupee, type Tag } from "@/data/menu";

// "veg" is the default, so only the other tags get a badge
const badgeTags = (tags: Tag[]) => tags.filter((t) => t !== "veg");

export function MenuTabs() {
  const [activeId, setActiveId] = useState(MENU[0].id);
  const active = MENU.find((c) => c.id === activeId) ?? MENU[0];

  return (
    <>
      <div className="tabs" role="tablist">
        {MENU.map((c) => (
          <button
            key={c.id}
            id={`tab-${c.id}`}
            className="tab"
            role="tab"
            aria-selected={c.id === active.id}
            aria-controls="menu-panel"
            onClick={() => setActiveId(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="menu__list" id="menu-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`} key={active.id}>
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
