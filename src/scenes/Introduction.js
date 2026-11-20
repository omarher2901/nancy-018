import { gsap } from "gsap";
import { PROJECT, CONTENT } from "../content.js";
import { ARROW, REDUCED_MOTION } from "../lib/env.js";

export function renderIntroduction(container, { next }) {
  const { introduction } = CONTENT;
  const digits = [...PROJECT.name].map((d) => `<span class="intro__digit">${d}</span>`).join("");

  container.innerHTML = `
    <section class="scene scene--intro" tabindex="-1">
      <span class="eyebrow" data-reveal>${introduction.eyebrow}</span>

      <div class="intro__hero" data-reveal>
        <svg class="intro__orbit" viewBox="0 0 400 140" aria-hidden="true">
          <ellipse cx="200" cy="70" rx="190" ry="44" />
          <ellipse class="intro__orbit-faint" cx="200" cy="70" rx="160" ry="30" />
          <circle class="intro__planet" r="5">
            <animateMotion dur="11s" repeatCount="indefinite" path="M10,70 a190,44 0 1,0 380,0 a190,44 0 1,0 -380,0" />
          </circle>
          <circle class="intro__moon" r="2.5">
            <animateMotion dur="7s" repeatCount="indefinite" path="M360,70 a160,30 0 1,1 -320,0 a160,30 0 1,1 320,0" />
          </circle>
        </svg>
        <h1 class="intro__number" aria-label="${PROJECT.name}">${digits}</h1>
      </div>

      <h2 class="intro__title" data-reveal>${introduction.title}</h2>

      <span class="pill" data-reveal>
        <span class="pill__dot"></span>
        CREATED FOR ${PROJECT.recipient.toUpperCase()}
      </span>

      <p class="lead" data-reveal>${introduction.description}</p>

      <button type="button" class="btn btn--primary is-ready" data-reveal data-next>
        <span>${introduction.button}</span>${ARROW}
      </button>

      <span class="intro__foot" data-reveal>${PROJECT.birthday.toUpperCase()} · ♏︎ SCORPIUS</span>
    </section>
  `;

  if (!REDUCED_MOTION) {
    gsap.fromTo(container.querySelectorAll(".intro__digit"),
      { yPercent: 70, opacity: 0, filter: "blur(18px)", scale: 0.8 },
      { yPercent: 0, opacity: 1, filter: "blur(0px)", scale: 1, duration: 1.6, stagger: 0.14, ease: "expo.out", delay: 0.35 }
    );
  }

  container.querySelector("[data-next]").addEventListener("click", next);
}
