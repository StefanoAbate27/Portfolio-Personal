import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform,
} from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Lock } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { scrollToId } from "../hooks/useSmoothScroll";
import SaaeLogo from "./SaaeLogo";

const FounderCharacter = lazy(() => import("./FounderCharacter"));
const hasWebGL = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (_) { return false; } };

/* Hero con escenario fijado (al estilo de la página Smart de Scottish):
   una sola sección sticky donde el scroll recorre capítulos sobre el mismo
   "producto" — una ventana de navegador 3D con la web de un cliente:

     0 · Entrada      titular; la ventana llega inclinada y se endereza
     1 · Diseño       vista explotada: boceto (wireframe) detrás, interfaz delante
     2 · Desarrollo   gira al otro lado y aparece el panel de código tecleándose
     3 · Lanzamiento  de frente, en vivo: métricas crecen y chips de entrega

   Un gesto de rueda / dedo avanza al siguiente capítulo (snap) y la animación
   se reproduce sola; el índice inferior permite saltar a cualquier capítulo. */

const EASE = [0.16, 1, 0.3, 1];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (x, a, b) => clamp((x - a) / (b - a), 0, 1);
const ss = (t) => t * t * (3 - 2 * t);
/** Interpolación por tramos con curva suave entre keyframes. */
const kf = (v, ins, outs) => {
  if (v <= ins[0]) return outs[0];
  for (let i = 1; i < ins.length; i++) {
    if (v <= ins[i]) return lerp(outs[i - 1], outs[i], ss((v - ins[i - 1]) / (ins[i] - ins[i - 1])));
  }
  return outs[outs.length - 1];
};

/* Tramos de capítulo y paradas del snap */
const CH = { intro: [0, 0.15], design: [0.15, 0.46], code: [0.46, 0.76], launch: [0.76, 1] };
const STOPS = [0, 0.12, 0.29, 0.63, 0.93];
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function useMedia(query) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}

/* Snap por capítulos con el handler virtualScroll de Lenis (como Smart). */
function useChapterSnap(ref, enabled) {
  useEffect(() => {
    if (!enabled) return;
    let lenis, prev, timer;
    const st = { busy: false, lastWheel: 0, doneAt: 0, touchAcc: 0, touchFired: false };
    const geom = () => {
      const el = ref.current;
      const top = el.getBoundingClientRect().top + window.scrollY;
      return { top, len: el.offsetHeight - window.innerHeight, end: top + el.offsetHeight };
    };
    const go = (target, distance) => {
      st.busy = true;
      lenis.scrollTo(target, {
        duration: Math.min(1.8, Math.max(0.9, 0.6 + distance * 4)),
        easing: easeInOutCubic, lock: true, force: true,
        onComplete: () => { st.busy = false; st.doneAt = performance.now(); },
      });
    };
    const step = (dir, y) => {
      const { top, len, end } = geom();
      const p = len > 0 ? (y - top) / len : 0;
      if (dir > 0) {
        const next = STOPS.find((v) => v > p + 0.002);
        if (next == null) go(end, 0.1); // fin del escenario → siguiente sección
        else go(top + next * len, next - p);
      } else {
        const back = [...STOPS].reverse().find((v) => v < p - 0.002);
        if (back != null) go(top + back * len, p - back);
      }
    };
    const handler = ({ deltaY, event }) => {
      if (lenis.isStopped) return true;
      const { top, len } = geom();
      const y = lenis.animatedScroll;
      if (y < top - 2 || y > top + len + 2) return true; // fuera del escenario: scroll normal
      const now = performance.now();
      if (event.type.startsWith("touch")) {
        if (event.type === "touchstart") { st.touchAcc = 0; st.touchFired = false; return true; }
        if (event.type === "touchend") return true;
        if (event.cancelable) event.preventDefault();
        if (st.busy || st.touchFired) return false;
        st.touchAcc += deltaY;
        if (Math.abs(st.touchAcc) < 24) return false;
        st.touchFired = true;
        step(Math.sign(st.touchAcc), y);
        return false;
      }
      const gap = now - st.lastWheel; st.lastWheel = now;
      if (event.cancelable) event.preventDefault();
      if (st.busy) return false;
      if (now - st.doneAt < 650 && gap < 160) return false; // inercia del gesto anterior
      if (Math.abs(deltaY) < 2) return false;
      step(Math.sign(deltaY), y);
      return false;
    };
    // Lenis se crea en el efecto del padre (después de este): esperar a que exista
    const attach = () => {
      lenis = window.__lenis;
      if (!lenis) { timer = setTimeout(attach, 120); return; }
      prev = lenis.options.virtualScroll;
      lenis.options.virtualScroll = handler;
    };
    attach();
    return () => {
      clearTimeout(timer);
      if (lenis) lenis.options.virtualScroll = prev;
    };
  }, [ref, enabled]);
}

