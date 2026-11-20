import { CONTENT } from "../content.js";
import { ARROW } from "../lib/env.js";
import { createScorpiusConstellation } from "../components/Constellation.js";

export function renderScorpius(container, { next, fx }) {
  const { scorpius } = CONTENT;

  container.innerHTML = `
    <section class="scene scene--scorpius" tabindex="-1">
      <span class="eyebrow" data-reveal>${scorpius.eyebrow}</span>
      <h2 class="title" data-reveal>${scorpius.title}</h2>
      <p class="lead" data-reveal>${scorpius.description}</p>

      <div class="stage stage--scorpius" data-reveal></div>

      <button type="button" class="btn btn--primary" data-reveal data-next>
        <span>${scorpius.button}</span>${ARROW}
      </button>
    </section>
  `;

  const btn = container.querySelector("[data-next]");
  createScorpiusConstellation(container.querySelector(".stage"), {
    fx,
    onComplete: () => btn.classList.add("is-ready"),
  });
  btn.addEventListener("click", next);
}
