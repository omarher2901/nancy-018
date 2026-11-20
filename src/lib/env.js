const mq = (q) => window.matchMedia?.(q).matches ?? false;

export const REDUCED_MOTION = mq("(prefers-reduced-motion: reduce)");
export const FINE_POINTER = mq("(hover: hover) and (pointer: fine)");
export const TAP = FINE_POINTER ? "Click" : "Tap";

export const ARROW = `
  <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

export const RESTART = `
  <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

/** Centro de un elemento en coordenadas de viewport. */
export function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Botón "magnético": sigue sutilmente al cursor (solo en escritorio). */
export function magnetize(root) {
  if (!FINE_POINTER || REDUCED_MOTION) return;
  root.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.translate = `${x}px ${y}px`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.translate = "";
    });
  });
}
