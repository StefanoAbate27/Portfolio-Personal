import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { scrollToId } from "../hooks/useSmoothScroll";
import SaaeLogo from "./SaaeLogo";

const ease = [0.16, 1, 0.3, 1];

export default function Hero() {
  const { language } = useLanguage();

  const t = {
    es: {
      eyebrow: "Estudio de Desarrollo Web",
      h1a: "Software que domina el mercado.",
      h1b: "Ingeniería que respalda tu negocio.",
      desc: "Plataformas web a medida que impulsan tu negocio.",
      cta1: "Empezar un proyecto",
      cta2: "Ver trabajo",
      scroll: "Desliza",
      stats: [
        ["4 sem", "Del boceto al lanzamiento"],
        ["100%", "A medida"],
        ["2025", "Fundado"],
      ],
    },
    en: {
      eyebrow: "Web Development Studio",
      h1a: "Software that dominates the market.",
      h1b: "Engineering that backs your business.",
      desc: "Bespoke web platforms that drive your business.",
      cta1: "Start a project",
      cta2: "See work",
      scroll: "Scroll",
      stats: [
        ["4 wks", "Sketch to launch"],
        ["100%", "Bespoke"],
        ["2025", "Founded"],
      ],
    },
  }[language];

  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-12 text-center md:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}
        className="mb-8 inline-flex items-center gap-3"
      >
        <SaaeLogo size={26} tone="auto" />
        <span className="eyebrow">{t.eyebrow}</span>
      </motion.div>

      <h1 className="display-hero title-depth mx-auto max-w-5xl text-ink">
        <span className="block overflow-hidden">
          <motion.span className="block text-[8vw] leading-[1.05] md:text-[4.4vw]"
            initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease, delay: 0.15 }}>
            {t.h1a}
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span className="block text-[8vw] leading-[1.1] text-ink/85 md:text-[4.4vw]"
            initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease, delay: 0.32 }}>
            {t.h1b}
          </motion.span>
        </span>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.6 }}
        className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg"
      >
        {t.desc}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.75 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <button onClick={() => scrollToId("contacto", -20)} data-cursor="Go" className="btn-primary">
          {t.cta1} <ArrowUpRight size={15} />
        </button>
        <button onClick={() => scrollToId("proyectos", -20)} data-cursor="View" className="btn-ghost">
          {t.cta2} <ArrowDownRight size={15} />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
        className="mt-16 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-muted"
      >
        <span className="h-8 w-px animate-pulse bg-line/30" />
        {t.scroll}
      </motion.div>
    </div>
  );
}
