import React, { useEffect, useRef, useState } from "react";

/* Mesa de dados con física real (2D + giro 3D):
   - gravedad, rebote contra paredes/suelo y choques entre dados
   - arrastra un dado y suéltalo para lanzarlo (la velocidad del gesto se conserva)
   - el dado rueda en 3D según su velocidad y al pararse se asienta mostrando su cara frontal
   - botón "Lanzar dados": los tira todos al aire · doble clic en la mesa: los ordena
   Un solo requestAnimationFrame escribe las transformaciones en el DOM. */

const SIZE = 74;                    // lado del dado (px)
const R = SIZE * 0.56;              // radio de colisión
const G = 2600, BOUNCE = 0.42, FRICTION = 0.985, FLOOR_FRICTION = 0.9;

export default function DiceTray({ items, labels }) {
  const tray = useRef(null);
  const els = useRef([]);
  const st = useRef(null);
  const [hover, setHover] = useState(-1);

  useEffect(() => {
    const box = tray.current;
    const W = () => box.clientWidth, H = () => box.clientHeight;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bodies = items.map((_, i) => ({
      x: R + Math.random() * Math.max(10, W() - 2 * R), y: -SIZE - Math.random() * 400,
      vx: (Math.random() - 0.5) * 300, vy: 0, rx: Math.random() * 360, ry: Math.random() * 360, rz: (Math.random() - 0.5) * 40,
      held: false, sleep: 0, tx: null, ty: null,
    }));
    const s = { bodies, drag: -1, px: 0, py: 0, hist: [], raf: 0, last: performance.now(), vis: false, ordered: false };
    st.current = s;

    const gridTarget = (i) => {
      const maxCols = Math.max(2, Math.min(items.length, Math.floor(W() / (SIZE + 34))));
      const rows = Math.ceil(items.length / maxCols), cols = Math.ceil(items.length / rows);
      const gw = cols * (SIZE + 34), c = i % cols, r = Math.floor(i / cols);
      return { x: (W() - gw) / 2 + (SIZE + 34) * (c + 0.5), y: H() - (rows - r) * (SIZE + 30) + 4 };
    };
    s.order = () => { s.ordered = true; bodies.forEach((b, i) => { const t = gridTarget(i); b.tx = t.x; b.ty = t.y; b.sleep = 0; }); };
    s.throwAll = () => {
      s.ordered = false;
      bodies.forEach((b) => { b.tx = b.ty = null; b.vx = (Math.random() - 0.5) * 1600; b.vy = -900 - Math.random() * 900; b.sleep = 0; });
    };

    const step = (dt) => {
      const w = W(), h = H();
      for (const b of bodies) {
        if (b.held) continue;
        if (b.tx != null) {                       // modo ordenar: muelle hacia su casilla
          b.vx += ((b.tx - b.x) * 60 - b.vx * 11) * dt;
          b.vy += ((b.ty - b.y) * 60 - b.vy * 11) * dt;
        } else b.vy += G * dt;
        b.vx *= FRICTION; b.vy *= FRICTION;
        b.x += b.vx * dt; b.y += b.vy * dt;
        // paredes y suelo (el techo queda abierto para lanzar)
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * BOUNCE; }
        if (b.x > w - R) { b.x = w - R; b.vx = -Math.abs(b.vx) * BOUNCE; }
        if (b.y > h - R) {
          b.y = h - R;
          if (b.vy > 0) b.vy = -b.vy * BOUNCE;
          if (Math.abs(b.vy) < 60) b.vy = 0;
          b.vx *= FLOOR_FRICTION;
        }
      }
      // choques entre dados (círculos)
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j];
        const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), min = R * 2;
        if (d > 0 && d < min) {
          const nx = dx / d, ny = dy / d, push = (min - d) / 2;
          const ia = a.held ? 0 : 1, ic = c.held ? 0 : 1, tot = ia + ic || 1;
          a.x -= nx * push * 2 * ia / tot; a.y -= ny * push * 2 * ia / tot;
          c.x += nx * push * 2 * ic / tot; c.y += ny * push * 2 * ic / tot;
          const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (rv < 0) {
            const imp = -(1 + 0.5) * rv / tot;
            if (!a.held) { a.vx -= imp * nx; a.vy -= imp * ny; }
            if (!c.held) { c.vx += imp * nx; c.vy += imp * ny; }
          }
        }
      }
      // giro 3D proporcional a la velocidad (rueda); en reposo se asienta de frente
      for (const b of bodies) {
        const sp = Math.hypot(b.vx, b.vy);
        if (b.held) { b.rx += b.vy * dt * 0.6; b.ry += b.vx * dt * 0.6; continue; }
        if (sp > 25) { b.ry += b.vx * dt * 0.55; b.rx -= b.vy * dt * 0.55; b.rz += b.vx * dt * 0.05; b.sleep = 0; }
        else {
          b.sleep = Math.min(1, b.sleep + dt * 2);
          const snap = (a) => Math.round(a / 360) * 360;   // todas las caras llevan el mismo icono: se asienta siempre derecho
          b.rx += (snap(b.rx) - b.rx) * 0.12; b.ry += (snap(b.ry) - b.ry) * 0.12; b.rz += (0 - b.rz) * 0.08;
        }
      }
    };

    const render = () => {
      bodies.forEach((b, i) => {
        const el = els.current[i]; if (!el) return;
        el.style.transform = `translate3d(${(b.x - SIZE / 2).toFixed(1)}px, ${(b.y - SIZE / 2).toFixed(1)}px, 0) rotate(${b.rz.toFixed(1)}deg)`;
        el.firstChild.style.transform = `rotateX(${(-18 + b.rx).toFixed(1)}deg) rotateY(${b.ry.toFixed(1)}deg)`;
        el.style.zIndex = b.held ? 30 : String(10 + Math.round(b.y / 10));
      });
    };

    const loop = (now) => {
      s.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.033, (now - s.last) / 1000); s.last = now;
      if (!s.vis) return;
      for (let k = 0; k < 3; k++) step(dt / 3);
      render();
    };

    // ----- arrastrar y lanzar
    const local = (e) => { const r = box.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const down = (e) => {
      const i = Number(e.currentTarget.dataset.i);
      const b = bodies[i]; const p = local(e);
      s.drag = i; b.held = true; b.tx = b.ty = null; s.ordered = false;
      s.ox = b.x - p.x; s.oy = b.y - p.y; s.hist = [{ ...p, t: performance.now() }];
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const move = (e) => {
      if (s.drag < 0) return;
      const b = bodies[s.drag], p = local(e);
      b.x = p.x + s.ox; b.y = p.y + s.oy; b.vx = b.vy = 0;
      s.hist.push({ ...p, t: performance.now() }); if (s.hist.length > 6) s.hist.shift();
    };
    const up = () => {
      if (s.drag < 0) return;
      const b = bodies[s.drag], h0 = s.hist[0], h1 = s.hist[s.hist.length - 1];
      const dt = Math.max(16, h1.t - h0.t) / 1000;
      b.vx = Math.max(-3500, Math.min(3500, (h1.x - h0.x) / dt));
      b.vy = Math.max(-3500, Math.min(3500, (h1.y - h0.y) / dt));
      b.held = false; s.drag = -1;
    };
    els.current.forEach((el) => { el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); });

    // empieza a caer cuando la mesa entra en pantalla
    const io = new IntersectionObserver(([en]) => { s.vis = en.isIntersecting; if (s.vis) s.last = performance.now(); }, { threshold: 0.15 });
    io.observe(box);
    if (reduce) { s.vis = true; s.order(); for (let k = 0; k < 600; k++) step(1 / 60); render(); s.vis = false; }
    else s.raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(s.raf); io.disconnect();
      els.current.forEach((el) => { if (!el) return; el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); });
    };
  }, [items]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={() => st.current?.throwAll()} data-cursor="¡Lanza!" className="btn-primary !px-5 !py-2.5 !text-xs">{labels.throw}</button>
        <button onClick={() => st.current?.order()} data-cursor="Ordenar" className="btn-ghost !px-5 !py-2.5 !text-xs">{labels.order}</button>
        <span className="text-[11px] italic text-muted">{labels.hint}</span>
      </div>
      <div ref={tray} onDoubleClick={() => st.current?.order()}
        className="relative h-[540px] select-none overflow-hidden rounded-2xl sm:h-[440px] md:h-[460px]"
        style={{ border: "2px solid rgb(var(--edge))", boxShadow: "6px 6px 0 rgb(var(--edge))", background: "radial-gradient(ellipse at 50% 120%, rgb(var(--elevated)) 0%, rgb(var(--surface)) 70%)" }}>
        {/* etiqueta del dado señalado */}
        <div className="pointer-events-none absolute left-1/2 top-4 z-40 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-bg transition-opacity duration-200"
          style={{ opacity: hover >= 0 ? 1 : 0 }}>{hover >= 0 ? items[hover].name : ""}</div>
        {items.map(({ name, icon: Icon }, i) => (
          <div key={name} ref={(el) => { els.current[i] = el; }} data-i={i} data-cursor={name}
            onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover((h) => (h === i ? -1 : h))}
            className="dice absolute left-0 top-0 cursor-grab touch-none active:cursor-grabbing"
            style={{ width: SIZE, height: SIZE, perspective: "600px", transform: `translate3d(0px,-200px,0)` }}>
            <div className="dice-cube">
              {["f", "b", "r", "l", "t", "d"].map((f) => <div key={f} className={`dice-face ${f}`}><Icon size={30} /></div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
