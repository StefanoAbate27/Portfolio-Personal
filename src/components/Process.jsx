import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

const content = {
  es: {
    eyebrow: "Cómo trabajamos",
    title: "Proceso",
    lead: "Un método claro, sin sorpresas. De principio a fin.",
    steps: [
      ["01", "Semana 1", "Descubrimiento"],
      ["02", "Semana 1–2", "Diseño"],
      ["03", "Semana 2–4", "Desarrollo"],
      ["04", "Semana 4", "Lanzamiento"],
    ],
  },
  en: {
    eyebrow: "How we work",
    title: "Process",
    lead: "A clear method, no surprises. From start to finish.",
    steps: [
      ["01", "Week 1", "Discovery"],
      ["02", "Week 1–2", "Design"],
      ["03", "Week 2–4", "Development"],
      ["04", "Week 4", "Launch"],
    ],
  },
};

const ease = [0.16, 1, 0.3, 1];

export default function Process() {
  const { language } = useLanguage();
  const t = content[language] || content.es;

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
        {/* rail (desktop horizontal) */}
        <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-line/15 md:block">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-accent/70 to-accent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.1, ease }}
          />
        </div>
        {/* rail (mobile vertical) */}
        <div className="absolute bottom-6 left-[27px] top-6 w-px bg-line/15 md:hidden">
          <motion.div
            className="w-full origin-top bg-gradient-to-b from-accent/70 to-accent"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease }}
          />
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
          {t.steps.map(([num, week, title], i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.15 }}
              className="group flex items-center gap-5 md:flex-col md:items-center md:gap-0 md:text-center"
            >
              {/* node */}
              <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line/20 bg-bg font-display text-sm font-semibold text-ink transition-colors duration-300 group-hover:border-accent">
                {num}
                <span className="absolute inset-0 -z-10 rounded-full bg-accent/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              {/* label */}
              <div className="md:mt-6">
                <span className="label text-accent">{week}</span>
                <h3 className="mt-1.5 font-display text-2xl font-semibold text-ink md:text-3xl">{title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
