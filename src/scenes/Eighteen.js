import { CONTENT } from "../content.js";
import { ARROW } from "../lib/env.js";
import { createGerberaGarden } from "../components/GerberaGarden.js";

export function renderEighteen(container, { next, fx }) {
  const { flowers } = CONTENT;

  container.innerHTML = `
    <section class="scene scene--eighteen" tabindex="-1">
      <span class="eyebrow" data-reveal>${flowers.eyebrow}</span>
      <h2 class="title" data-reveal>${flowers.title}</h2>
      <p class="lead" data-reveal>${flowers.description}</p>

      <div class="stage stage--garden" data-reveal></div>

      <button type="button" class="btn btn--primary" data-reveal data-next>
        <span>${flowers.button}</span>${ARROW}
      </button>
    </section>
  `;

  const btn = container.querySelector("[data-next]");
  createGerberaGarden(container.querySelector(".stage"), {
    total: flowers.total,
    wishes: flowers.wishes,
    completeText: flowers.complete,
    fx,
    onComplete: () => btn.classList.add("is-ready"),
  });
  btn.addEventListener("click", next);
}
