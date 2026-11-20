import { gsap } from "gsap";
import { TAP, REDUCED_MOTION, centerOf } from "../lib/env.js";

// Tamaño relativo de cada órbita, duración de una vuelta y fase inicial.
const ORBITS = [
  { r: 0.44, dur: 34, phase: 0.05 },
  { r: 0.62, dur: 48, phase: 0.38 },
  { r: 0.8, dur: 64, phase: 0.62 },
  { r: 0.98, dur: 86, phase: 0.86 },
];

export function createGiftOrbits(container, { items = [], fx, onComplete } = {}) {
  const discovered = new Set();

  container.innerHTML = `
    <div class="orbits">
      <div class="system">
        <div class="system__glow"></div>
        ${items.map((item, i) => {
          const o = ORBITS[i % ORBITS.length];
          return `
          <div class="orbit" style="--r:${o.r}; --dur:${o.dur}s; --phase:${o.phase}">
            <div class="orbit__ring"></div>
            <div class="orbit__arm">
              <button type="button" class="orbit-node" data-id="${i}" aria-label="${item.orbit}: ${item.title}">
                <span class="orbit-node__inner">${item.label}</span>
              </button>
            </div>
          </div>`;
        }).join("")}
        <div class="system__core"><span>18</span></div>
      </div>

      <article class="glass-card discovery" aria-live="polite">
        <span class="discovery__eyebrow">SELECT A STAR IN ORBIT</span>
        <h3 class="discovery__title">Hidden messages</h3>
        <p class="discovery__text">${TAP} any of the four orbiting stars to reveal what is written in your sky.</p>
        <div class="discovery__dots" aria-hidden="true">
          ${items.map(() => "<i></i>").join("")}
        </div>
      </article>
    </div>
  `;

  const root = container.querySelector(".orbits");
  const nodes = container.querySelectorAll(".orbit-node");
  const eyebrow = container.querySelector(".discovery__eyebrow");
  const title = container.querySelector(".discovery__title");
  const text = container.querySelector(".discovery__text");
  const dots = container.querySelectorAll(".discovery__dots i");
  const copy = [eyebrow, title, text];

  function reveal(node) {
    const id = Number(node.dataset.id);
    const data = items[id];
    const isNew = !discovered.has(id);
    discovered.add(id);

    nodes.forEach((n) => n.classList.remove("is-selected"));
    node.classList.add("is-selected", "is-discovered");
    dots[id].classList.add("is-on");

    const { x, y } = centerOf(node);
    fx?.sparkles.burst(x, y, { count: isNew ? 30 : 12, power: 0.9 });

    const swap = () => {
      eyebrow.textContent = `${data.orbit.toUpperCase()} · ${discovered.size}/${items.length}`;
      title.textContent = data.title;
      text.textContent = data.message;
    };

    if (REDUCED_MOTION) swap();
    else {
      gsap.timeline()
        .to(copy, { opacity: 0, y: -8, duration: 0.2, stagger: 0.03, ease: "power2.in" })
        .add(swap)
        .fromTo(copy, { opacity: 0, y: 12, filter: "blur(6px)" }, {
          opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.07, ease: "power3.out",
        });
    }

    if (isNew && discovered.size === items.length) {
      root.classList.add("is-complete");
      fx?.sky.shower(4);
      onComplete?.();
    }
  }

  nodes.forEach((node) => node.addEventListener("click", () => reveal(node)));
}
