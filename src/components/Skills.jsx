import React, { useRef, useState, useMemo, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  SiReact, SiJavascript, SiTypescript, SiNodedotjs, SiTailwindcss, SiFigma,
  SiPostgresql, SiElectron, SiVite, SiStripe, SiVercel, SiSupabase, SiPython,
} from "react-icons/si";
import { useLanguage } from "../context/LanguageContext";
import Marquee from "./Marquee";
import SaaeLogo from "./SaaeLogo";

const stack = [
  { name: "React", icon: SiReact }, { name: "JavaScript", icon: SiJavascript },
  { name: "TypeScript", icon: SiTypescript }, { name: "Node.js", icon: SiNodedotjs },
  { name: "Tailwind", icon: SiTailwindcss }, { name: "Figma", icon: SiFigma },
  { name: "Postgres", icon: SiPostgresql }, { name: "Electron", icon: SiElectron },
  { name: "Vite", icon: SiVite }, { name: "Stripe", icon: SiStripe },
  { name: "Vercel", icon: SiVercel }, { name: "Supabase", icon: SiSupabase },
];

const content = {
  es: {
    eyebrow: "Sobre Nosotros",
    title: "El Estudio",
    intro: "Estudio de desarrollo web fundado en 2025. Construimos plataformas a medida — no plantillas — que impulsan tu negocio.",
    philosophy: "El buen software se nota cuando no se nota.",
    valuesLabel: "Nuestros valores",
    values: [
      ["Maestría", "Código limpio, detalle en cada línea."],
      ["Claridad", "Interfaces simples que la gente entiende."],
      ["Velocidad", "Del boceto al lanzamiento sin demoras."],
    ],
    services: [
      ["Desarrollo Web", "Apps y plataformas a medida con React y Node."],
      ["Producto & UX", "Interfaces claras centradas en resultados."],
      ["Sistemas internos", "Paneles, reportes y automatización."],
      ["Del boceto al lanzamiento", "Componentes reutilizables, menos deuda técnica."],
    ],
    stackTitle: "Tecnologías",
    stackNote: "Herramientas modernas para construir rápido y sólido.",
  },
  en: {
    eyebrow: "About Us",
    title: "The Studio",
    intro: "Web development studio founded in 2025. We build bespoke platforms — not templates — that drive your business.",
    philosophy: "Good software is noticed when it goes unnoticed.",
    valuesLabel: "Our values",
    values: [
      ["Mastery", "Clean code, detail in every line."],
      ["Clarity", "Simple interfaces people understand."],
      ["Speed", "From sketch to launch, no delays."],
    ],
    services: [
      ["Web Development", "Bespoke apps and platforms with React and Node."],
      ["Product & UX", "Clear interfaces focused on results."],
      ["Internal systems", "Dashboards, reports and automation."],
      ["Sketch to launch", "Reusable components, less technical debt."],
    ],
    stackTitle: "Technologies",
    stackNote: "Modern tools to build fast and solid.",
  },
};

