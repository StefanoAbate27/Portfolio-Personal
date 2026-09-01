import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const content = {
  es: {
    eyebrow: "Cómo trabajamos",
    title: "Proceso",
    lead: "Un método claro, sin sorpresas. Pasa el cursor o toca cada fase.",
    steps: [
      { num: "01", week: "Semana 1", title: "Descubrimiento", desc: "Entendemos tu operación, objetivos y usuarios. Definimos el alcance y las prioridades del proyecto.", items: ["Reunión de kickoff", "Definición de alcance", "Requisitos y prioridades"] },
      { num: "02", week: "Semana 1–2", title: "Diseño", desc: "Prototipamos la interfaz y el flujo. Validamos contigo antes de escribir una sola línea de código.", items: ["Wireframes y prototipo", "Identidad e interfaz", "Validación con el cliente"] },
      { num: "03", week: "Semana 2–4", title: "Desarrollo", desc: "Construimos con código limpio y componentes reutilizables, con avances visibles cada semana.", items: ["Frontend + backend", "Integraciones y pagos", "Revisiones semanales"] },
      { num: "04", week: "Semana 4", title: "Lanzamiento", desc: "Desplegamos a producción, medimos y te entregamos todo listo, con soporte posterior.", items: ["Deploy a producción", "Pruebas y ajustes", "Entrega y soporte"] },
    ],
  },
  en: {
    eyebrow: "How we work",
    title: "Process",
    lead: "A clear method, no surprises. Hover or tap each phase.",
    steps: [
      { num: "01", week: "Week 1", title: "Discovery", desc: "We understand your operation, goals and users. We define the scope and priorities of the project.", items: ["Kickoff meeting", "Scope definition", "Requirements & priorities"] },
      { num: "02", week: "Week 1–2", title: "Design", desc: "We prototype the interface and flow. We validate with you before writing a single line of code.", items: ["Wireframes & prototype", "Identity & interface", "Client validation"] },
      { num: "03", week: "Week 2–4", title: "Development", desc: "We build with clean code and reusable components, with visible progress every week.", items: ["Frontend + backend", "Integrations & payments", "Weekly reviews"] },
      { num: "04", week: "Week 4", title: "Launch", desc: "We deploy to production, measure and hand everything over ready, with ongoing support.", items: ["Production deploy", "Testing & tweaks", "Handover & support"] },
    ],
  },
};

const ease = [0.16, 1, 0.3, 1];

export default function Process() {
  const { language } = useLanguage();
  const t = content[language] || content.es;
  const [active, setActive] = useState(0);
  const steps = t.steps;
  const pct = (active / (steps.length - 1)) * 100;
  const cur = steps[active];

  return (
    <div className="container-x py-24 md:py-32">
      <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
        <div className="reveal">
          <span className="eyebrow">— {t.eyebrow}</span>
          <h2 className="display-hero title-glow mt-4 text-5xl text-ink sm:text-6xl md:text-7xl">{t.title}</h2>
        </div>
        <p className="reveal max-w-xs text-sm leading-relaxed text-muted" data-delay="100">{t.lead}</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* rail — desktop horizontal */}
        <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-line/15 md:block">
          <motion.div className="h-full origin-left bg-accent" animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease }} />
        </div>
        {/* rail — mobile vertical */}
        <div className="absolute bottom-6 left-[27px] top-6 w-px bg-line/15 md:hidden">
          <motion.div className="w-full origin-top bg-accent" animate={{ height: `${pct}%` }} transition={{ duration: 0.5, ease }} />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
          {steps.map((s, i) => {
            const on = active === i;
            return (
              <motion.button
                key={s.num}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                data-cursor={s.week}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease, delay: 0.1 + i * 0.12 }}
                className="group flex items-center gap-5 text-left md:flex-col md:items-center md:gap-0 md:text-center"
              >
                {/* node */}
                <span className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border font-display text-sm font-semibold transition-all duration-300
                  ${on ? "scale-110 border-accent bg-accent text-bg" : "border-line/20 bg-bg text-ink group-hover:border-accent"}`}>
                  {s.num}
                  <span className={`absolute inset-0 -z-10 rounded-full bg-accent/25 blur-md transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`} />
                </span>

                {/* label */}
                <span className="md:mt-6">
                  <span className={`label transition-colors ${on ? "text-accent" : "text-muted"}`}>{s.week}</span>
                  <span className={`mt-1.5 block font-display text-2xl font-semibold transition-colors md:text-3xl ${on ? "text-ink" : "text-ink/70 group-hover:text-ink"}`}>{s.title}</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Details panel */}
        <div className="reveal mt-12 overflow-hidden rounded-3xl border border-line/12 bg-surface/40 p-7 backdrop-blur-sm md:p-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease }}
              className="grid grid-cols-1 gap-8 lg:grid-cols-12"
            >
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-xs font-semibold text-bg">{cur.num}</span>
                  <span className="label text-accent">{cur.week}</span>
                </div>
                <h3 className="mt-4 font-display text-3xl font-semibold text-ink md:text-4xl">{cur.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">{cur.desc}</p>
              </div>

              <div className="lg:col-span-5">
                <span className="label text-muted">{language === "es" ? "Incluye" : "Includes"}</span>
                <ul className="mt-4 space-y-2.5">
                  {cur.items.map((it, k) => (
                    <motion.li
                      key={it}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + k * 0.08, duration: 0.4, ease }}
                      className="flex items-center gap-3 text-sm text-ink/85"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-accent/40 text-accent">
                        <Check size={12} />
                      </span>
                      {it}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
