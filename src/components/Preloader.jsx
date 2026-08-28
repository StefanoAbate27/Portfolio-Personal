import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import SaaeLogo from "./SaaeLogo";

/** Intro counter 0 → 100 with the SAAE isotype filling left→right beside it. */
export default function Preloader({ onDone }) {
  const { language } = useLanguage();
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);
  const LOGO = 150;

  useEffect(() => {
    let raf;
    const start = performance.now();
    const DURATION = 2000;
    const tick = (now) => {
      const p = Math.min((now - start) / DURATION, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setGone(true), 420);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col justify-between bg-bg px-6 py-6 md:px-10 md:py-8"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-semibold tracking-[0.16em] text-ink">SAAE</span>
            <span className="label text-muted">{language === "es" ? "Cargando" : "Loading"}</span>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-8 md:gap-14">
              {/* Count (left) */}
              <div className="flex items-end">
                <span className="display-hero text-8xl leading-[0.8] text-ink md:text-[9rem]">
                  {String(count).padStart(2, "0")}
                </span>
                <span className="mb-3 ml-1 text-lg text-accent md:mb-6">%</span>
              </div>

              {/* Filling logo (right, larger, fills left→right) */}
              <div className="relative shrink-0" style={{ width: LOGO, height: LOGO }}>
                <div className="absolute inset-0 opacity-20">
                  <SaaeLogo size={LOGO} tone="auto" />
                </div>
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${count}%` }}>
                  <SaaeLogo size={LOGO} tone="auto" className="!max-w-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between label text-muted">
            <span>{language === "es" ? "Estudio de Desarrollo Web" : "Web Development Studio"}</span>
            <span>© 2025</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