/** Salta a un punto del escenario (índice de capítulos). */
function jumpTo(el, stop) {
  const top = el.getBoundingClientRect().top + window.scrollY;
  const y = top + stop * (el.offsetHeight - window.innerHeight);
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4, easing: easeInOutCubic, force: true });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/* ---------- copy ---------- */
const COPY = {
  es: {
    eyebrow: "Estudio de Desarrollo Web",
    h1a: "Software que domina.",
    h1b: "Ingeniería que respalda.",
    cta1: "Empezar un proyecto",
    cta2: "Ver trabajo",
    tag: ["Del boceto", "al lanzamiento."],
    design: { k: "01 · Diseño", a: "Pensado", b: "para convertir.", d: "Primero la estructura, después cada píxel. Interfaces a medida de tu marca." },
    code: { k: "02 · Desarrollo", a: "Código limpio,", b: "listo para escalar.", d: "React, Node.js y bases de datos sólidas. Rápido hoy, mantenible mañana." },
    launch: { k: "03 · Lanzamiento", a: "En vivo.", b: "Y creciendo.", d: "Publicamos, medimos y acompañamos tu plataforma después del lanzamiento." },
    hs: { ui: "Interfaz a medida", wire: "Boceto y estructura", resp: "Responsive", stack: "React · Node.js", db: "API + Base de datos" },
    chips: ["En producción", "100% responsive", "SEO listo", "Panel de gestión"],
    nav: [["Inicio", "Inicio"], ["Diseño", "Diseño"], ["Código", "Desarrollo"], ["Lanzar", "Lanzamiento"]],
    site: { a: "Tu marca,", b: "a otro nivel.", btn: "Empezar", chart: "Crecimiento", live: "En vivo" },
  },
  en: {
    eyebrow: "Web Development Studio",
    h1a: "Software that dominates.",
    h1b: "Engineering that backs you.",
    cta1: "Start a project",
    cta2: "See work",
    tag: ["From sketch", "to launch."],
    design: { k: "01 · Design", a: "Built", b: "to convert.", d: "Structure first, then every pixel. Interfaces tailored to your brand." },
    code: { k: "02 · Development", a: "Clean code,", b: "ready to scale.", d: "React, Node.js and solid databases. Fast today, maintainable tomorrow." },
    launch: { k: "03 · Launch", a: "Live.", b: "And growing.", d: "We ship, measure and support your platform after launch." },
    hs: { ui: "Bespoke interface", wire: "Sketch & structure", resp: "Responsive", stack: "React · Node.js", db: "API + Database" },
    chips: ["In production", "100% responsive", "SEO ready", "Admin panel"],
    nav: [["Home", "Home"], ["Design", "Design"], ["Code", "Development"], ["Launch", "Launch"]],
    site: { a: "Your brand,", b: "next level.", btn: "Start", chart: "Growth", live: "Live" },
  },
};

/* ---------- piezas ---------- */

/* Bloque de texto que aparece/desaparece en un tramo [entra, visible, visible, sale]. */
function Beat({ p, win, className = "", interactive = false, children }) {
  const opacity = useTransform(p, win, [0, 1, 1, 0]);
  const y = useTransform(p, win, [30, 0, 0, -24]);
  const pe = useTransform(p, (v) => (interactive && v > win[0] && v < win[3] ? "auto" : "none"));
  return (
    <div className={`pointer-events-none absolute z-20 ${className}`}>
      <motion.div style={{ opacity, y, pointerEvents: pe }}>{children}</motion.div>
    </div>
  );
}

