import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import heroImg from "../assets/hero.jpg";
import SaaeLogo from "./SaaeLogo";
import SocialFlip from "./SocialFlip";

const ease = [0.16, 1, 0.3, 1];

export default function Founder() {
  const { language } = useLanguage();

  const t = {
    es: {
      eyebrow: "El Fundador",
      name: "Stefano Abate",
      role: "CEO & Fundador",
      lead: "Construyo software con la intención de una pieza de maestría.",
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
      lead: "I build software with the intent of a piece of mastery.",
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
            <div className="glass relative aspect-[4/5] overflow-hidden rounded-3xl">
              <div data-zoom className="h-full w-full will-change-transform">
                <img src={heroImg} alt="Stefano Abate — CEO & Fundador de SAAE"
                  className="h-full w-full object-cover object-[50%_20%] grayscale-[0.1] transition-transform duration-[900ms] ease-expo group-hover:scale-[1.04]" />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent mix-blend-multiply" />
            </div>
            {/* signature chip */}
            <div data-parallax="-1.4" className="glass absolute -bottom-5 -right-4 flex items-center gap-2.5 rounded-2xl px-4 py-3">
              <SaaeLogo size={26} tone="auto" />
              <div>
                <div className="text-sm font-bold leading-none tracking-tight text-ink">{t.name}</div>
                <div className="mt-1 label text-accent">{t.role}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <div className="lg:col-span-7">
          <span className="reveal eyebrow">{t.eyebrow}</span>
          <h2 className="reveal mt-5 text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-ink sm:text-5xl md:text-6xl" data-delay="60">
            <span className="block">{t.name}</span>
            <span className="block text-accent">{t.role}</span>
          </h2>
          <p className="reveal mt-7 max-w-xl text-lg font-medium leading-snug tracking-tight text-ink/85 md:text-xl" data-delay="120">
            {t.lead}
          </p>
          <div className="reveal mt-5 max-w-xl space-y-3 text-base leading-relaxed text-muted" data-delay="180">
            <p>{t.p1}</p>
            <p>{t.p2}</p>
          </div>

          <div className="reveal mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line/10 pt-8" data-delay="220">
            {t.stats.map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl font-bold tracking-[-0.04em] text-ink md:text-4xl">{n}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted md:text-[11px]">{l}</div>
              </div>
            ))}
          </div>

          <div className="reveal mt-10 flex flex-wrap items-center gap-5" data-delay="260">
            <a href="https://wa.me/584247582675" target="_blank" rel="noopener noreferrer" data-cursor="Chat" className="btn-primary">
              <FaWhatsapp size={15} /> {t.cta}
            </a>
            <SocialFlip />
          </div>
        </div>
      </div>
    </div>
  );
}
