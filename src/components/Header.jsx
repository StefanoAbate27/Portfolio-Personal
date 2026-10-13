import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sun, Moon, Mail } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { scrollToId } from "../hooks/useSmoothScroll";
import SaaeLogo from "./SaaeLogo";

/**
 * Header estilo Vanty: barra transparente con mix-blend-difference
 * (logo + "Hablemos" + texto Menú/Cerrar que rueda) y menú a pantalla
 * completa que baja como cortina; los enlaces suben desde una máscara
 * en cascada (timeline GSAP reversible).
 */
export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const overlayRef = useRef(null);
  const tl = useRef(null);

  const t = {
    es: {
      menu: "Menú", close: "Cerrar", talk: "Hablemos", connect: "Conecta con nosotros",
      light: "Tema claro", dark: "Tema oscuro",
      links: [["inicio", "Inicio"], ["fundador", "Fundador"], ["nosotros", "Nosotros"], ["proceso", "Proceso"], ["proyectos", "Proyectos"], ["por-que", "Por qué SAAE"], ["contacto", "Contacto"]],
    },
    en: {
      menu: "Menu", close: "Close", talk: "Let's talk", connect: "Connect with us",
      light: "Light theme", dark: "Dark theme",
      links: [["inicio", "Home"], ["fundador", "Founder"], ["nosotros", "About"], ["proceso", "Process"], ["proyectos", "Work"], ["por-que", "Why SAAE"], ["contacto", "Contact"]],
    },
  }[language];

  const socials = [
    ["WhatsApp", "https://wa.me/584247582675", FaWhatsapp],
    ["LinkedIn", "https://www.linkedin.com/in/stefano-abate-75b362345", FaLinkedinIn],
    ["GitHub", "https://github.com/StefanoAbate27", FaGithub],
    ["Email", "mailto:stefanoabate.dev@gmail.com", Mail],
  ];

  // timeline de la cortina (como Vanty: power4.inOut 1s + enlaces en cascada)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(overlayRef.current, { yPercent: -100 });
      gsap.set(".menu-link, .menu-social", { yPercent: 100 });
      tl.current = gsap.timeline({ paused: true })
        .set(overlayRef.current, { pointerEvents: "auto" })
        .to(overlayRef.current, { yPercent: 0, duration: 1, ease: "power4.inOut" }, 0)
        .to(".menu-link", { yPercent: 0, duration: 0.8, stagger: 0.05, ease: "power3.out" }, "-=0.4")
        .to(".menu-social", { yPercent: 0, duration: 0.6, stagger: 0.05, ease: "power3.out" }, "-=0.6");
    }, overlayRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!tl.current) return;
    if (open) { window.__lenis?.stop(); tl.current.play(); }
    else { window.__lenis?.start(); tl.current.reverse(); }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id) => {
    const wasOpen = open;
    setOpen(false);
    setTimeout(() => scrollToId(id, 0), wasOpen ? 450 : 0);
  };

  return (
    <>
      {/* barra: mix-blend-difference para contrastar sobre cualquier fondo */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[95] flex items-center justify-between p-5 text-white mix-blend-difference md:px-10 md:py-8">
        <button onClick={() => go("inicio")} data-cursor="Top" className="group pointer-events-auto flex items-center gap-3">
          <SaaeLogo size={40} tone="onDark" className="!h-8 !w-8 brightness-0 invert transition-transform duration-500 group-hover:scale-90 md:!h-10 md:!w-10" />
          <span className="text-lg font-bold tracking-tighter md:text-2xl">SAAE</span>
        </button>

        <div className="pointer-events-auto flex items-center gap-4 md:gap-8">
          <button onClick={() => go("contacto")} data-cursor="Go"
            className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-white px-5 py-2 text-xs font-semibold transition-colors duration-300 hover:bg-white hover:text-black sm:flex md:px-6 md:py-2.5 md:text-sm">
            {t.talk} &rarr;
          </button>
          <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? t.close : t.menu} data-cursor={open ? t.close : t.menu}
            className="group relative text-base font-medium md:text-lg">
            <span className="block h-6 overflow-hidden">
              <span className={`block transition-transform duration-500 ease-expo ${open ? "-translate-y-1/2" : "group-hover:-translate-y-1/2"}`}>
                <span className="block h-6 leading-6">{t.menu}</span>
                <span className="block h-6 leading-6">{t.close}</span>
              </span>
            </span>
          </button>
        </div>
      </header>

      {/* menú a pantalla completa */}
      <div ref={overlayRef} className="pointer-events-none fixed inset-0 z-[90] flex flex-col items-center justify-center bg-bg">
        <nav className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <ul className="flex flex-col gap-1 text-[2.1rem] font-bold uppercase leading-[1.05] tracking-tighter text-ink sm:text-5xl md:gap-2 md:text-6xl lg:text-7xl">
            {t.links.map(([id, label], i) => (
              <li key={id} className="overflow-hidden">
                <button onClick={() => go(id)} data-cursor="Ir"
                  className="menu-link group flex items-baseline gap-4 text-left uppercase transition-colors duration-300 hover:text-accent">
                  <span className="text-xs font-semibold tracking-[0.2em] text-muted transition-colors group-hover:text-accent md:text-sm">{String(i + 1).padStart(2, "0")}</span>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-6 left-1/2 flex w-full max-w-7xl -translate-x-1/2 flex-col items-center justify-between gap-4 px-6 sm:flex-row md:bottom-10 md:px-10">
          <div className="flex items-center gap-6 text-ink">
            <div className="hidden overflow-hidden sm:block">
              <span className="menu-social block text-[10px] font-bold uppercase tracking-widest text-muted md:text-xs">{t.connect}</span>
            </div>
            <button onClick={toggleTheme} className="overflow-hidden">
              <span className="menu-social flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-accent md:text-xs">
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                {theme === "dark" ? t.light : t.dark}
              </span>
            </button>
            <button onClick={toggleLanguage} className="overflow-hidden">
              <span className="menu-social flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest md:text-xs">
                <span className={language === "es" ? "text-accent" : "text-muted"}>ES</span>
                <span className="text-muted">/</span>
                <span className={language === "en" ? "text-accent" : "text-muted"}>EN</span>
              </span>
            </button>
          </div>
          <div className="flex gap-6 text-ink md:gap-8">
            {socials.map(([label, href, Icon]) => (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" aria-label={label} data-cursor={label} className="group overflow-hidden">
                <span className="menu-social block transition-colors group-hover:text-accent"><Icon className="h-5 w-5 md:h-6 md:w-6" /></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
