import React, { useEffect, useRef } from "react";

/**
 * Global interactive particle background (fixed, full-screen).
 * - drifting nodes + proximity links (themed from --ink)
 * - cursor attraction + illumination glow (themed from --accent)
 * - click spawns an expanding ripple that pushes nearby particles
 * pointer-events are disabled so content stays clickable; listeners are on window.
 */
export default function ParticleField() {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let ripples = [];
    let raf;
    const mouse = { x: -9999, y: -9999 };

    const readVar = (name) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      const [r, g, b] = v.split(/\s+/).map(Number);
      return [r || 0, g || 0, b || 0];
    };
    let INK = readVar("--ink");
    let ACC = readVar("--accent");

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((W * H) / 20000);
      const n = Math.max(40, Math.min(120, count));
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.9,
        gold: Math.random() < 0.14,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const [ir, ig, ib] = INK;
      const [ar, ag, ab] = ACC;

      // ripples
      ripples = ripples.filter((rp) => rp.a > 0.02);
      ripples.forEach((rp) => {
        rp.r += 6; rp.a *= 0.94;
        if (rp.r <= 1) return;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, Math.max(0.5, rp.r), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${rp.a})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        // friction: thrown particles settle back to ambient drift (water-like)
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 0.45) { p.vx *= 0.95; p.vy *= 0.95; }

        // cursor attraction
        const dxm = mouse.x - p.x, dym = mouse.y - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 170) { p.x += (dxm / dm) * 0.5; p.y += (dym / dm) * 0.5; }

        // ripple push
        ripples.forEach((rp) => {
          const dx = p.x - rp.x, dy = p.y - rp.y, d = Math.hypot(dx, dy);
          if (Math.abs(d - rp.r) < 28) { p.x += (dx / (d || 1)) * 1.4; p.y += (dy / (d || 1)) * 1.4; }
        });

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? `rgba(${ar},${ag},${ab},0.95)` : `rgba(${ir},${ig},${ib},0.55)`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          if (d < 128) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${ir},${ig},${ib},${0.16 * (1 - d / 128)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        if (dm < 170) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.28 * (1 - dm / 170)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (glowRef.current) {
        glowRef.current.style.opacity = "1";
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; if (glowRef.current) glowRef.current.style.opacity = "0"; };
    const onClick = (e) => {
      const cx = e.clientX, cy = e.clientY;
      // water-like double ripple
      ripples.push({ x: cx, y: cy, r: 0, a: 0.55 });
      ripples.push({ x: cx, y: cy, r: -18, a: 0.35 });
      // spawn new particles bursting outward
      const N = 8;
      for (let k = 0; k < N; k++) {
        const ang = (Math.PI * 2 * k) / N + Math.random() * 0.6;
        const spd = 1.6 + Math.random() * 1.8;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
          r: Math.random() * 1.6 + 0.9,
          gold: Math.random() < 0.45,
        });
      }
      if (particles.length > 260) particles.splice(0, particles.length - 260);
    };
    const onTheme = () => { INK = readVar("--ink"); ACC = readVar("--accent"); };

    resize();
    if (!reduce) raf = requestAnimationFrame(draw); else draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onClick, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      document.removeEventListener("mouseleave", onLeave);
      mo.disconnect();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[420px] w-[420px] opacity-0 transition-opacity duration-500"
        style={{
          marginLeft: "-210px", marginTop: "-210px",
          background: "radial-gradient(circle, rgb(var(--accent) / 0.14) 0%, rgb(var(--accent) / 0.05) 38%, transparent 70%)",
        }}
      />
    </div>
  );
}
