import { TAP, centerOf } from "../lib/env.js";

const STARS = [
  { x: 330, y: 55, name: "Graffias", size: 4.5 },
  { x: 345, y: 95, name: "Dschubba", size: 5 },
  { x: 335, y: 135, name: "Pi Scorpii", size: 4 },
  { x: 295, y: 110, name: "Antares", size: 7.5, isAntares: true, note: "the heart of the scorpion" },
  { x: 255, y: 135, name: "Tau Scorpii", size: 4 },
  { x: 225, y: 175, name: "Epsilon", size: 4.5 },
  { x: 215, y: 225, name: "Mu Scorpii", size: 4 },
  { x: 185, y: 265, name: "Zeta", size: 4 },
  { x: 135, y: 275, name: "Eta", size: 4.5 },
  { x: 95, y: 250, name: "Sargas", size: 5 },
  { x: 85, y: 205, name: "Iota", size: 4 },
  { x: 115, y: 185, name: "Shaula", size: 5.5, note: "the scorpion's sting" },
];

const EDGES = [
  [0, 1], [1, 2], [1, 3], [3, 4], [4, 5],
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
];

export function createScorpiusConstellation(container, { fx, onComplete } = {}) {
  const activated = new Set();
  const total = STARS.length;

  container.innerHTML = `
    <div class="constellation">
      <div class="constellation__frame">
        <span class="constellation__coord constellation__coord--tl">RA 16h 29m 24s</span>
        <span class="constellation__coord constellation__coord--tr">DEC −26° 25′ 55″</span>
        <span class="constellation__coord constellation__coord--bl">♏︎ SCO</span>
        <span class="constellation__coord constellation__coord--br">MAG 0.96</span>

        <svg class="constellation__svg" viewBox="55 25 320 280" role="group" aria-label="Scorpius constellation">
          <defs>
            <filter id="star-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="antares-halo">
              <stop offset="0" stop-color="#ffb38a" stop-opacity=".55" />
              <stop offset="1" stop-color="#ff7a59" stop-opacity="0" />
            </radialGradient>
          </defs>

          <g class="constellation__lines">
            ${EDGES.map(
              ([a, b]) => `
              <line class="c-line" x1="${STARS[a].x}" y1="${STARS[a].y}" x2="${STARS[b].x}" y2="${STARS[b].y}" />
              <line class="c-line c-line--lit" pathLength="1" data-from="${a}" data-to="${b}"
                x1="${STARS[a].x}" y1="${STARS[a].y}" x2="${STARS[b].x}" y2="${STARS[b].y}" />`
            ).join("")}
          </g>

          <circle class="antares-halo" cx="${STARS[3].x}" cy="${STARS[3].y}" r="38" fill="url(#antares-halo)" />

          <g class="constellation__stars">
            ${STARS.map(
              (s, i) => `
              <g class="c-star ${s.isAntares ? "c-star--antares" : ""}" data-id="${i}"
                 tabindex="0" role="button" aria-label="${s.name}" aria-pressed="false"
                 style="--d:${(i * 0.37) % 2.4}s">
                <circle class="c-star__hit" cx="${s.x}" cy="${s.y}" r="20" />
                <circle class="c-star__pulse" cx="${s.x}" cy="${s.y}" r="${s.size + 6}" />
                <circle class="c-star__core" cx="${s.x}" cy="${s.y}" r="${s.size * 0.75}" filter="url(#star-glow)" />
              </g>`
            ).join("")}
          </g>
        </svg>
      </div>

      <div class="constellation__status">
        <div class="counter" aria-hidden="true">
          <span class="counter__value">00</span><span class="counter__total">/${total}</span>
        </div>
        <p class="constellation__hint" aria-live="polite">${TAP} each star to awaken your constellation</p>
      </div>
    </div>
  `;

  const root = container.querySelector(".constellation");
  const svg = container.querySelector("svg");
  const nodes = container.querySelectorAll(".c-star");
  const lines = container.querySelectorAll(".c-line--lit");
  const counter = container.querySelector(".counter__value");
  const hint = container.querySelector(".constellation__hint");

  function activate(node) {
    const id = Number(node.dataset.id);
    if (activated.has(id)) return;

    activated.add(id);
    node.classList.add("is-active");
    node.setAttribute("aria-pressed", "true");
    counter.textContent = String(activated.size).padStart(2, "0");

    const star = STARS[id];
    hint.innerHTML = `<strong>${star.name}</strong>${star.note ? ` · ${star.note}` : ""}`;
    hint.classList.remove("is-flash");
    void hint.offsetWidth;
    hint.classList.add("is-flash");

    const core = node.querySelector(".c-star__core");
    const { x, y } = centerOf(core);
    fx?.sparkles.burst(x, y, {
      count: star.isAntares ? 40 : 18,
      power: star.isAntares ? 1.2 : 0.7,
      colors: star.isAntares ? ["#ffb38a", "#f49ac1", "#fff8e7"] : undefined,
    });

    lines.forEach((line) => {
      if (activated.has(+line.dataset.from) && activated.has(+line.dataset.to)) {
        line.classList.add("is-lit");
      }
    });

    if (activated.size === total) {
      setTimeout(() => {
        root.classList.add("is-complete");
        hint.innerHTML = `<strong>Scorpius</strong> shines bright for you tonight.`;
        const a = centerOf(nodes[3]);
        fx?.sparkles.burst(a.x, a.y, { count: 90, power: 2.2 });
        fx?.sky.shower(5);
        onComplete?.();
      }, 500);
    }
  }

  nodes.forEach((node) => {
    node.addEventListener("click", () => activate(node));
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate(node);
      }
    });
  });

  // Arrastrar el dedo sobre el cielo también despierta estrellas.
  svg.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse" && e.buttons === 0) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest(".c-star");
    if (el) activate(el);
  });
}
