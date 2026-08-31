import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

const content = {
  es: {
    eyebrow: "Cómo trabajamos",
    title: "Proceso",
    lead: "Un método claro, sin sorpresas. Entregas y validación en cada fase.",
    weekLabel: "Semana",
    steps: [
      {
        w: "01", week: "Semana 1", title: "Descubrimiento",
        desc: "Entendemos tu operación y definimos el alcance.",
        items: ["Reunión de kickoff", "Definición de alcance", "Requisitos y prioridades"],
      },
      {
        w: "02", week: "Semana 1–2", title: "Diseño",
        desc: "Prototipamos y validamos antes de programar.",
        items: ["Wireframes y prototipo", "Identidad e interfaz", "Validación con el cliente"],
      },
      {
        w: "03", week: "Semana 2–4", title: "Desarrollo",
        desc: "Construimos con avances visibles cada semana.",
        items: ["Frontend + backend", "Integraciones y pagos", "Revisiones semanales"],
      },
      {
        w: "04", week: "Semana 4", title: "Lanzamiento",
        desc: "Desplegamos, medimos y damos soporte.",
        items: ["Deploy a producción", "Pruebas y ajustes", "Entrega y soporte"],
      },
    ],
    guarantee: "Plazo máximo garantizado",
    guaranteeBig: "4 semanas",
  },
  en: {
    eyebrow: "How we work",
    title: "Process",
    lead: "A clear method, no surprises. Deliverables and validation at every phase.",
    weekLabel: "Week",
    steps: [
      {
        w: "01", week: "Week 1", title: "Discovery",
        desc: "We understand your operation and define scope.",
        items: ["Kickoff meeting", "Scope definition", "Requirements & priorities"],
      },
      {
        w: "02", week: "Week 1–2", title: "Design",
        desc: "We prototype and validate before coding.",
        items: ["Wireframes & prototype", "Identity & interface", "Client validation"],
      },
      {
        w: "03", week: "Week 2–4", title: "Development",
        desc: "We build with visible progress every week.",
        items: ["Frontend + backend", "Integrations & payments", "Weekly reviews"],
      },
      {
        w: "04", week: "Week 4", title: "Launch",
        desc: "We deploy, measure and provide support.",
        items: ["Production deploy", "Testing & tweaks", "Handover & support"],
      },
    ],
    guarantee: "Guaranteed max timeline",
    guaranteeBig: "4 weeks",
  },
};

const ease = [0.16, 1, 0.3, 1];

export default function Process() {
  const { language } = useLanguage();
  const t = content[language] || content.es;

  return (
    <div className="container-x py-24 md:py-32">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div className="reveal">
          <span className="eyebrow">— {t.eyebrow}</span>
          <h2 className="display-hero mt-4 text-5xl text-ink sm:text-6xl md:text-7xl">{t.title}</h2>
        </div>
        <p className="reveal max-w-md text-sm leading-relaxed text-muted md:text-base" data-delay="100">{t.lead}</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-0 top-[42px] hidden h-px w-full bg-line/15 lg:block" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {t.steps.map((s, i) => (
            <motion.div
              key={s.w}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}
              className="relative"
            >
              {/* node */}
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-line/20 bg-bg font-display text-sm font-semibold text-ink">
                  {s.w}
                </span>
                <span className="label text-accent">{s.week}</span>
              </div>

              <h3 className="mb-3 font-display text-2xl font-semibold text-ink">{s.title}</h3>
              <p className="mb-5 text-sm leading-relaxed text-muted">{s.desc}</p>

              <ul className="space-y-2">
                {s.items.map((it) => (
                  <li key={it} className="flex items-center gap-2.5 text-sm text-ink/80">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