/* Punto de interés anclado a una pieza de la ventana (punto + anillo que respira + línea + etiqueta). */
function Hotspot({ p, win, x, y, label, down = false }) {
  const opacity = useTransform(p, win, [0, 1, 1, 0]);
  const scale = useTransform(p, win, [0.6, 1, 1, 0.8]);
  return (
    <motion.div style={{ opacity, scale, left: x, top: y }} className="pointer-events-none absolute z-30 h-0 w-0">
      <span className="hs-breathe absolute -left-[1.6em] -top-[1.6em] block h-[3.2em] w-[3.2em] rounded-full border border-accent/70 bg-accent/10" />
      <span className="absolute -left-[0.45em] -top-[0.45em] block h-[0.9em] w-[0.9em] rounded-full border-2 border-bg bg-accent shadow-[0_0_14px_rgb(var(--accent)/0.8)]" />
      <span className={`absolute left-0 block w-px from-accent/80 to-accent/0 ${down ? "top-[1.6em] h-[3.6em] bg-gradient-to-b" : "-top-[5.2em] h-[3.6em] bg-gradient-to-t"}`} />
      <span className={`absolute left-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-[1.1em] py-[0.5em] text-[max(1.25em,8px)] font-bold uppercase tracking-[0.12em] text-bg shadow-lg ${down ? "top-[5.4em]" : "-top-[8em]"}`}>
        {label}
      </span>
    </motion.div>
  );
}

/* Mini-web dentro de la ventana. variant "wire" = boceto con líneas discontinuas. */
function MiniSite({ variant, s, grow }) {
  const wire = variant === "wire";
  const box = wire ? "rounded-[0.6em] border border-dashed border-accent/70" : "";
  const tag = (txt) => wire && <span className="absolute left-[0.6em] top-[0.4em] text-[0.85em] font-bold uppercase tracking-[0.18em] text-accent">{txt}</span>;
  const bars = [0.42, 0.58, 0.5, 0.72, 0.64, 0.86, 1];
  return (
    <div className="absolute inset-0">
      {/* nav */}
      <div className={`absolute left-[5%] right-[5%] top-[5%] flex h-[8%] items-center justify-between ${box}`}>
        {tag("Nav")}
        {!wire && (<>
          <span className="flex items-center gap-[0.6em]"><SaaeLogo size={14} tone="auto" className="!h-[2em] !w-[2em]" /><span className="text-[1.3em] font-bold tracking-tight text-ink">SAAE</span></span>
          <span className="flex items-center gap-[1.4em]">{[0, 1, 2].map((i) => <span key={i} className="h-[0.45em] w-[3.2em] rounded-full bg-ink/20" />)}
            <span className="rounded-full bg-ink px-[1.1em] py-[0.45em] text-[0.95em] font-semibold text-bg">{s.btn}</span></span>
        </>)}
      </div>
      {/* hero de la mini-web */}
      <div className={`absolute left-[5%] top-[19%] h-[42%] w-[48%] ${box}`}>
        {tag("Hero")}
        {!wire && (<>
          <span className="block h-[0.45em] w-[22%] rounded-full bg-accent" />
          <p className="mt-[0.9em] text-[3.7em] font-bold uppercase leading-[0.95] tracking-[-0.04em] text-ink">{s.a}<br /><span className="text-accent">{s.b}</span></p>
          <span className="mt-[1.2em] block h-[0.45em] w-[80%] rounded-full bg-ink/15" />
          <span className="mt-[0.6em] block h-[0.45em] w-[62%] rounded-full bg-ink/15" />
          <span className="mt-[1.4em] inline-flex rounded-full bg-accent px-[1.4em] py-[0.6em] text-[1em] font-semibold text-white">{s.btn} ↗</span>
        </>)}
      </div>
      {/* tarjeta de gráfico */}
      <div className={`absolute right-[5%] top-[19%] h-[42%] w-[37%] ${wire ? box : "rounded-[0.9em] border border-line/10 bg-bg/70 p-[1.4em] shadow-[0_1em_2em_-1.4em_rgba(0,0,0,0.35)]"}`}>
        {tag("Chart")}
        {!wire && (<>
          <div className="flex items-center justify-between">
            <span className="text-[1em] font-bold uppercase tracking-[0.14em] text-muted">{s.chart}</span>
            <span className="text-[1em] font-bold text-accent">↗</span>
          </div>
          <div className="absolute inset-x-[1.4em] bottom-[1.4em] top-[3.6em] flex items-end gap-[6%]">
            {bars.map((h, i) => <Bar key={i} grow={grow} h={h} i={i} last={i === bars.length - 1} />)}
          </div>
        </>)}
      </div>
      {/* tarjetas inferiores */}
      {[0, 1, 2].map((i) => (
        <div key={i} className={`absolute top-[68%] h-[24%] w-[28%] ${wire ? box : "rounded-[0.9em] border border-line/10 bg-bg/70 p-[1.2em]"}`} style={{ left: `${5 + i * 31.5}%` }}>
          {tag(`Card ${i + 1}`)}
          {!wire && (<>
            <span className="grid h-[2.4em] w-[2.4em] place-items-center rounded-full bg-accent/15"><span className="h-[0.9em] w-[0.9em] rounded-full bg-accent" /></span>
            <span className="mt-[1em] block h-[0.5em] w-[70%] rounded-full bg-ink/60" />
            <span className="mt-[0.6em] block h-[0.4em] w-[90%] rounded-full bg-ink/15" />
          </>)}
        </div>
      ))}
    </div>
  );
}

