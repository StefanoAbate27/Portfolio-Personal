import React, { Suspense, lazy, useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { scrollToId } from "../hooks/useSmoothScroll";

const FounderCharacter = lazy(() => import("./FounderCharacter"));

/* Hero al estilo de daveholloway.uk: cielo ilustrado con nubes planas en capas
   (parallax con el ratón y deriva lenta), tarjeta "¡HOLA!" con borde y línea
   discontinua, y el fundador en 3D con acabado de ilustración a la derecha.
   Todo entra cuando el preloader abre la pantalla (evento "saae:reveal"). */

const EASE = [0.16, 1, 0.3, 1];

const COPY = {
  es: {
    hey: "¡HOLA!",
    body: <>Has llegado a <b>SAAE</b>, el estudio de <b>Stefano Abate</b>, CEO &amp; fundador. Diseñamos y desarrollamos software a medida que hace crecer negocios. Explora nuestro trabajo.</>,
    cta1: "Empezar un proyecto", cta2: "Ver trabajo",
  },
  en: {
    hey: "HEY!",
    body: <>You've arrived at <b>SAAE</b>, the studio of <b>Stefano Abate</b>, CEO &amp; founder. We design and build bespoke software that grows businesses. Feel free to explore our work.</>,
    cta1: "Start a project", cta2: "See work",
  },
};

/* Nube plana: unión de círculos sobre una base redondeada (todo del mismo color). */
function Cloud({ x, y, s = 1, fill, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={fill}>
      <rect x="-210" y="-10" width="470" height="80" rx="40" />
      <circle cx="-120" cy="0" r="70" />
      <circle cx="-20" cy="-55" r="100" />
      <circle cx="95" cy="-25" r="85" />
      <circle cx="185" cy="15" r="60" />
    </g>
  );
}

function useRevealed() {
  const [on, setOn] = useState(() => typeof window !== "undefined" && !!window.__saaeRevealed);
  useEffect(() => {
    if (on) return;
    const go = () => setOn(true);
    window.addEventListener("saae:reveal", go);
    return () => window.removeEventListener("saae:reveal", go);
  }, [on]);
  return on;
}

export default function Hero() {
  const { language } = useLanguage();
  const t = COPY[language] || COPY.es;
  const reduce = useReducedMotion();
  const revealed = useRevealed();

  // parallax de las capas del cielo con el ratón
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 }), sy = useSpring(my, { stiffness: 40, damping: 18 });
  const back = { x: useTransform(sx, (v) => v * -12), y: useTransform(sy, (v) => v * -6) };
  const mid = { x: useTransform(sx, (v) => v * -28), y: useTransform(sy, (v) => v * -12) };
  const front = { x: useTransform(sx, (v) => v * -50), y: useTransform(sy, (v) => v * -20) };
  useEffect(() => {
    const on = (e) => { mx.set(e.clientX / window.innerWidth - 0.5); my.set(e.clientY / window.innerHeight - 0.5); };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [mx, my]);

  const show = revealed || reduce;
  const letters = t.hey.split("");

  return (
    <div className="hero-sky relative h-[100svh] min-h-[560px] overflow-hidden text-[#f4efe4]">
      {/* cielo */}
      <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#18285c" />
            <stop offset="1" stopColor="#2d4a98" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#sky)" />
        {/* bandas de luz, como el cielo de la ilustración */}
        <path d="M-50 640 C 400 560, 900 600, 1650 520 L1650 600 C 1000 680, 450 650, -50 720 Z" fill="#33529f" opacity="0.55" />
        <path d="M-50 760 C 500 690, 1000 740, 1650 660 L1650 700 C 1000 790, 520 750, -50 820 Z" fill="#3a5bb0" opacity="0.45" />
      </svg>
      <div className="cloud-drift-slow absolute inset-0"><motion.svg aria-hidden style={back} className="absolute inset-[-4%] h-[108%] w-[108%]" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <Cloud x={260} y={210} s={1.25} fill="#22397a" />
        <Cloud x={1280} y={170} s={1.05} fill="#22397a" flip />
        <Cloud x={820} y={120} s={0.7} fill="#213677" />
      </motion.svg></div>
      <div className="cloud-drift absolute inset-0"><motion.svg aria-hidden style={mid} className="absolute inset-[-6%] h-[112%] w-[112%]" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <Cloud x={120} y={480} s={1.6} fill="#2a448f" />
        <Cloud x={1450} y={430} s={1.35} fill="#2a448f" flip />
      </motion.svg></div>
      <motion.svg aria-hidden style={front} className="absolute inset-[-8%] h-[116%] w-[116%]" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <Cloud x={420} y={900} s={2.1} fill="#34539f" />
        <Cloud x={1250} y={940} s={1.8} fill="#34539f" flip />
      </motion.svg>

      {/* fundador 3D */}
      <motion.div
        initial={{ y: "18%", opacity: 0 }} animate={show ? { y: "0%", opacity: 1 } : {}}
        transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}
        className="absolute -bottom-[9%] right-0 h-[64%] w-full sm:h-[84%] md:-bottom-[13%] md:h-[108%] md:w-[60vw] lg:w-[min(62vw,1040px)]"
      >
        <Suspense fallback={null}>
          <FounderCharacter framing="hero" className="h-full w-full" />
        </Suspense>
      </motion.div>

      {/* tarjeta ¡HOLA! */}
      <div className="relative z-10 flex h-full items-start px-5 pt-24 sm:px-8 md:items-center md:px-[5vw] md:pt-0">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }} animate={show ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
          style={{ transformOrigin: "0% 50%" }}
          className="w-full max-w-[34rem] rounded-xl border-2 border-[#0a0f1d] bg-[#203a82]/55 backdrop-blur-[2px] md:mt-24"
        >
          <h1 className="flex px-6 pb-7 pt-6 text-[clamp(3.6rem,10vw,8.2rem)] font-black leading-[0.82] md:pb-9 tracking-[-0.04em] text-[#0a0f1d] sm:px-8 md:pt-8" aria-label={t.hey}>
            {letters.map((ch, i) => (
              <motion.span key={i} aria-hidden className="inline-block"
                initial={{ y: "-120%", rotate: -12, opacity: 0 }} animate={show ? { y: "0%", rotate: 0, opacity: 1 } : {}}
                transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.55 + i * 0.07 }}>
                {ch}
              </motion.span>
            ))}
          </h1>
          <div className="border-t-2 border-dashed border-[#0a0f1d]" />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={show ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: EASE, delay: 0.95 }}
            className="px-6 pb-6 pt-5 sm:px-8 md:pb-8">
            <p className="text-[0.95rem] leading-relaxed text-[#f4efe4]/90 md:text-[1.05rem] [&_b]:font-bold [&_b]:text-[#f4efe4]">{t.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => scrollToId("contacto", 0)} data-cursor="Go"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#0a0f1d] bg-[#f4efe4] px-5 py-2.5 text-sm font-bold text-[#0a0f1d] transition-colors hover:bg-[#d4a85a]">
                {t.cta1} <ArrowUpRight size={16} />
              </button>
              <button onClick={() => scrollToId("proyectos", 0)} data-cursor="View"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#f4efe4]/80 px-5 py-2.5 text-sm font-bold text-[#f4efe4] transition-colors hover:bg-[#f4efe4] hover:text-[#0a0f1d]">
                {t.cta2} <ArrowDownRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
