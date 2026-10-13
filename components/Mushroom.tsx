// Four mushroom shapes, coloured through CSS vars (--cap, --stem, --spot)
// so the same drawing works on light and dark sections.
export type Variant = "amanita" | "bell" | "flat" | "button";

const SHAPES: Record<Variant, { cap: string; stem: string; spots: [number, number, number][] }> = {
  amanita: {
    cap: "M4 34C4 18 17 6 32 6s28 12 28 28c0 2-2 3-4 3H8c-2 0-4-1-4-3z",
    stem: "M24 34c0 10-2 18-4 22h24c-2-4-4-12-4-22z",
    spots: [[20, 22, 4], [36, 15, 3], [46, 26, 4.5], [30, 28, 2.5]],
  },
  bell: {
    cap: "M18 32C18 15 25 5 32 5s14 10 14 27q-14 5-28 0z",
    stem: "M29 32c0 10-1 19-3 25h12c-2-6-3-15-3-25z",
    spots: [[27, 18, 2.5], [37, 22, 3], [32, 11, 2]],
  },
  flat: {
    cap: "M5 31c0-9 12-15 27-15s27 6 27 15c0 2-2 3-4 3H9c-2 0-4-1-4-3z",
    stem: "M26 34c0 9-1 16-3 22h18c-2-6-3-13-3-22z",
    spots: [[16, 25, 2.5], [28, 21, 3], [42, 22, 2.5], [50, 28, 2]],
  },
  button: {
    cap: "M14 37c0-12 8-20 18-20s18 8 18 20c0 2-1 3-3 3H17c-2 0-3-1-3-3z",
    stem: "M25 40c0 7-1 12-2 16h18c-1-4-2-9-2-16z",
    spots: [[25, 27, 3], [38, 26, 2.5], [32, 33, 2]],
  },
};

export function Mushroom({ className, variant = "amanita" }: { className?: string; variant?: Variant }) {
  const s = SHAPES[variant];
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d={s.stem} fill="var(--stem)" />
      <path d={s.cap} fill="var(--cap)" />
      {s.spots.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="var(--spot)" />
      ))}
    </svg>
  );
}