function Bar({ grow, h, i, last }) {
  const height = useTransform(grow, (g) => `${(0.28 + 0.72 * clamp(g * 1.6 - i * 0.09, 0, 1)) * h * 100}%`);
  return <motion.span style={{ height }} className={`block flex-1 rounded-t-[0.3em] ${last ? "bg-accent" : "bg-ink/80"}`} />;
}

const CODE = [
  [["c-k", "import"], ["c-t", " { motion } "], ["c-k", "from"], ["c-s", " \"framer-motion\""]],
  [],
  [["c-k", "export default function"], ["c-f", " Hero"], ["c-t", "() {"]],
  [["c-t", "  "], ["c-k", "const"], ["c-t", " data = "], ["c-f", "useQuery"], ["c-t", "("], ["c-s", "\"/api/ventas\""], ["c-t", ");"]],
  [["c-t", "  "], ["c-k", "return"], ["c-t", " ("]],
  [["c-t", "    <"], ["c-f", "Section"], ["c-a", " theme"], ["c-t", "="], ["c-s", "\"saae\""], ["c-t", ">"]],
  [["c-t", "      <"], ["c-f", "Title"], ["c-t", ">Tu marca, a otro nivel.</"], ["c-f", "Title"], ["c-t", ">"]],
  [["c-t", "      <"], ["c-f", "Chart"], ["c-a", " data"], ["c-t", "={data} />"]],
  [["c-t", "    </"], ["c-f", "Section"], ["c-t", ">"]],
  [["c-t", "  );"]],
  [["c-t", "}"]],
];

function CodeLine({ typing, i, n, tokens }) {
  const reveal = useTransform(typing, (t) => `inset(0 ${(1 - seg(t, i / n, (i + 1) / n)) * 100}% 0 0)`);
  return (
    <motion.div style={{ clipPath: reveal }} className="flex whitespace-pre">
      <span className="mr-[1.4em] w-[1.4em] text-right text-white/25">{i + 1}</span>
      {tokens.map(([c, txt], k) => <span key={k} className={c}>{txt}</span>)}
    </motion.div>
  );
}

/* ---------- escena ---------- */

