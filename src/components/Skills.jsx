import React from "react";
import DiceTray from "./DiceTray";
import {
  SiReact, SiJavascript, SiTypescript, SiNodedotjs, SiTailwindcss, SiFigma,
  SiPostgresql, SiElectron, SiVite, SiStripe, SiVercel, SiSupabase, SiPython,
} from "react-icons/si";
import { useLanguage } from "../context/LanguageContext";
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

export default function Skills() {
  const { language } = useLanguage();
  const t = content[language] || content.es;
  const diceLabels = language === "es"
    ? { throw: "Lanzar dados", order: "Ordenar", hint: "Arrastra un dado y suéltalo para lanzarlo · doble clic para ordenar" }
    : { throw: "Roll the dice", order: "Arrange", hint: "Drag a die and let go to throw it · double-click to arrange" };

  return (
    <div className="py-24 md:py-32">
      <div className="container-x">
        {/* Header */}
        <div className="mb-14 reveal">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="display-hero mt-5 text-7xl text-ink sm:text-8xl md:text-[9rem]">{t.title}</h2>
        </div>

        {/* Intro + logo */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="reveal lg:col-span-7">
            <p className="max-w-xl text-lg font-medium leading-relaxed tracking-tight text-ink/80 md:text-xl">{t.intro}</p>
            <blockquote className="mt-7 max-w-xl border-l-2 border-accent pl-5 text-lg font-semibold leading-snug tracking-tight text-ink md:text-xl">
              {t.philosophy}
            </blockquote>

            <div className="mt-12">
              <span className="eyebrow">{t.valuesLabel}</span>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {t.values.map(([vt, vd], i) => (
                  <div key={vt} className="glass glass-hover rounded-2xl p-6">
                    <span className="text-3xl font-light text-accent">0{i + 1}</span>
                    <h4 className="mt-4 text-lg font-bold tracking-tight text-ink">{vt}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{vd}</p>
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
              <div className="text-2xl font-bold tracking-tight text-ink">SAAE</div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{language === "es" ? "Estudio" : "Studio"}</div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-20">
          <span className="reveal eyebrow">{language === "es" ? "Servicios" : "Services"}</span>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
            {t.services.map(([title, desc], i) => (
              <div key={title} className="reveal glass glass-hover group flex gap-6 rounded-3xl p-7 md:p-8" data-delay={i * 70}>
                <span className="text-4xl font-light leading-none text-accent md:text-5xl">0{i + 1}</span>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-ink md:text-2xl">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tecnologías: mesa de dados con física */}
      <div className="container-x mt-24 pb-[18vh]">
        <div className="mb-10 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="eyebrow">{t.stackTitle}</span>
          <span className="text-sm text-muted">{t.stackNote}</span>
        </div>
        <DiceTray items={stack} labels={diceLabels} />
      </div>
    </div>
  );
}
