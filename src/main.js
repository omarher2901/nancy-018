import "./styles/global.css";
import { gsap } from "gsap";
import { CHAPTERS } from "./content.js";
import { REDUCED_MOTION, FINE_POINTER, magnetize } from "./lib/env.js";
import { StarField } from "./components/StarField.js";
import { Sparkles } from "./components/Sparkles.js";
import { createHud } from "./components/Hud.js";
import { renderIntroduction } from "./scenes/Introduction.js";
import { renderScorpius } from "./scenes/Scorpius.js";
import { renderEighteen } from "./scenes/Eighteen.js";
import { renderDiscoveries } from "./scenes/Discoveries.js";
import { renderFinale } from "./scenes/Finale.js";

const SCENES = [
  { id: "intro", render: renderIntroduction },
  { id: "scorpius", render: renderScorpius },
  { id: "eighteen", render: renderEighteen },
  { id: "discoveries", render: renderDiscoveries },
  { id: "finale", render: renderFinale },
];

const app = document.querySelector("#app");
const sky = new StarField(document.querySelector("#starfield"));
const sparkles = new Sparkles(document.querySelector("#fx"));
const hud = createHud(document.querySelector("#hud"), CHAPTERS);
const fx = { sky, sparkles };

sky.start();

let busy = false;

/** Sale la escena actual, salto a hiperespacio y entra la siguiente. */
async function goTo(index) {
  if (busy) return;
  busy = true;

  const current = app.querySelector(".scene");
  if (current && !REDUCED_MOTION) {
    gsap.to(sky, { warp: 1, duration: 0.7, ease: "power2.in" });
    await gsap.to(current.querySelectorAll("[data-reveal]"), {
      opacity: 0,
      y: -24,
      scale: 0.98,
      filter: "blur(8px)",
      duration: 0.5,
      stagger: 0.04,
      ease: "power2.in",
    });
  }

  const scene = SCENES[index];
  document.body.dataset.scene = scene.id;
  window.scrollTo({ top: 0, behavior: "instant" });

  scene.render(app, {
    fx,
    next: () => goTo((index + 1) % SCENES.length),
  });
  hud.set(index);
  magnetize(app);

  const section = app.querySelector(".scene");
  section.focus({ preventScroll: true });

  if (REDUCED_MOTION) {
    busy = false;
    return;
  }

  gsap.to(sky, { warp: 0, duration: 1.4, ease: "power3.out", delay: current ? 0.05 : 0 });
  await gsap.fromTo(
    section.querySelectorAll("[data-reveal]"),
    { opacity: 0, y: 28, filter: "blur(10px)" },
    {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1,
      stagger: 0.09,
      ease: "expo.out",
      delay: current ? 0.15 : 0.3,
      clearProps: "filter,transform",
    }
  );
  busy = false;
}

// Brillo que sigue al cursor (solo escritorio).
if (FINE_POINTER && !REDUCED_MOTION) {
  const glow = document.querySelector(".cursor-glow");
  const xTo = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3" });
  const yTo = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3" });
  window.addEventListener("pointermove", (e) => {
    glow.classList.add("is-on");
    xTo(e.clientX);
    yTo(e.clientY);
  }, { passive: true });
}

// Espera a las fuentes (máx. 1.2 s) para que el título no "salte" al cargar.
Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1200))]).finally(() => {
  document.body.classList.add("is-loaded");
  goTo(0);
});
