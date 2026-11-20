import { CONTENT } from "../content.js";
import { ARROW } from "../lib/env.js";
import { createGiftOrbits } from "../components/GiftOrbits.js";

export function renderDiscoveries(container, { next, fx }) {
  const { discoveries } = CONTENT;

  container.innerHTML = `
    <section class="scene scene--discoveries" tabindex="-1">
      <span class="eyebrow" data-reveal>${discoveries.eyebrow}</span>
      <h2 class="title" data-reveal>${discoveries.title}</h2>
      <p class="lead" data-reveal>${discoveries.description}</p>

      <div class="stage stage--orbits" data-reveal></div>

      <button type="button" class="btn btn--primary" data-reveal data-next>
        <span>${discoveries.button}</span>${ARROW}
      </button>
    </section>
  `;

  const btn = container.querySelector("[data-next]");
  createGiftOrbits(container.querySelector(".stage"), {
    items: discoveries.items,
    fx,
    onComplete: () => btn.classList.add("is-ready"),
  });
  btn.addEventListener("click", next);
}
