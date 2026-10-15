import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Transiciones entre secciones al estilo de valentingassend.com (ligadas al scroll):
 *  - cada sección es un panel opaco; cuando termina, se queda fija y la siguiente
 *    sube por encima cubriéndola, mientras la saliente se aleja (escala),
 *    se desenfoca y se oscurece
 *  - títulos: suben desde abajo pasando de desenfocados a nítidos
 *  - [data-parallax], [data-zoom], [data-wordmark]: efectos de detalle
 */
export default function useScrollFx(deps = []) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const panels = [...document.querySelectorAll("main section.panel, body footer.panel")];
    panels.forEach((p, i) => { p.style.zIndex = String(10 + i); });

    const ctx = gsap.context(() => {
      panels.forEach((el, i) => {
        const next = panels[i + 1];
        if (!next || el.dataset.stack === "off") return;
        const vh = () => window.innerHeight;
        const start = () => (el.offsetHeight <= vh() + 2 ? "top top" : "bottom bottom");
        const inner = el.firstElementChild;
        ScrollTrigger.create({ trigger: el, start, end: () => `+=${vh()}`, pin: true, pinSpacing: false, invalidateOnRefresh: true, refreshPriority: -i });
        if (!inner) return;
        gsap.fromTo(inner,
          { scale: 1, filter: "blur(0px) brightness(1)" },
          {
            scale: 0.9, filter: "blur(7px) brightness(0.55)", ease: "none", immediateRender: false,
            transformOrigin: () => `50% ${Math.max(0, el.offsetHeight - vh() / 2)}px`,
            scrollTrigger: { trigger: el, start, end: () => `+=${vh()}`, scrub: true, invalidateOnRefresh: true, refreshPriority: -i },
          });
      });

      // títulos: de desenfocados a nítidos mientras suben
      document.querySelectorAll("main > section:not(#inicio) h2").forEach((h2) => {
        const lines = h2.querySelectorAll(":scope > span.block");
        const targets = lines.length ? lines : [h2];
        gsap.fromTo(targets,
          { yPercent: 55, opacity: 0, filter: "blur(16px)" },
          { yPercent: 0, opacity: 1, filter: "blur(0px)", stagger: 0.12, ease: "power2.out",
            scrollTrigger: { trigger: h2, start: "top 95%", end: "top 55%", scrub: 0.8 } });
      });

      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const k = parseFloat(el.dataset.parallax) || 1;
        gsap.fromTo(el, { yPercent: 12 * k }, { yPercent: -12 * k, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });

      document.querySelectorAll("[data-zoom]").forEach((el) => {
        gsap.fromTo(el, { scale: 1.25, yPercent: -6 }, { scale: 1, yPercent: 6, ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });

      document.querySelectorAll("[data-wordmark]").forEach((el) => {
        gsap.fromTo(el, { yPercent: 55, letterSpacing: "-0.12em", opacity: 0.2 }, { yPercent: 0, letterSpacing: "-0.06em", opacity: 1, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } });
      });
    });

    ScrollTrigger.sort();
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t1 = setTimeout(refresh, 1200);
    const t2 = setTimeout(refresh, 3500);
    return () => { ctx.revert(); window.removeEventListener("load", refresh); clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
