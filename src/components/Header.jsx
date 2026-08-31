import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { scrollToId } from "../hooks/useSmoothScroll";
import SaaeLogo from "./SaaeLogo";

const container = {
  closed: { opacity: 0, y: -12, scale: 0.9, transition: { when: "afterChildren", staggerChildren: 0.03, staggerDirection: -1, duration: 0.25 } },
  open: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 26, when: "beforeChildren", staggerChildren: 0.05 } },
};
const item = {
  closed: { opacity: 0, y: 10 },
  open: { opacity: 1, y: 0 },
};

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const nav = {
    es: { fundador: "Fundador", nosotros: "Nosotros", proceso: "Proceso", proyectos: "Proyectos", porque: "Por qué", contacto: "Contacto", cta: "Empecemos", menu: "Menú" },
    en: { fundador: "Founder", nosotros: "About", proceso: "Process", proyectos: "Work", porque: "Why", contacto: "Contact", cta: "Start", menu: "Menu" },
  }[language];

  const links = [
    ["fundador", nav.fundador],
    ["nosotros", nav.nosotros],
    ["proceso", nav.proceso],
    ["proyectos", nav.proyectos],
    ["por-que", nav.porque],
    ["contacto", nav.contacto],
  ];

  useEffect(() => {
    if (open) window.__lenis && window.__lenis.stop();
    else window.__lenis && window.__lenis.start();
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id) => {
    setOpen(false);
    setTimeout(() => scrollToId(id, -20), 140);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[95] flex justify-center px-4 py-4">
        <div className="flex items-center gap-1 rounded-full border border-line/12 bg-bg/75 px-2 py-1.5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {/* brand */}
          <button onClick={() => go("inicio")} data-cursor="Top" className="group flex items-center gap-2 rounded-full px-2.5 py-1.5 text-ink">
            <SaaeLogo size={22} tone="auto" className="transition-transform duration-500 ease-expo group-hover:scale-110" />
            <span className="font-display text-sm font-semibold tracking-[0.14em]">SAAE</span>
          </button>

          <span className="mx-1 hidden h-4 w-px bg-line/15 sm:block" />

          {/* language */}
          <div className="hidden items-center sm:flex">
            <button onClick={() => language !== "es" && toggleLanguage()}
              className={`rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${language === "es" ? "text-ink" : "text-muted hover:text-ink"}`}>ES</button>
            <button onClick={() => language !== "en" && toggleLanguage()}
              className={`rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${language === "en" ? "text-ink" : "text-muted hover:text-ink"}`}>EN</button>
          </div>

          {/* theme */}
          <button onClick={toggleTheme} aria-label="Theme"
            className="grid h-8 w-8 place-items-center rounded-full text-ink transition-colors hover:text-accent">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* hamburger (all sizes) */}
          <button onClick={() => setOpen((v) => !v)} data-cursor={nav.menu} aria-label="Menu"
            className="grid h-8 w-8 place-items-center rounded-full bg-ink text-bg">
            <span className="relative flex h-3.5 w-4 flex-col justify-center gap-[3px]">
              <span className={`h-[1.7px] w-full origin-center bg-bg transition-transform duration-300 ease-expo ${open ? "translate-y-[4.7px] rotate-45" : ""}`} />
              <span className={`h-[1.7px] w-full bg-bg transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
              <span className={`h-[1.7px] w-full origin-center bg-bg transition-transform duration-300 ease-expo ${open ? "-translate-y-[4.7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </header>

      {/* backdrop + expanding pill menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[91] bg-bg/40 backdrop-blur-[2px]"
            />
            <motion.div
              variants={container} initial="closed" animate="open" exit="closed"
              style={{ transformOrigin: "top center" }}
              className="fixed left-1/2 top-[74px] z-[92] w-[min(90vw,320px)] -translate-x-1/2"
            >
              <div className="flex flex-col gap-0.5 rounded-[1.8rem] border border-line/12 bg-bg/90 p-2.5 shadow-[0_30px_80px_-28px_rgba(0,0,0,0.65)] backdrop-blur-xl">
                {links.map(([id, label], i) => (
                  <motion.button
                    key={id} variants={item} onClick={() => go(id)}
                    className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-ink/[0.05]"
                  >
                    <span className="font-mono text-[10px] text-accent">0{i + 1}</span>
                    <span className="flex-1 font-display text-lg font-semibold text-ink/85 transition-colors group-hover:text-accent">{label}</span>
                    <ArrowUpRight size={15} className="text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100" />
                  </motion.button>
                ))}
                <motion.a
                  variants={item} href="https://wa.me/584247582675" target="_blank" rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="mt-1.5 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-ink px-5 py-3.5 text-[12px] font-medium uppercase tracking-[0.14em] text-bg"
                >
                  {nav.cta} <ArrowUpRight size={13} />
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