export default function Hero() {
  const { language } = useLanguage();
  const t = COPY[language] || COPY.es;
  const reduce = useReducedMotion();
  const wide = useMedia("(min-aspect-ratio: 1/1)");
  const ref = useRef(null);

  // progreso 0→1 del escenario (copiado a un MotionValue propio)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => p.set(v));
  useEffect(() => { p.set(scrollYProgress.get()); }, [p, scrollYProgress]);
  useChapterSnap(ref, !reduce);

  // inclinación con el cursor (sutil, siempre activa en desktop)
  const mx = useSpring(0, { stiffness: 60, damping: 18 });
  const my = useSpring(0, { stiffness: 60, damping: 18 });
  const onPointer = (e) => {
    if (e.pointerType !== "mouse") return;
    mx.set((e.clientX / window.innerWidth - 0.5) * 2);
    my.set((e.clientY / window.innerHeight - 0.5) * 2);
  };

  // coreografía de la ventana
  const K = [0, 0.12, 0.2, 0.38, 0.48, 0.56, 0.72, 0.82, 1];
  const rotX = useTransform([p, my], ([v, m]) => kf(v, K, [26, 0, 8, 8, 0, 6, 6, 0, 0]) - m * 3);
  const rotY = useTransform([p, mx], ([v, m]) => kf(v, K, [0, 0, -26, -26, 0, 24, 24, -8, -8]) + m * 4);
  const dx = useTransform(p, (v) => (wide ? `${kf(v, K, [0, 0, 15, 15, 0, -15, -15, 13, 13])}vw` : "0vw"));
  const dy = useTransform(p, (v) => (wide ? `${kf(v, K, [80, 1, 1, 1, 1, 1, 1, 1, 1])}svh` : `${kf(v, K, [70, -10, -11, -11, -10, -11, -11, -11, -11])}svh`));
  const scale = useTransform(p, (v) => kf(v, K, wide ? [0.84, 0.93, 0.84, 0.84, 0.9, 0.84, 0.84, 0.86, 0.86] : [0.94, 1, 0.98, 0.98, 1, 0.98, 0.98, 1, 1]));
  const explode = useTransform(p, (v) => kf(v, [0.14, 0.23, 0.37, 0.46], [0, 1, 1, 0]));
  const wireO = explode;
  const uiZ = useTransform(explode, (e) => e * (wide ? 90 : 50));
  const wireZ = useTransform(explode, (e) => e * (wide ? 30 : 16));
  const codeO = useTransform(p, [0.47, 0.55, 0.72, 0.78], [0, 1, 1, 0]);
  const codeX = useTransform(p, [0.47, 0.55, 0.72, 0.78], ["-14%", "0%", "0%", "-8%"]);
  const typing = useTransform(p, [0.52, 0.64], [0, 1]);
  const grow = useTransform(p, [0.76, 0.88], [0, 1]);
  const live = useTransform(p, [0.8, 0.86], [0, 1]);
  const glow = useTransform(p, [0, 0.12, 0.6, 0.85, 1], [0.35, 0.8, 0.8, 1, 1]);
  const heroScale = useTransform(p, [0.0, 0.08], [1, 0.92]);
  const chipsP = useTransform(p, [0.8, 0.9], [0, 1]);

  const deviceFont = wide ? "min(0.62vw, 9px)" : "0.86vw";
  const [webgl] = useState(() => typeof window !== "undefined" && hasWebGL());

  if (reduce) return <HeroStatic t={t} />;

  const sideL = wide ? "left-[max(5vw,calc((100vw-1400px)/2+2rem))] top-1/2 w-[min(30vw,440px)] -translate-y-1/2" : "inset-x-0 bottom-[clamp(5.5rem,14svh,8rem)] px-6";
  const sideR = wide ? "right-[max(5vw,calc((100vw-1400px)/2+2rem))] top-1/2 w-[min(30vw,440px)] -translate-y-1/2" : "inset-x-0 bottom-[clamp(5.5rem,14svh,8rem)] px-6";
  const H2 = "font-bold uppercase leading-[0.95] tracking-[-0.04em] text-ink text-[clamp(2.1rem,4.4vw,4.4rem)]";
  const LEAD = "mt-4 text-[clamp(0.95rem,1.15vw,1.1rem)] font-medium leading-relaxed text-muted";

  return (
    <section ref={ref} aria-label="SAAE" className="relative" style={{ height: "520svh" }} onPointerMove={onPointer}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* luz de estudio */}
        <motion.div aria-hidden style={{ opacity: glow }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_55%,rgb(var(--accent)/0.16)_0%,rgb(var(--accent)/0.05)_45%,transparent_75%)]" />

        {/* ventana 3D */}
        <div className="absolute inset-0 grid place-items-center" style={{ perspective: "1800px" }}>
          <motion.div style={{ x: dx, y: dy, scale, rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", fontSize: deviceFont }}
            className={`relative aspect-[16/10] will-change-transform ${wide ? "w-[min(62vw,900px)]" : "w-[86vw]"}`}>
            {/* marco */}
            <div className="absolute inset-0 overflow-hidden rounded-[1.6em] border border-line/12 bg-elevated shadow-[0_4em_8em_-3em_rgba(10,16,30,0.45)]">
              <div className="flex h-[7%] items-center gap-[0.7em] border-b border-line/10 px-[1.6em]">
                <span className="h-[0.9em] w-[0.9em] rounded-full bg-accent" />
                <span className="h-[0.9em] w-[0.9em] rounded-full bg-ink/25" />
                <span className="h-[0.9em] w-[0.9em] rounded-full bg-ink/15" />
                <span className="mx-auto flex items-center gap-[0.6em] rounded-full bg-ink/[0.06] px-[1.4em] py-[0.35em] text-[1em] font-medium text-muted">
                  <Lock className="h-[1em] w-[1em]" /> saae.studio
                  <motion.span style={{ opacity: live }} className="ml-[0.4em] flex items-center gap-[0.4em] font-bold uppercase tracking-[0.12em] text-emerald-500">
                    <span className="relative flex h-[0.7em] w-[0.7em]"><span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" /><span className="relative h-full w-full rounded-full bg-emerald-500" /></span>
                    {t.site.live}
                  </motion.span>
                </span>
              </div>
            </div>
            {/* contenido (debajo de la barra) en capas 3D */}
            <div className="absolute inset-x-0 bottom-0 top-[7%]" style={{ transformStyle: "preserve-3d" }}>
              <motion.div style={{ opacity: wireO, z: wireZ }} className="absolute inset-0">
                <MiniSite variant="wire" s={t.site} grow={grow} />
              </motion.div>
              <motion.div style={{ z: uiZ, transformStyle: "preserve-3d" }} className="absolute inset-0">
                <MiniSite variant="ui" s={t.site} grow={grow} />
                {/* hotspots de diseño */}
                <Hotspot p={p} win={[0.22, 0.25, 0.35, 0.38]} x="22%" y="30%" label={t.hs.ui} />
                <Hotspot p={p} win={[0.23, 0.26, 0.35, 0.38]} x="80%" y="80%" label={t.hs.resp} down />
              </motion.div>
              <motion.div style={{ opacity: wireO, z: wireZ }} className="absolute inset-0">
                <Hotspot p={p} win={[0.24, 0.27, 0.35, 0.38]} x="20%" y="80%" label={t.hs.wire} down />
              </motion.div>
            </div>

            {/* panel de código */}
            <motion.div style={{ opacity: codeO, x: codeX, z: wide ? 140 : 70 }}
              className="absolute left-[-9%] top-[16%] w-[54%] overflow-hidden rounded-[1.2em] border border-white/10 bg-[#0d1424] font-mono text-[1.12em] leading-[1.75] text-white/85 shadow-[0_3em_6em_-2em_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-[0.6em] border-b border-white/10 px-[1.2em] py-[0.7em]">
                <span className="h-[0.7em] w-[0.7em] rounded-full bg-white/25" /><span className="h-[0.7em] w-[0.7em] rounded-full bg-white/15" />
                <span className="ml-[0.6em] rounded-[0.4em] bg-white/10 px-[0.8em] py-[0.15em] text-[0.9em] text-white/70">Hero.jsx</span>
              </div>
              <div className="px-[1.2em] py-[1em]">
                {CODE.map((tokens, i) => <CodeLine key={i} typing={typing} i={i} n={CODE.length} tokens={tokens} />)}
              </div>
              <Hotspot p={p} win={[0.57, 0.6, 0.7, 0.73]} x="62%" y="12%" label={t.hs.stack} down />
            </motion.div>
            <motion.div style={{ z: wide ? 60 : 30 }} className="pointer-events-none absolute inset-0">
              <Hotspot p={p} win={[0.58, 0.61, 0.7, 0.73]} x="82%" y="44%" label={t.hs.db} />
            </motion.div>

            {/* chips de lanzamiento */}
            {t.chips.map((c, i) => {
              const pos = [["-6%", "10%"], ["88%", "4%"], ["-4%", "86%"], ["84%", "90%"]][i];
              return <Chip key={c} p={chipsP} i={i} left={pos[0]} top={pos[1]} label={c} z={wide ? 100 : 50} />;
            })}
          </motion.div>
        </div>

        {/* 0 · entrada: el fundador (3D) apoyado sobre el titular */}
        <Beat p={p} win={[-1, -0.5, 0.045, 0.09]} interactive className={`inset-x-0 px-5 text-center ${wide ? "bottom-[clamp(5.5rem,11svh,7.5rem)]" : "bottom-[clamp(5.5rem,12svh,7rem)]"}`}>
          <motion.div style={{ scale: heroScale }}>
            <h1 className="display-hero relative mx-auto text-[clamp(2.4rem,7.2vw,6rem)] text-ink">
              {webgl && (
                <div className={`absolute left-1/2 -translate-x-1/2 ${wide ? "h-[min(50svh,520px)] w-[min(70vw,860px)]" : "h-[38svh] w-[100vw]"}`}
                  style={{ bottom: "calc(100% - 0.16em)" }}>
                  <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE, delay: 0.35 }} className="absolute inset-0">
                    <Suspense fallback={null}>
                      <FounderCharacter progress={p} className="!absolute inset-0" />
                    </Suspense>
                  </motion.div>
                </div>
              )}
              {[t.h1a, t.h1b].map((l, i) => (
                <span key={i} className="block overflow-hidden pb-[0.06em]">
                  <motion.span className={`block ${i ? "text-accent" : ""}`} initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.15 }}>{l}</motion.span>
                </span>
              ))}
            </h1>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-3 md:mt-9">
              <button onClick={() => scrollToId("contacto", 0)} data-cursor="Go" className="btn-primary">{t.cta1} <ArrowUpRight size={16} /></button>
              <button onClick={() => scrollToId("proyectos", 0)} data-cursor="View" className="btn-ghost">{t.cta2} <ArrowDownRight size={16} /></button>
            </motion.div>
          </motion.div>
        </Beat>

        {/* tagline de frente */}
        <Beat p={p} win={[0.085, 0.105, 0.135, 0.155]} className={`inset-x-0 px-6 text-center ${wide ? "bottom-[clamp(5.5rem,11svh,7.5rem)]" : "bottom-[clamp(6rem,16svh,9rem)]"}`}>
          <p className="text-[clamp(1.9rem,4.4vw,4rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em] text-ink">{t.tag[0]} <span className="text-accent">{t.tag[1]}</span></p>
        </Beat>

        {/* 1 · diseño (texto a la izquierda) */}
        <Beat p={p} win={[0.2, 0.24, 0.35, 0.39]} className={sideL}>
          <span className="eyebrow">{t.design.k}</span>
          <h2 className={`${H2} mt-4`}>{t.design.a}<br /><span className="text-accent">{t.design.b}</span></h2>
          <p className={LEAD}>{t.design.d}</p>
        </Beat>

        {/* 2 · desarrollo (texto a la derecha) */}
        <Beat p={p} win={[0.54, 0.58, 0.69, 0.73]} className={sideR}>
          <span className="eyebrow">{t.code.k}</span>
          <h2 className={`${H2} mt-4`}>{t.code.a}<br /><span className="text-accent">{t.code.b}</span></h2>
          <p className={LEAD}>{t.code.d}</p>
        </Beat>

        {/* 3 · lanzamiento */}
        <Beat p={p} win={[0.84, 0.88, 1.5, 2]} interactive className={sideL}>
          <span className="eyebrow">{t.launch.k}</span>
          <h2 className={`${H2} mt-4`}>{t.launch.a}<br /><span className="text-accent">{t.launch.b}</span></h2>
          <p className={LEAD}>{t.launch.d}</p>
          <button onClick={() => scrollToId("contacto", 0)} data-cursor="Go" className="btn-primary mt-7">{t.cta1} <ArrowUpRight size={16} /></button>
        </Beat>

        <ChapterNav p={p} items={t.nav} stage={ref} />
      </div>
    </section>
  );
}

