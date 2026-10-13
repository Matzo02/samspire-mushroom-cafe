export function Mushroom({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M24 34c0 10-2 18-4 22h24c-2-4-4-12-4-22z" fill="var(--stem)" />
      <path d="M4 34C4 18 17 6 32 6s28 12 28 28c0 2-2 3-4 3H8c-2 0-4-1-4-3z" fill="var(--cap)" />
      <circle cx="20" cy="22" r="4" fill="var(--spot)" />
      <circle cx="36" cy="15" r="3" fill="var(--spot)" />
      <circle cx="46" cy="26" r="4.5" fill="var(--spot)" />
      <circle cx="30" cy="28" r="2.5" fill="var(--spot)" />
    </svg>
  );
}
