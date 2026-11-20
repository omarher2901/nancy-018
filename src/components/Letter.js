import { gsap } from "gsap";
import { PROJECT, CONTENT } from "../content.js";
import { TAP, REDUCED_MOTION, centerOf } from "../lib/env.js";

export function createFinalLetter(container, { fx, onOpen } = {}) {
  const { finale } = CONTENT;

  container.innerHTML = `
    <div class="letter">
      <button type="button" class="envelope" aria-label="Open birthday letter">
        <span class="envelope__body">
          <span class="envelope__back"></span>
          <span class="envelope__peek"><i></i><i></i><i></i></span>
          <span class="envelope__pocket"></span>
          <span class="envelope__flap"></span>
          <span class="envelope__seal"><span>${PROJECT.name}</span></span>
        </span>
        <span class="envelope__caption">
          <span class="envelope__date">${PROJECT.birthday.toUpperCase()}</span>
          <span class="envelope__prompt">${TAP} to unseal your letter</span>
        </span>
      </button>

      <article class="paper" hidden>
        <header class="paper__header" data-line>
          <span>${PROJECT.birthday}</span>
          <span>♏︎ SCORPIUS</span>
        </header>

        <h3 class="paper__salutation" data-line>Para ${PROJECT.recipient},</h3>
        <p class="paper__body" data-line>${finale.description}</p>
        <p class="paper__body" data-line>${finale.letter}</p>

        <footer class="paper__footer" data-line>
          <span class="paper__sign">${finale.sign}</span>
          <span class="paper__signature">Tu universo · ${PROJECT.name}</span>
        </footer>
        <span class="paper__stamp" aria-hidden="true">18</span>
      </article>
    </div>
  `;

  const envelope = container.querySelector(".envelope");
  const flap = container.querySelector(".envelope__flap");
  const seal = container.querySelector(".envelope__seal");
  const peek = container.querySelector(".envelope__peek");
  const paper = container.querySelector(".paper");

  function showPaper() {
    envelope.hidden = true;
    paper.hidden = false;
    fx?.sparkles.confetti(110);
    fx?.sky.shower(8);
    onOpen?.();
    if (REDUCED_MOTION) return;
    gsap.fromTo(paper, { opacity: 0, y: 40, scale: 0.94, rotateX: 18 }, {
      opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1.1, ease: "expo.out",
    });
    gsap.fromTo(paper.querySelectorAll("[data-line]"), { opacity: 0, y: 14, filter: "blur(5px)" }, {
      opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.14, delay: 0.25, ease: "power3.out",
    });
  }

  envelope.addEventListener("click", () => {
    envelope.disabled = true;
    const { x, y } = centerOf(seal);
    fx?.sparkles.burst(x, y, { count: 50, power: 1.6, colors: ["#f49ac1", "#ffd2e4", "#f3e5ab", "#fff8e7"] });

    if (REDUCED_MOTION) return showPaper();

    gsap.timeline({ onComplete: showPaper })
      .to(seal, { scale: 1.25, duration: 0.15, ease: "power2.out" })
      .to(seal, { scale: 0, opacity: 0, rotate: 40, duration: 0.3, ease: "back.in(2)" })
      .to(flap, { rotateX: 180, duration: 0.7, ease: "power3.inOut" }, "-=0.05")
      .set(flap, { zIndex: 0 }, "-=0.35")
      .to(peek, { yPercent: -55, duration: 0.7, ease: "power3.out" }, "-=0.15")
      .to(envelope, { y: 30, opacity: 0, scale: 0.92, duration: 0.5, ease: "power2.in" }, "+=0.15");
  });
}
