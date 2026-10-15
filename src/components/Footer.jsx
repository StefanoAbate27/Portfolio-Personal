import React from "react";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { scrollToId } from "../hooks/useSmoothScroll";
import SaaeLogo from "./SaaeLogo";
import SocialFlip from "./SocialFlip";

export default function Footer() {
  const { language } = useLanguage();
  const year = new Date().getFullYear();
  const es = language === "es";

  const nav = es
    ? [["fundador", "Fundador"], ["nosotros", "Nosotros"], ["proceso", "Proceso"], ["proyectos", "Proyectos"], ["contacto", "Contacto"]]
    : [["fundador", "Founder"], ["nosotros", "About"], ["proceso", "Process"], ["proyectos", "Work"], ["contacto", "Contact"]];

  const linkCls = "text-left text-sm text-muted transition-colors hover:text-ink";

  return (
    <footer className="panel theme-ink relative overflow-hidden px-0 pb-10 pt-[clamp(4rem,9vw,7rem)]">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line/10 py-[clamp(2.5rem,5vw,4rem)] md:grid-cols-4">
          {/* brand */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5 text-ink">
              <SaaeLogo size={30} tone="auto" />
              <span className="text-lg font-bold tracking-tight">SAAE</span>
            </div>
            <p className="mt-4 max-w-xs text-xl font-bold leading-snug tracking-tight text-ink">
              {es ? "Software a medida," : "Bespoke software,"}{" "}
              <span className="text-accent">{es ? "construido con maestría." : "built with mastery."}</span>
            </p>
            <SocialFlip className="mt-6" />
          </div>

          {/* navigation */}
          <div>
            <p className="eyebrow">{es ? "Navegación" : "Navigation"}</p>
            <ul className="mt-4 space-y-2.5">
              {nav.map(([id, label]) => (
                <li key={id}>
                  <button onClick={() => scrollToId(id, -20)} data-cursor="Ir" className={linkCls}>{label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <p className="eyebrow">{es ? "Contacto" : "Contact"}</p>
            <ul className="mt-4 space-y-2.5">
              <li><a href="mailto:stefanoabate.dev@gmail.com" className={`${linkCls} break-all`}>stefanoabate.dev@gmail.com</a></li>
              <li><a href="https://wa.me/584247582675" target="_blank" rel="noopener noreferrer" className={linkCls}>+58 424 758 2675</a></li>
              <li><span className="text-sm text-muted">San Cristóbal, Venezuela</span></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line/10 pt-6 text-xs text-muted">
          <span>© {year} SAAE — {es ? "Todos los derechos reservados" : "All rights reserved"}</span>
          <button onClick={() => scrollToId("inicio", -20)} data-cursor="Top"
            className="group inline-flex items-center gap-2 font-semibold text-ink transition-colors hover:text-accent">
            {es ? "Volver arriba" : "Back to top"}
            <ArrowUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* big faint wordmark (Scottish style) */}
      <div aria-hidden className="pointer-events-none mt-6 select-none text-center">
        <span data-wordmark className="block text-[26vw] font-extrabold leading-[0.8] tracking-[-0.06em] text-ink/[0.04]">SAAE</span>
      </div>
    </footer>
  );
}
