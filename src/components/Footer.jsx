import React from "react";
import { ArrowUp } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import { scrollToId } from "../hooks/useSmoothScroll";
import SaaeLogo from "./SaaeLogo";

const socials = [
  ["GitHub", "https://github.com/StefanoAbate27", FaGithub],
  ["LinkedIn", "https://www.linkedin.com/in/stefano-abate-75b362345", FaLinkedinIn],
  ["WhatsApp", "https://wa.me/584247582675", FaWhatsapp],
  ["Telegram", "https://t.me/StefanoA1227", FaTelegramPlane],
];

export default function Footer() {
  const { language } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 overflow-hidden border-t border-line/12 pt-14">
      <div className="container-x pb-8 pt-6">
        <div className="grid grid-cols-1 gap-8 border-t border-line/12 pt-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 text-ink">
              <SaaeLogo size={30} tone="auto" />
              <span className="font-display text-lg font-semibold tracking-[0.14em]">SAAE</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {language === "es"
                ? "Estudio de Desarrollo Web. Sistemas a medida, construidos con maestría."
                : "Web Development Studio. Tailor-made systems, built with mastery."}
            </p>
            <a href="mailto:stefanoabate.dev@gmail.com" className="mt-4 inline-block font-display text-ink hover:text-accent">stefanoabate.dev@gmail.com</a>
          </div>

          <div className="flex flex-col gap-2 md:items-center">
            <span className="mb-2 label text-muted">Social</span>
            {socials.map(([label, href, Icon]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" data-cursor="Abrir"
                className="group inline-flex items-center gap-2 font-display text-ink transition-colors hover:text-accent">
                <Icon className="text-sm opacity-70 transition-opacity group-hover:opacity-100" />
                {label}
              </a>
            ))}
          </div>

          <div className="flex flex-col justify-between gap-6 md:items-end">
            <button onClick={() => scrollToId("inicio", -20)} data-cursor="Top"
              className="group inline-flex items-center gap-2 self-start rounded-full border border-line/15 px-5 py-3 label text-ink transition-colors hover:border-ink md:self-end">
              {language === "es" ? "Volver arriba" : "Back to top"}
              <ArrowUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
            </button>
            <span className="label text-muted">
              © {year} SAAE — {language === "es" ? "Todos los derechos reservados" : "All rights reserved"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
