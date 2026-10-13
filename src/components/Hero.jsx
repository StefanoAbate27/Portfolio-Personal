import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { scrollToId } from "../hooks/useSmoothScroll";

const ease = [0.16, 1, 0.3, 1];

export default function Hero() {
  const { language } = useLanguage();

  const t = {
    es: {
      eyebrow: "Estudio de Desarrollo Web",
      h1a: "Software que domina.",
      h1b: "Ingeniería que respalda.",
      cta1: "Empezar un proyecto",
      cta2: "Ver trabajo",
    },
    en: {
      eyebrow: "Web Development Studio",
      h1a: "Software that dominates.",
      h1b: "Engineering that backs you.",
      cta1: "Start a project",
      cta2: "See work",
    },
  }[language];

  const line = (text, delay, cls = "") => (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className={`block ${cls}`}
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1, ease, delay }}
      >
        {text}
      </motion.span>
    </span>
  );

  return (
    <div className="relative flex min-h-[100svh] flex-col justify-end pb-16 pt-32 md:pb-20">
      <div className="container-x">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="eyebrow"
        >
          {t.eyebrow}
        </motion.span>

        <h1 className="display-hero mt-6 text-[10.5vw] text-ink md:text-[6vw] xl:text-[5.6rem]">
          {line(t.h1a, 0.2)}
          {line(t.h1b, 0.35, "text-accent")}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center gap-3 md:mt-14"
        >
          <button onClick={() => scrollToId("contacto", -20)} data-cursor="Go" className="btn-primary">
            {t.cta1} <ArrowUpRight size={16} />
          </button>
          <button onClick={() => scrollToId("proyectos", -20)} data-cursor="View" className="btn-ghost">
            {t.cta2} <ArrowDownRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