function LogoVector() {
  return (
    <div className="relative grid h-full w-full place-items-center">
      {/* orbit rings */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" fill="none">
        <g className="origin-center [animation:spin-slow_30s_linear_infinite]" style={{ transformBox: "fill-box" }}>
          <circle cx="200" cy="200" r="170" stroke="rgb(var(--line) / 0.12)" strokeDasharray="2 10" />
          <circle cx="200" cy="200" r="130" stroke="rgb(var(--line) / 0.16)" />
          <circle cx="370" cy="200" r="5" fill="rgb(var(--accent))" />
          <circle cx="200" cy="70" r="3.5" fill="rgb(var(--ink) / 0.45)" />
        </g>
        <g className="origin-center [animation:spin-slow_44s_linear_infinite_reverse]" style={{ transformBox: "fill-box" }}>
          <circle cx="200" cy="200" r="98" stroke="rgb(var(--line) / 0.14)" strokeDasharray="1 12" />
          <circle cx="102" cy="200" r="3" fill="rgb(var(--accent) / 0.8)" />
        </g>
      </svg>
      {/* original studio logo */}
      <SaaeLogo size={168} tone="auto" className="relative drop-shadow-sm" />
    </div>
  );
}

function TechCube({ Icon, i, reorderTick, onGrab, onRelease, dragRef }) {
  const controls = useAnimation();
  const rnd = useMemo(() => ({
    x: (Math.random() - 0.5) * 240,
    y: (Math.random() - 0.5) * 130,
    rot: (Math.random() - 0.5) * 140,
    rest: (Math.random() - 0.5) * 12,
  }), []);

  // entrance: fall in and land scattered / disordered
  useEffect(() => {
    controls.start({
      x: rnd.x, y: rnd.y, rotate: rnd.rot, opacity: 1,
      transition: { type: "spring", stiffness: 190, damping: 13, mass: 1, delay: i * 0.05 },
    });
  }, []); // eslint-disable-line

  // reorder to the grid whenever the tick advances
  useEffect(() => {
    if (reorderTick > 0) {
      controls.start({
        x: 0, y: 0, rotate: rnd.rest, opacity: 1,
        transition: { type: "spring", stiffness: 170, damping: 15, mass: 1, delay: i * 0.03 },
      });
    }
  }, [reorderTick]); // eslint-disable-line

  return (
    <motion.div
      initial={{ y: -420, opacity: 0, rotate: rnd.rot }}
      animate={controls}
      drag
      dragConstraints={dragRef}
      dragElastic={0.5}
      dragMomentum
      onDragStart={onGrab}
      onDragEnd={onRelease}
      whileDrag={{ scale: 1.18, zIndex: 50, cursor: "grabbing" }}
      whileHover={{ scale: 1.08 }}
      className="scene mx-auto cursor-grab active:cursor-grabbing"
      style={{ "--cs": "76px" }}
    >
      <div className="cube" style={{ animationDelay: `${-i * 0.8}s` }}>
        {["f", "b", "r", "l", "t", "d"].map((face) => (
          <div key={face} className={`cube-face ${face}`}>
            <Icon size={30} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const { language } = useLanguage();
  const t = content[language] || content.es;
  const cubesRef = useRef(null);
  const [reorderTick, setReorderTick] = useState(0);
  const reorderTimer = useRef(null);

  const scheduleReorder = (delay) => {
    clearTimeout(reorderTimer.current);
    reorderTimer.current = setTimeout(() => setReorderTick((n) => n + 1), delay);
  };
  useEffect(() => () => clearTimeout(reorderTimer.current), []);

  const orderNow = () => {
    clearTimeout(reorderTimer.current);
    setReorderTick((n) => n + 1);
  };
  const onGrab = () => clearTimeout(reorderTimer.current);
  const onRelease = () => scheduleReorder(3000); // reorder 3s after the last throw
  const labelsOn = reorderTick > 0;

  return (
    <div className="py-24 md:py-32">
      <div className="container-x">
        {/* Header */}
        <div className="mb-14 reveal">
          <span className="eyebrow">— {t.eyebrow}</span>
          <h2 className="display-hero title-glow mt-4 text-5xl text-ink sm:text-6xl md:text-7xl">{t.title}</h2>
        </div>

        {/* Intro + vector */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="reveal lg:col-span-7">
            <p className="max-w-xl text-lg leading-relaxed text-muted md:text-xl">{t.intro}</p>
            <p className="mt-6 max-w-xl font-display text-xl italic text-ink/80">“{t.philosophy}”</p>

            <div className="mt-10">
              <span className="label text-muted">{t.valuesLabel}</span>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {t.values.map(([vt, vd]) => (
                  <div key={vt} className="rounded-2xl border border-line/12 bg-surface/40 p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <h4 className="font-display text-base font-semibold text-ink">{vt}</h4>
                    </div>
                    <p className="text-sm leading-relaxed text-muted">{vd}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal lg:col-span-5 lg:-translate-y-10" data-delay="120">
            <div className="relative mx-auto aspect-square w-full max-w-[360px]">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-accent/10 blur-3xl" />
              <LogoVector />
            </div>
            <div className="mt-2 text-center">
              <div className="font-display text-2xl font-semibold tracking-[0.14em] text-ink">SAAE</div>
              <div className="mt-1 label text-muted">{language === "es" ? "Estudio" : "Studio"}</div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line/12 bg-line/12 sm:grid-cols-2 lg:grid-cols-4">
          {t.services.map(([title, desc], i) => (
            <div key={title} className="reveal group relative bg-bg p-7 transition-colors duration-300 hover:bg-surface/60" data-delay={i * 70}>
              <div className="mb-8 flex items-center justify-between">
                <span className="label text-muted">0{i + 1}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <h3 className="mb-3 font-display text-xl font-semibold text-ink">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stack marquee — smaller & slower */}
      <div className="mt-20 border-y border-line/12 py-3.5">
        <Marquee items={stack.map((s) => s.name)} speed="slow" className="text-base font-medium uppercase tracking-[0.16em] text-muted md:text-lg" />
      </div>

      {/* Tech cubes */}
      <div className="container-x mt-16">
        <div className="mb-10 flex items-center gap-2.5">
          <SaaeLogo size={18} tone="auto" />
          <span className="label text-muted">{t.stackTitle}</span>
          <span className="ml-2 text-sm text-muted">— {t.stackNote}</span>
        </div>
        <div className="mb-3 flex items-center gap-2 text-[11px] italic text-muted/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {reorderTick === 0
            ? (language === "es" ? "· Haz clic para ordenarlos ·" : "· Click to arrange them ·")
            : (language === "es" ? "· Arrástralos y lánzalos — se reordenan solos ·" : "· Drag & throw them — they tidy up on their own ·")}
        </div>
        <div
          ref={cubesRef}
          onClick={orderNow}
          className="relative grid cursor-pointer grid-cols-2 justify-items-center gap-y-14 overflow-visible pt-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {stack.map(({ name, icon: Icon }, i) => (
            <div key={name} className="flex flex-col items-center gap-4">
              <TechCube Icon={Icon} i={i} reorderTick={reorderTick} onGrab={onGrab} onRelease={onRelease} dragRef={cubesRef} />
              <span className={`pointer-events-none text-[11px] text-muted transition-opacity duration-500 ${labelsOn ? "opacity-100" : "opacity-0"}`}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
