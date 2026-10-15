"use client";

import { useEffect, useRef } from "react";

// Mounts the 3D growing-mushroom scene behind the hero. Three.js is loaded on
// demand, and only when the pre-paint check in the layout turned on `.motion`
// (WebGL available, no reduced-motion preference). Until the first frame is
// drawn, the SVG mushrooms stay visible.
export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>(".hero");
    const stage = hero?.querySelector<HTMLElement>(".hero__stage");
    const art = hero?.querySelector<HTMLElement>(".hero__art");
    if (!root.classList.contains("motion") || !canvas || !hero || !stage || !art) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;
    const fallBack = () => root.classList.remove("motion");

    import("./hero/scene")
      .then(({ createHeroScene }) => {
        if (cancelled) return;
        dispose = createHeroScene({
          canvas, hero, stage, art,
          note: hero.querySelector<HTMLElement>(".hero__note"),
          onReady: () => hero.classList.add("is-live"),
        }).dispose;
      })
      .catch(fallBack);

    return () => {
      cancelled = true;
      dispose?.();
      hero.classList.remove("is-live");
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />;
}
