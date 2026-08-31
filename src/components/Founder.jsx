import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FaLinkedinIn, FaGithub, FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import heroImg from "../assets/hero.jpg";
import SaaeLogo from "./SaaeLogo";

const ease = [0.16, 1, 0.3, 1];

export default function Founder() {
  const { language } = useLanguage();

  const t = {
    es: {
      eyebrow: "El Fundador",
      name: "Stefano Abate",
      role: "CEO & Fundador",
      lead: "“Construyo software con la intención de una pieza de maestría.”",
      p1: "Ingeniero de Sistemas y full-stack con 3 años de experiencia. Fundé SAAE en 2025 para construir sistemas web a medida — no plantillas.",
      p2: "Acompaño cada proyecto de principio a fin: diseño, desarrollo y lanzamiento.",
      quote: "El buen software se nota cuando no se nota.",
      cta: "Contáctame",
      stats: [["3 años", "Full-Stack"], ["+15", "Proyectos"], ["2025", "Fundó SAAE"]],
    },
    en: {
      eyebrow: "The Founder",
      name: "Stefano Abate",
      role: "CEO & Founder",
      lead: "“I build software with the intent of a piece of mastery.”",
      p1: "Systems Engineer and full-stack developer, 3 years in. I founded SAAE in 2025 to build bespoke web systems — not templates.",
      p2: "I guide every project end to end: design, development and launch.",
      quote: "Good software is noticed when it goes unnoticed.",
      cta: "Contact me",
      stats: [["3 yrs", "Full-Stack"], ["+15", "Projects"], ["2025", "Founded SAAE"]],
    },
  }[language];

  return (
    <div className="container-x py-24 md:py-32">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease }}
          className="lg:col-span-5"
        >
          <div className="group relative mx-auto max-w-sm">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-line/15 bg-surface">
              <img src={heroImg} alt="Stefano Abate — CEO & Fundador de SAAE"
                className="h-full w-full object-cover object-[50%_20%] grayscale-[0.1] transition-transform duration-[900ms] ease-expo group-hover:scale-[1.04]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent mix-blend-multiply" />
            </div>
            {/* signature chip */}
            <div className="absolute -bottom-5 -right-4 flex items-center gap-2.5 rounded-2xl border border-line/15 bg-elevated px-4 py-3 shadow-xl">
              <SaaeLogo size={26} tone="auto" />
              <div>
                <div className="font-display text-sm font-semibold leading-none text-ink">{t.name}</div>
                <div className="mt-1 label text-accent">{t.role}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <div className="lg:col-span-7">
          <span className="reveal eyebrow">— {t.eyebrow}</span>
          <h2 className="reveal mt-4 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl" data-delay="60">
            {t.name}
          </h2>
          <p className="reveal mt-6 max-w-xl font-display text-lg italic text-ink/80 md:text-xl" data-delay="120">
            {t.lead}
          </p>
          <div className="reveal mt-6 max-w-xl space-y-4 text-sm leading-relaxed text-muted md:text-base" data-delay="180">
            <p>{t.p1}</p>
            <p>{t.p2}</p>
          </div>

          <div className="reveal mt-8 grid max-w-lg grid-cols-3 divide-x divide-line/12 border-y border-line/12 py-6" data-delay="220">
            {t.stats.map(([n, l]) => (
              <div key={l} className="px-4 first:pl-0">
                <div className="font-display text-2xl font-semibold text-ink md:text-3xl">{n}</div>
                <div className="mt-1.5 text-[11px] text-muted">{l}</div>
              </div>
            ))}
          </div>

          <div className="reveal mt-8 flex items-center gap-3" data-delay="260">
            <a href="https://www.linkedin.com/in/stefano-abate-75b362345" target="_blank" rel="noopener noreferrer" data-cursor="Abrir"
              className="grid h-11 w-11 place-items-center rounded-full border border-line/15 text-ink transition-colors hover:border-ink">
              <FaLinkedinIn size={16} />
            </a>
            <a href="https://github.com/StefanoAbate27" target="_blank" rel="noopener noreferrer" data-cursor="Abrir"
              className="grid h-11 w-11 place-items-center rounded-full border border-line/15 text-ink transition-colors hover:border-ink">
              <FaGithub size={16} />
            </a>
            <a href="https://wa.me/584247582675" target="_blank" rel="noopener noreferrer" data-cursor="Chat"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 label text-bg transition-transform duration-500 ease-expo hover:-translate-y-0.5">
              <FaWhatsapp size={14} /> {t.cta}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
