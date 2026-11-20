import { REDUCED_MOTION } from "../lib/env.js";

const PALETTE = ["#fff8e7", "#f3e5ab", "#f49ac1", "#b9a8ff", "#ffd2b8"];

/**
 * Capa de efectos por encima del contenido: chispas, polvo de estrellas y confeti.
 * Solo se anima mientras hay partículas vivas.
 */
export class Sparkles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.parts = [];
    this.running = false;
    this.frame = this.frame.bind(this);
    this.resize = this.resize.bind(this);
    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Explosión de chispas en (x, y). */
  burst(x, y, { count = 28, colors = PALETTE, power = 1, spread = Math.PI * 2, angle = 0 } = {}) {
    if (REDUCED_MOTION) return;
    for (let i = 0; i < count; i++) {
      const a = angle - spread / 2 + Math.random() * spread;
      const v = (1.2 + Math.random() * 3.6) * power;
      this.parts.push({
        kind: Math.random() > 0.7 ? "star" : "dot",
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        g: 0.035,
        drag: 0.955,
        size: 0.8 + Math.random() * 2.2,
        life: 1,
        decay: 0.012 + Math.random() * 0.018,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        color: colors[(Math.random() * colors.length) | 0],
      });
    }
    this.start();
  }

  /** Confeti de pétalos y estrellas cayendo desde arriba. */
  confetti(count = 90) {
    if (REDUCED_MOTION) return;
    for (let i = 0; i < count; i++) {
      this.parts.push({
        kind: Math.random() > 0.5 ? "petal" : "star",
        x: Math.random() * this.w,
        y: -20 - Math.random() * this.h * 0.6,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 1 + Math.random() * 1.8,
        g: 0.012,
        drag: 0.995,
        size: 3 + Math.random() * 4,
        life: 1,
        decay: 0.0025 + Math.random() * 0.002,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.08,
        sway: Math.random() * Math.PI * 2,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
      });
    }
    this.start();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.frame);
  }

  frame(now) {
    const k = Math.min(3, (now - this.last) / 16.67);
    this.last = now;
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = "lighter";

    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.vx *= p.drag ** k;
      p.vy = p.vy * p.drag ** k + p.g * k;
      if (p.sway !== undefined) {
        p.sway += 0.04 * k;
        p.x += Math.sin(p.sway) * 0.6 * k;
      }
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.rot += p.vr * k;
      p.life -= p.decay * k;

      if (p.life <= 0 || p.y > this.h + 30) {
        this.parts.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.min(1, p.life * 1.4);
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.kind === "dot") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha *= 0.25;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === "petal") {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // estrella de 4 puntas
        const s = p.size * 1.6;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (this.parts.length) requestAnimationFrame(this.frame);
    else {
      this.running = false;
      ctx.clearRect(0, 0, this.w, this.h);
    }
  }
}
