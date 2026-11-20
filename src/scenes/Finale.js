import { CONTENT } from "../content.js";
import { RESTART } from "../lib/env.js";
import { createFinalLetter } from "../components/Letter.js";

export function renderFinale(container, { next, fx }) {
  const { finale } = CONTENT;

  container.innerHTML = `
    <section class="scene scene--finale" tabindex="-1">
      <span class="eyebrow" data-reveal>${finale.eyebrow}</span>
      <h2 class="finale__title" data-reveal>${finale.title}</h2>

      <div class="stage stage--letter" data-reveal></div>

      <button type="button" class="btn btn--ghost" data-reveal data-next>
        ${RESTART}<span>${finale.button}</span>
      </button>
    </section>
  `;

  const btn = container.querySelector("[data-next]");
  createFinalLetter(container.querySelector(".stage"), {
    fx,
    onOpen: () => btn.classList.add("is-visible"),
  });
  btn.addEventListener("click", next);
}
