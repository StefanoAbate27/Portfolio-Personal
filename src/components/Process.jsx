import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const content = {
  es: {
    eyebrow: "Cómo trabajamos",
    title: "Proceso",
    lead: "Un método claro, sin sorpresas. Pasa el cursor o toca cada fase.",
    includes: "Incluye",
    steps: [
      { num: "01", week: "Semana 1", title: "Descubrimiento", desc: "Entendemos tu operación y definimos el alcance y las prioridades.", items: ["Reunión de kickoff", "Definición de alcance", "Requisitos"] },
      { num: "02", week: "Semana 1–2", title: "Diseño", desc: "Prototipamos la interfaz y validamos contigo antes de programar.", items: ["Wireframes y prototipo", "Identidad e interfaz", "Validación"] },
      { num: "03", week: "Semana 2–4", title: "Desarrollo", desc: "Código limpio y componentes reutilizables, con avances cada semana.", items: ["Frontend + backend", "Integraciones y pagos", "Revisiones"] },
      { num: "04", week: "Semana 4", title: "Lanzamiento", desc: "Desplegamos a producción, medimos y entregamos con soporte.", items: ["Deploy a producción", "Pruebas y ajustes", "Soporte"] },
    ],
  },
  en: {
    eyebrow: "How we work",
    title: "Process",
    lead: "A clear method, no surprises. Hover or tap each phase.",
    includes: "Includes",
    steps: [
      { num: "01", week: "Week 1", title: "Discovery", desc: "We understand your operation and define scope and priorities.", items: ["Kickoff meeting", "Scope definition", "Requirements"] },
      { num: "02", week: "Week 1–2", title: "Design", desc: "We prototype the interface and validate before coding.", items: ["Wireframes & prototype", "Identity & interface", "Validation"] },
      { num: "03", week: "Week 2–4", title: "Development", desc: "Clean code and reusable components, with weekly progress.", items: ["Frontend + backend", "Integrations & payments", "Reviews"] },
      { num: "04", week: "Week 4", title: "Launch", desc: "We deploy to production, measure and hand over with support.", items: ["Production deploy", "Testing & tweaks", "Support"] },
    ],
  },
};

const ease = [0.16, 1, 0.3, 1];
const balloonT = { type: "spring", stiffness: 420, damping: 22 };

export default function Process() {
  const { language } = useLanguage();
  const t = content[language] || content.es;
  const [active, setActive] = useState(null);
  const steps = t.steps;
  const pct = active === null ? 0 : (active / (steps.length - 1)) * 100;

  return (
    <div className="container-x py-24 md:py-32">
      <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
        <div className="reveal">
          <span className="eyebrow">— {t.eyebrow}</span>
          <h2 className="display-hero title-glow mt-4 text-5xl text-ink sm:text-6xl md:text-7xl">{t.title}</h2>
        </div>
        <p className="reveal max-w-xs text-sm leading-relaxed text-muted" data-delay="100">{t.lead}</p>
      </div>

      {/* Timeline (space reserved below for the floating balloon) */}
      <div className="relative pb-[230px] md:pb-[240px]">
        {/* rail — desktop horizontal */}
        <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-line/15 md:block">
          <motion.div className="h-full origin-left bg-accent" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease }} />
        </div>
        {/* rail — mobile vertical */}
        <div className="absolute bottom-[248px] left-[27px] top-6 w-px bg-line/15 md:hidden">
          <motion.div className="w-full origin-top bg-accent" animate={{ height: `${pct}%` }} transition={{ duration: 0.5, ease }} />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
          {steps.map((s, i) => {
            const on = active === i;
            return (
              <div
                key={s.num}
                className="relative"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <motion.button
                  type="button"
                  onClick={() => setActive((cur) => (cur === i ? null : i))}
                  data-cursor={s.week}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease, delay: 0.1 + i * 0.12 }}
                  className="group flex w-full items-center gap-5 text-left md:flex-col md:items-center md:gap-0 md:text-center"
                >
                  {/* node / the balloon's circle */}
                  <span className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border font-display text-sm font-semibold transition-all duration-300
                    ${on ? "scale-110 border-accent bg-accent text-bg" : "border-line/20 bg-bg text-ink group-hover:border-accent"}`}>
                    {s.num}
                    <span className={`absolute inset-0 -z-10 rounded-full bg-accent/30 blur-md transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`} />
                  </span>
                  <span className="md:mt-6">
                    <span className={`label transition-colors ${on ? "text-accent" : "text-muted"}`}>{s.week}</span>
                    <span className={`mt-1.5 block font-display text-2xl font-semibold transition-colors md:text-3xl ${on ? "text-ink" : "text-ink/70 group-hover:text-ink"}`}>{s.title}</span>
                  </span>
                </motion.button>

                {/* Floating balloon — inflates from the circle, deflates back in */}
                <AnimatePresence>
                  {on && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={balloonT}
                      style={{ transformOrigin: "top center" }}
                      className="absolute left-0 top-full z-50 mt-4 w-[min(92vw,340px)] md:left-1/2 md:w-[290px] md:-translate-x-1/2"
                    >
                      {/* tail pointing up to the circle */}
                      <span className="absolute -top-1.5 left-[27px] h-3 w-3 rotate-45 border-l border-t border-line/15 bg-elevated md:left-1/2 md:-translate-x-1/2" />
                      <div className="relative rounded-[1.4rem] border border-line/15 bg-elevated/95 p-5 text-left shadow-[0_30px_70px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent font-display text-[11px] font-semibold text-bg">{s.num}</span>
                          <span className="label text-accent">{s.week}</span>
                        </div>
                        <h3 className="mt-3 font-display text-xl font-semibold text-ink">{s.title}</h3>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.desc}</p>
                        <span className="mt-4 block label text-muted">{t.includes}</span>
                        <ul className="mt-2 space-y-1.5">
                          {s.items.map((it, k) => (
                            <motion.li
                              key={it}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.12 + k * 0.06, duration: 0.3 }}
                              className="flex items-center gap-2.5 text-[13px] text-ink/85"
                            >
                              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-accent/40 text-accent">
                                <Check size={10} />
                              </span>
                              {it}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
