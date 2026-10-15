import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { FRAME_INK } from "./Preloader";

/* Marco fijo alrededor de la ventana (daveholloway.uk) + rótulos de esquina
   (valentingassend.com). No intercepta el ratón. */
export default function SiteFrame() {
  const { language } = useLanguage();
  const es = language === "es";
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[94] rounded-[10px] md:rounded-[14px]"
        style={{ boxShadow: `0 0 0 var(--frame) ${FRAME_INK}`, inset: "var(--frame)" }} />
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-[93] hidden items-end justify-between px-8 pb-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-white mix-blend-difference md:flex">
        <span>SAAE, 2026 · {es ? "Estudio de desarrollo web" : "Web development studio"}</span>
        <span>{es ? "Basado en San Cristóbal, VE" : "Based in San Cristóbal, VE"}</span>
      </div>
    </>
  );
}
