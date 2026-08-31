import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sun, Moon, Menu, X, ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { scrollToId } from "../hooks/useSmoothScroll";
import SaaeLogo from "./SaaeLogo";

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const overlayRef = useRef(null);
  const tl = useRef(null);

  const nav = {
    es: { inicio: "Inicio", fundador: "Fundador", nosotros: "Nosotros", proceso: "Proceso", proyectos: "Proyectos", porque: "Por qué", contacto: "Contacto", cta: "Empecemos" },
    en: { inicio: "Home", fundador: "Founder", nosotros: "About", proceso: "Process", proyectos: "Work", porque: "Why", contacto: "Contact", cta: "Start" },
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
    const ctx = gsap.context(() => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(overlayRef.current, { pointerEvents: "auto" })
        .fromTo(overlayRef.current, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "power4.inOut" })
        .fromTo(".menu-link-inner", { yPercent: 120 }, { yPercent: 0, stagger: 0.06, duration: 0.6, ease: "power3.out" }, "-=0.25")
        .fromTo(".menu-foot", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
    });
    return () => ctx.revert();
  }, [language]);

  useEffect(() => {
    if (!tl.current) return;
    if (open) { tl.current.play(); window.__lenis && window.__lenis.stop(); }
    else { tl.current.reverse(); window.__lenis && window.__lenis.start(); }
  }, [open]);

  const go = (id) => { setOpen(false); setTimeout(() => scrollToId(id, -20), 120); };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[95] flex justify-center px-4 py-4">
        <div className="flex items-center gap-1 rounded-full border border-line/12 bg-bg/75 px-2 py-1.5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {/* brand */}
          <button onClick={() => go("inicio")} data-cursor="Top" className="group flex items-center gap-2 rounded-full px-2.5 py-1.5 text-ink">
            <SaaeLogo size={22} tone="auto" className="transition-transform duration-500 ease-expo group-hover:scale-110" />
            <span className="font-display text-sm font-semibold tracking-[0.14em]">SAAE</span>
          </button>

          {/* desktop inline nav */}
          <span className="mx-1 hidden h-4 w-px bg-line/15 lg:block" />
          <nav className="hidden items-center lg:flex">
            {links.map(([id, label]) => (
              <button key={id} onClick={() => go(id)}
                className="group relative rounded-full px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink/70 transition-colors hover:text-ink">
                {label}
                <span className="absolute inset-x-2.5 -bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-expo group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <span className="mx-1 hidden h-4 w-px bg-line/15 sm:block" />

          {/* language unicolor */}
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

          {/* menu button (below lg) */}
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu"
            className="grid h-8 w-8 place-items-center rounded-full bg-ink text-bg lg:hidden">
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </header>

      {/* Mobile expandable overlay */}
      <div
        ref={overlayRef}
        style={{ clipPath: "inset(0 0 100% 0)", pointerEvents: "none" }}
        className="fixed inset-0 z-[90] flex flex-col justify-between bg-bg px-6 pb-8 pt-24 lg:hidden"
      >
        <nav className="flex flex-col">
          {links.map(([id, label], i) => (
            <button key={id} onClick={() => go(id)}
              className="group flex items-center justify-between overflow-hidden border-b border-line/12 py-3 text-left sm:py-4">
              <span className="menu-link-inner block">
                <span className="display-hero text-4xl text-ink transition-colors duration-300 group-hover:text-accent sm:text-5xl">{label}</span>
              </span>
              <span className="menu-link-inner block label text-muted">0{i + 1}</span>
            </button>
          ))}
        </nav>

        <div className="menu-foot flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="label text-muted">{language === "es" ? "Escríbenos" : "Reach us"}</span>
            <a href="mailto:stefanoabate.dev@gmail.com" className="font-display text-lg text-ink">stefanoabate.dev@gmail.com</a>
          </div>
          <div className="flex items-center gap-3">
            {[[FaLinkedinIn, "https://www.linkedin.com/in/stefano-abate-75b362345"], [FaGithub, "https://github.com/StefanoAbate27"], [FaWhatsapp, "https://wa.me/584247582675"]].map(([Icon, href], i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                className="grid h-11 w-11 place-items-center rounded-full border border-line/15 text-ink">
                <Icon size={16} />
              </a>
            ))}
            <button onClick={() => go("contacto")} className="ml-auto inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 label text-bg">
              {nav.cta} <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
