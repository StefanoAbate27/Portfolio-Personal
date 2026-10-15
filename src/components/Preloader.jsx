import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Preloader estilo daveholloway.uk:
 *  1. el isotipo SAAE se construye pieza a pieza (trazos, barras y punto) mientras cambia de color
 *  2. se vuelve tinta y se convierte en un bloque sólido
 *  3. el bloque crece hasta cubrir la pantalla
 *  4. se abre desde el centro y deja solo el marco de la página (SiteFrame)
 * Al abrirse emite "saae:reveal" para que el hero entre.
 */
export const FRAME_INK = "#070b16";

export default function Preloader({ onDone }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const reveal = () => { window.__saaeRevealed = true; window.dispatchEvent(new Event("saae:reveal")); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal(); onDone?.(); return;
    }
    const frame = () => (window.innerWidth < 768 ? 6 : 10);
    let loaded = document.readyState === "complete";
    const onLoad = () => { loaded = true; };
    window.addEventListener("load", onLoad);

    // mientras carga la página el hilo principal se bloquea: sin suavizado de saltos GSAP
    // adelantaría el tiempo y se saltaría la construcción del logo
    gsap.ticker.lagSmoothing(250, 33);
    const ctx = gsap.context(() => {
      const chev = gsap.utils.toArray(".pl-chev");
      chev.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
      gsap.set(".pl-bar", { scaleY: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
      gsap.set(".pl-dot", { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
      gsap.set(".pl-block", { opacity: 0 });
      gsap.set(".pl-hole", { width: 0, height: 0 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      // arrancar cuando el navegador ya pinta con fluidez (dos fotogramas libres)
      requestAnimationFrame(() => requestAnimationFrame(() => tl.play()));
      tl.to(".pl-mark", { color: "#c99a46", duration: 0 })
        .to(chev, { strokeDashoffset: 0, duration: 0.85, stagger: 0.16, ease: "power2.inOut" })
        .to(".pl-bar", { scaleY: 1, duration: 0.5, stagger: 0.12, ease: "back.out(2.2)" }, "-=0.4")
        .to(".pl-dot", { scale: 1, duration: 0.5, ease: "back.out(3)" }, "-=0.15")
        // ciclo de color (oro → azul cielo → tinta)
        .to(".pl-mark", { color: "#2d4a98", duration: 0.3, ease: "none" }, "+=0.3")
        .to(".pl-mark", { color: FRAME_INK, duration: 0.3, ease: "none" }, "+=0.3")
        .add(() => { if (!loaded) { tl.pause(); const go = () => tl.resume(); window.addEventListener("load", go, { once: true }); setTimeout(go, 2500); } })
        // el isotipo se compacta en un bloque sólido
        .to(".pl-mark", { scaleX: 0.72, scaleY: 0.9, duration: 0.3, ease: "power2.in" }, "+=0.2")
        .to(".pl-block", { opacity: 1, duration: 0.01 })
        .to(".pl-mark", { opacity: 0, duration: 0.01 }, "<")
        // el bloque crece hasta cubrir la pantalla
        .to(".pl-block", { width: "100vw", height: "100svh", borderRadius: 0, duration: 1, ease: "power4.inOut" })
        .set(".pl-root", { backgroundColor: "transparent" })
        .set(".pl-block", { opacity: 0 })
        .set(".pl-hole", { opacity: 1 })
        .add(reveal, "+=0.05")
        // se abre desde el centro y queda el marco
        .to(".pl-hole", { width: () => `calc(100vw - ${frame() * 2}px)`, height: () => `calc(100svh - ${frame() * 2}px)`, borderRadius: 4, duration: 1.15, ease: "power4.inOut" }, "<")
        .add(() => { gsap.ticker.lagSmoothing(0); onDone?.(); });
    }, root);
    return () => { ctx.revert(); window.removeEventListener("load", onLoad); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={root} className="pl-root fixed inset-0 z-[200] grid place-items-center overflow-hidden bg-bg" aria-hidden>
      {/* hueco que se abre: todo lo de fuera es tinta (sombra enorme) */}
      <div className="pl-hole absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0" style={{ boxShadow: `0 0 0 200vmax ${FRAME_INK}` }} />
      <div className="pl-block absolute left-1/2 top-1/2 h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 rounded-md md:h-[84px] md:w-[84px]" style={{ background: FRAME_INK }} />
      <svg className="pl-mark relative h-[78px] w-[94px] md:h-[100px] md:w-[120px]" viewBox="0 0 2000 1667" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path className="pl-chev" d="M833 250 L333 833 L833 1417" strokeWidth="104" />
        <path className="pl-chev" d="M1167 250 L1667 833 L1167 1417" strokeWidth="104" />
        <line className="pl-bar" x1="625" y1="545" x2="625" y2="1125" strokeWidth="84" strokeLinecap="butt" />
        <line className="pl-bar" x1="1375" y1="545" x2="1375" y2="1125" strokeWidth="84" strokeLinecap="butt" />
        <circle className="pl-dot" cx="1000" cy="833" r="84" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}
