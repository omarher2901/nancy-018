import { gsap } from "gsap";
import { TAP, REDUCED_MOTION, centerOf } from "../lib/env.js";

const PALETTES = [
  { outer: ["#ffc1dc", "#e9679f"], inner: ["#fff1f7", "#f7a8c9"], center: "#5c3a21" },
  { outer: ["#ffd3c1", "#ec8a68"], inner: ["#fff3ec", "#f9bea6"], center: "#633d24" },
  { outer: ["#fff4c9", "#e6c35c"], inner: ["#fffdf2", "#f6e29b"], center: "#5c3a21" },
  { outer: ["#e9ddff", "#9d86e6"], inner: ["#faf6ff", "#cdbef7"], center: "#3f2a52" },
];

function gerbera(i) {
  const p = PALETTES[i % PALETTES.length];
  const outer = Array.from({ length: 16 }, (_, k) =>
    `<ellipse cx="50" cy="21" rx="5.6" ry="21" transform="rotate(${(360 / 16) * k} 50 50)" />`
  ).join("");
  const inner = Array.from({ length: 12 }, (_, k) =>
    `<ellipse cx="50" cy="28" rx="4" ry="14" transform="rotate(${(360 / 12) * k + 15} 50 50)" />`
  ).join("");

  return `
    <svg viewBox="0 0 100 100" class="gerbera__svg" aria-hidden="true">
      <defs>
        <radialGradient id="go${i}" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
          <stop offset=".25" stop-color="${p.outer[1]}" /><stop offset="1" stop-color="${p.outer[0]}" />
        </radialGradient>
        <radialGradient id="gi${i}" cx="50" cy="50" r="38" gradientUnits="userSpaceOnUse">
          <stop offset=".3" stop-color="${p.inner[1]}" /><stop offset="1" stop-color="${p.inner[0]}" />
        </radialGradient>
      </defs>
      <g class="gerbera__outer" fill="url(#go${i})">${outer}</g>
      <g class="gerbera__inner" fill="url(#gi${i})">${inner}</g>
      <circle cx="50" cy="50" r="11" fill="${p.center}" />
      <circle cx="50" cy="50" r="7" fill="#d4af37" opacity=".75" />
      <circle cx="47" cy="47" r="2.2" fill="#fff4c9" opacity=".7" />
    </svg>`;
}

export function createGerberaGarden(container, { total = 18, wishes = [], completeText = "", fx, onComplete } = {}) {
  const bloomed = new Set();

  container.innerHTML = `
    <div class="garden">
      <div class="garden__grid">
        ${Array.from({ length: total }, (_, i) => `
          <button type="button" class="gerbera" data-index="${i}" aria-label="Flower ${i + 1}: ${wishes[i] ?? ""}" aria-pressed="false" style="--i:${i}">
            <span class="gerbera__bloom">${gerbera(i)}</span>
            <span class="gerbera__num">${String(i + 1).padStart(2, "0")}</span>
          </button>`).join("")}
      </div>

      <div class="garden__wish" aria-live="polite">
        <span class="garden__wish-num">—</span>
        <span class="garden__wish-word">${TAP} each bud to bloom all ${total} years</span>
      </div>

      <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="0">
        <span class="meter__fill"></span>
      </div>
    </div>
  `;

  const items = container.querySelectorAll(".gerbera");
  const num = container.querySelector(".garden__wish-num");
  const word = container.querySelector(".garden__wish-word");
  const meter = container.querySelector(".meter");
  const fill = container.querySelector(".meter__fill");

  function showWish(n, text) {
    num.textContent = n;
    word.textContent = text;
    if (!REDUCED_MOTION) {
      gsap.fromTo([num, word], { opacity: 0, y: 10, filter: "blur(4px)" }, {
        opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.05, ease: "power3.out",
      });
    }
  }

  function bloom(item) {
    const idx = Number(item.dataset.index);
    const first = !bloomed.has(idx);

    if (first) {
      bloomed.add(idx);
      item.classList.add("is-bloomed");
      item.setAttribute("aria-pressed", "true");

      const svg = item.querySelector(".gerbera__svg");
      if (!REDUCED_MOTION) {
        gsap.fromTo(svg, { scale: 0.35, rotate: -120 }, { scale: 1, rotate: 0, duration: 1.1, ease: "elastic.out(1, 0.55)" });
      }
      const p = PALETTES[idx % PALETTES.length];
      const { x, y } = centerOf(svg);
      fx?.sparkles.burst(x, y, { count: 22, power: 0.8, colors: [p.outer[0], p.inner[0], "#fff8e7"] });

      fill.style.transform = `scaleX(${bloomed.size / total})`;
      meter.setAttribute("aria-valuenow", bloomed.size);
    }

    showWish(String(idx + 1).padStart(2, "0"), wishes[idx] ?? "");

    if (first && bloomed.size === total) {
      setTimeout(() => {
        container.querySelector(".garden").classList.add("is-complete");
        showWish("18", completeText);
        if (!REDUCED_MOTION) {
          gsap.fromTo(".gerbera__svg", { scale: 1 }, {
            scale: 1.18, duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut",
            stagger: { each: 0.045, from: "center", grid: "auto" },
          });
        }
        fx?.sparkles.confetti(70);
        fx?.sky.shower(4);
        onComplete?.();
      }, 450);
    }
  }

  items.forEach((item) => item.addEventListener("click", () => bloom(item)));
}
