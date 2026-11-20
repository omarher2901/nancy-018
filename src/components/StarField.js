import { REDUCED_MOTION, FINE_POINTER } from "../lib/env.js";

const STAR_COLORS = [
  [255, 244, 224], // blanco cálido
  [255, 244, 224],
  [214, 224, 255], // azulado
  [255, 214, 232], // rosado
  [243, 229, 171], // dorado
];

/**
 * Cielo de fondo: estrellas en capas con paralaje, centelleo,
 * estrellas fugaces y un efecto "salto a hiperespacio" entre escenas.
 */
export class StarField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.stars = [];
    this.meteors = [];
    this.warp = 0;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this.nextMeteor = 2500;
    this.running = false;
    this.last = 0;

    this.resize = this.resize.bind(this);
    this.frame = this.frame.bind(this);

    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });

    if (FINE_POINTER && !REDUCED_MOTION) {
      window.addEventListener(
        "pointermove",
        (e) => {
          this.pointer.tx = (e.clientX / this.w) * 2 - 1;
          this.pointer.ty = (e.clientY / this.h) * 2 - 1;
        },
        { passive: true }
      );
    } else if (!REDUCED_MOTION) {
      // Android y algunos navegadores entregan la inclinación sin pedir permiso.
      window.addEventListener(
        "deviceorientation",
        (e) => {
          if (e.gamma == null) return;
          this.pointer.tx = Math.max(-1, Math.min(1, e.gamma / 30));
          this.pointer.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
        },
        { passive: true }
      );
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.stop();
      else this.start();
    });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    // En móviles, la barra de direcciones cambia la altura sin cambiar el ancho:
    // no regeneramos el cielo en ese caso para evitar "saltos".
    const sameWidth = this.w === w;
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!sameWidth || !this.stars.length) this.populate();
  }

  populate() {
    const count = Math.round(Math.min(460, Math.max(140, (this.w * this.h) / 3200)));
    this.stars = Array.from({ length: count }, () => this.makeStar());
  }

  makeStar(x = Math.random() * this.w, y = Math.random() * this.h) {
    const z = Math.random() ** 1.6; // la mayoría lejanas, pocas cercanas
    return {
      x,
      y,
      z,
      r: 0.35 + z * 1.55,
      base: 0.35 + z * 0.65,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.8,
      color: STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0],
    };
  }

  /** Lanza una estrella fugaz. */
  meteor() {
    if (REDUCED_MOTION) return;
    const fromLeft = Math.random() > 0.5;
    const angle = (fromLeft ? 0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.3;
    this.meteors.push({
      x: fromLeft ? Math.random() * this.w * 0.6 : this.w * (0.4 + Math.random() * 0.6),
      y: Math.random() * this.h * 0.45,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      speed: 9 + Math.random() * 7,
      len: 90 + Math.random() * 120,
      life: 1,
    });
  }

  /** Lluvia de estrellas fugaces para los momentos importantes. */
  shower(count = 6) {
    for (let i = 0; i < count; i++) setTimeout(() => this.meteor(), i * 220);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
  }

  frame(now) {
    if (!this.running) return;
    const dt = Math.min(48, now - this.last);
    this.last = now;
    const k = dt / 16.67;
    const { ctx, w, h } = this;
    const t = now / 1000;

    // paralaje suavizado + deriva lenta automática
    const p = this.pointer;
    p.x += (p.tx - p.x) * 0.04 * k;
    p.y += (p.ty - p.y) * 0.04 * k;
    const driftX = REDUCED_MOTION ? 0 : Math.sin(t * 0.05) * 0.25;
    const driftY = REDUCED_MOTION ? 0 : Math.cos(t * 0.04) * 0.2;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const warp = this.warp;

    for (const s of this.stars) {
      const ox = (p.x + driftX) * s.z * 26;
      const oy = (p.y + driftY) * s.z * 20;
      let x = s.x + ox;
      let y = s.y + oy;

      const tw = REDUCED_MOTION ? 1 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
      const a = s.base * tw;
      const [r, g, b] = s.color;

      if (warp > 0.01) {
        const dx = s.x - cx;
        const dy = s.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const v = warp * (0.4 + s.z) * 16 * k * (0.3 + d / Math.max(w, h));
        s.x += (dx / d) * v;
        s.y += (dy / d) * v;
        if (s.x < -40 || s.x > w + 40 || s.y < -40 || s.y > h + 40) {
          Object.assign(s, this.makeStar(cx + (Math.random() - 0.5) * w * 0.5, cy + (Math.random() - 0.5) * h * 0.5));
          continue;
        }
        const len = warp * (0.4 + s.z) * 60 * (0.25 + d / Math.max(w, h));
        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(1, a + warp * 0.3)})`;
        ctx.lineWidth = s.r;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - (dx / d) * len, y - (dy / d) * len);
        ctx.stroke();
        continue;
      }

      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // halo para las estrellas más cercanas
      if (s.z > 0.72) {
        ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.07})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // estrellas fugaces
    this.nextMeteor -= dt;
    if (this.nextMeteor <= 0) {
      this.meteor();
      this.nextMeteor = 4000 + Math.random() * 7000;
    }

    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += m.vx * m.speed * k;
      m.y += m.vy * m.speed * k;
      m.life -= 0.012 * k;
      if (m.life <= 0) {
        this.meteors.splice(i, 1);
        continue;
      }
      const tx = m.x - m.vx * m.len;
      const ty = m.y - m.vy * m.len;
      const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, `rgba(255,248,231,${m.life})`);
      grad.addColorStop(0.3, `rgba(244,154,193,${m.life * 0.45})`);
      grad.addColorStop(1, "rgba(139,120,214,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      ctx.fillStyle = `rgba(255,255,255,${m.life})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(this.frame);
  }
}
