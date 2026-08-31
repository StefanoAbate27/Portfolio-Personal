import React from "react";
import { motion } from "framer-motion";
import { Zap, Layers, UserCheck, BadgeCheck, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { scrollToId } from "../hooks/useSmoothScroll";

const content = {
  es: {
    eyebrow: "¿Por qué SAAE?",
    h1: "Tu proyecto,",
    h2: "listo en 4 semanas.",
    desc: "Nada de plantillas ni promesas vacías. Software a medida, trato directo y precio claro.",
    cta: "Empezar ahora",
    reasons: [
      [Zap, "Entrega ágil", "Avances visibles cada semana."],
      [Layers, "100% a medida", "Cada sistema, hecho para tu operación."],
      [UserCheck, "Trato directo", "Hablas con el fundador, no con un intermediario."],
      [BadgeCheck, "Precio claro", "Cotización en 24h, sin sorpresas."],
    ],
  },
  en: {
    eyebrow: "Why SAAE?",
    h1: "Your project,",
    h2: "ready in 4 weeks.",
    desc: "No templates, no empty promises. Bespoke software, direct contact, clear pricing.",
    cta: "Start now",
    reasons: [
      [Zap, "Agile delivery", "Visible progress every week."],
      [Layers, "100% bespoke", "Every system, built for your operation."],
      [UserCheck, "Direct contact", "You talk to the founder, not a middleman."],
      [BadgeCheck, "Clear pricing", "Quote in 24h, no surprises."],
    ],
  },
};

const ease = [0.16, 1, 0.3, 1];

export default function WhySaae() {
  const { language } = useLanguage();
  const t = content[language] || content.es;

  return (
    <div className="container-x py-24 md:py-32">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left — pitch */}
        <div className="lg:col-span-5">
          <span className="reveal eyebrow">— {t.eyebrow}</span>
          <h2 className="reveal title-depth mt-4 display-hero text-4xl leading-[1.05] text-ink sm:text-5xl md:text-6xl" data-delay="60">
            <span className="block">{t.h1}</span>
            <span className="block text-ink/85">{t.h2}</span>
          </h2>
          <p className="reveal mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg" data-delay="140">{t.desc}</p>
          <button onClick={() => scrollToId("contacto", -20)} data-cursor="Go" className="reveal btn-primary mt-8" data-delay="200">
            {t.cta} <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Right — reasons */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          {t.reasons.map(([Icon, title, desc], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}
              className="group rounded-2xl border border-line/12 bg-surface/40 p-6 backdrop-blur-sm transition-all duration-500 ease-expo hover:-translate-y-1 hover:border-accent/40"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-line/12 text-ink transition-colors duration-300 group-hover:text-accent">
                <Icon size={22} />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
