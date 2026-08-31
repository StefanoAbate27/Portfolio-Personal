import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { scrollToId } from "../hooks/useSmoothScroll";
import SaaeLogo from "./SaaeLogo";

const layoutT = { type: "spring", stiffness: 300, damping: 30 };

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const nav = {
    es: { fundador: "Fundador", nosotros: "Nosotros", proceso: "Proceso", proyectos: "Proyectos", porque: "Por qué", contacto: "Contacto", menu: "Menú" },
    en: { fundador: "Founder", nosotros: "About", proceso: "Process", proyectos: "Work", porque: "Why", contacto: "Contact", menu: "Menu" },
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
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id) => {
    setOpen(false);
    setTimeout(() => scrollToId(id, -20), 120);
  };

  const divider = <span className="mx-1 h-4 w-px shrink-0 bg-line/15" />;

  return (
    <header className="fixed inset-x-0 top-0 z-[95] flex justify-center px-4 py-4">
      <motion.div
        layout
        transition={layoutT}
        className="flex max-w-[94vw] flex-wrap items-center justify-center gap-1 rounded-[1.4rem] border border-line/12 bg-bg/80 p-1.5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <AnimatePresence mode="popLayout">
          {open && (
            <motion.div
              key="content" layout
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
              transition={layoutT}
              className="flex flex-wrap items-center justify-center gap-1"
            >
              {/* brand */}
              <button onClick={() => go("inicio")} data-cursor="Top" className="group flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1.5 text-ink">
                <SaaeLogo size={22} tone="auto" className="transition-transform duration-500 ease-expo group-hover:scale-110" />
                <span className="font-display text-sm font-semibold tracking-[0.14em]">SAAE</span>
              </button>

              {divider}

              {/* section links inline */}
              {links.map(([id, label]) => (
                <button key={id} onClick={() => go(id)}
                  className="group relative whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink/75 transition-colors hover:text-ink">
                  {label}
                  <span className="absolute inset-x-2.5 -bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-expo group-hover:scale-x-100" />
                </button>
              ))}

              {divider}

              {/* language */}
              <div className="flex items-center">
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

              {divider}
            </motion.div>
          )}
        </AnimatePresence>

        {/* hamburger — always visible */}
        <motion.button
          layout onClick={() => setOpen((v) => !v)} data-cursor={nav.menu} aria-label="Menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-bg"
        >
          <span className="relative flex h-3.5 w-4 flex-col justify-center gap-[3px]">
            <span className={`h-[1.7px] w-full origin-center bg-bg transition-transform duration-300 ease-expo ${open ? "translate-y-[4.7px] rotate-45" : ""}`} />
            <span className={`h-[1.7px] w-full bg-bg transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`h-[1.7px] w-full origin-center bg-bg transition-transform duration-300 ease-expo ${open ? "-translate-y-[4.7px] -rotate-45" : ""}`} />
          </span>
        </motion.button>
      </motion.div>
    </header>
  );
}
