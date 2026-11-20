import { PROJECT } from "../content.js";

/** Barra superior fija: marca + progreso por capítulos. */
export function createHud(root, chapters) {
  const total = String(chapters.length).padStart(2, "0");

  root.innerHTML = `
    <div class="hud__inner">
      <span class="hud__brand" aria-label="${PROJECT.name}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.6 4.8 2.9 7.3 8 8-5.1.7-7.4 3.2-8 8-.6-4.8-2.9-7.3-8-8 5.1-.7 7.4-3.2 8-8Z" fill="currentColor"/></svg>
        ${PROJECT.name}
      </span>
      <ol class="hud__progress" aria-label="Chapters">
        ${chapters.map((c) => `<li class="hud__seg" title="${c}"><i></i></li>`).join("")}
      </ol>
      <span class="hud__label" aria-live="polite">
        <b class="hud__num">01</b><span class="hud__total">/${total}</span>
        <span class="hud__name">${chapters[0]}</span>
      </span>
    </div>
  `;

  const segs = root.querySelectorAll(".hud__seg");
  const num = root.querySelector(".hud__num");
  const name = root.querySelector(".hud__name");

  return {
    set(index) {
      segs.forEach((s, i) => {
        s.classList.toggle("is-done", i < index);
        s.classList.toggle("is-current", i === index);
      });
      num.textContent = String(index + 1).padStart(2, "0");
      name.textContent = chapters[index];
    },
  };
}