function Chip({ p, i, left, top, label, z }) {
  const o = useTransform(p, [i * 0.15, i * 0.15 + 0.4], [0, 1]);
  const s = useTransform(p, [i * 0.15, i * 0.15 + 0.4], [0.6, 1]);
  return (
    <motion.span style={{ opacity: o, scale: s, left, top, z }}
      className="glass absolute z-30 flex items-center gap-[0.6em] whitespace-nowrap rounded-full px-[1.2em] py-[0.7em] text-[max(1.3em,8px)] font-bold uppercase tracking-[0.1em] text-ink">
      <span className="h-[0.7em] w-[0.7em] rounded-full bg-accent" /> {label}
    </motion.span>
  );
}

/* Índice de capítulos: dónde estás y salto directo a cada capítulo. */
function ChapterNav({ p, items, stage }) {
  const ranges = [CH.intro, CH.design, CH.code, CH.launch];
  const targets = [0, 0.29, 0.63, 0.93];
  const visible = useTransform(p, [0.97, 1], [1, 0]);
  const pe = useTransform(p, (v) => (v < 0.99 ? "auto" : "none"));
  return (
    <motion.nav aria-label="Capítulos" style={{ opacity: visible, pointerEvents: pe }}
      className="absolute inset-x-0 bottom-[max(1.1rem,env(safe-area-inset-bottom))] z-40 flex justify-center">
      <ol className="flex items-center gap-4 rounded-full border border-line/10 bg-bg/75 px-5 py-2.5 backdrop-blur-md sm:gap-7">
        {items.map(([short, label], i) => (
          <ChapterItem key={label} p={p} range={ranges[i]} short={short} label={label} onClick={() => stage.current && jumpTo(stage.current, targets[i])} />
        ))}
      </ol>
    </motion.nav>
  );
}
function ChapterItem({ p, range, short, label, onClick }) {
  const w = useTransform(p, [range[0], range[1]], ["0%", "100%"]);
  const o = useTransform(p, [range[0] - 0.001, range[0], range[1], range[1] + 0.001], [0.45, 1, 1, 0.45]);
  return (
    <motion.li style={{ opacity: o }}>
      <button onClick={onClick} data-cursor="Ir" className="flex flex-col gap-1.5 text-left">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink sm:text-[11px]">
          <span className="sm:hidden">{short}</span><span className="hidden sm:inline">{label}</span>
        </span>
        <span className="h-[2px] w-full min-w-[2.5rem] overflow-hidden rounded-full bg-ink/15"><motion.span style={{ width: w }} className="block h-full bg-accent" /></span>
      </button>
    </motion.li>
  );
}

/* Sin movimiento (prefers-reduced-motion): mismo contenido, estático. */
function HeroStatic({ t }) {
  return (
    <div className="relative flex min-h-[100svh] flex-col justify-center pb-16 pt-32 text-center">
      <div className="container-x">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1 className="display-hero mx-auto mt-6 text-[clamp(2.5rem,7.6vw,6.2rem)] text-ink">{t.h1a}<br /><span className="text-accent">{t.h1b}</span></h1>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => scrollToId("contacto", 0)} className="btn-primary">{t.cta1} <ArrowUpRight size={16} /></button>
          <button onClick={() => scrollToId("proyectos", 0)} className="btn-ghost">{t.cta2} <ArrowDownRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
