import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll interactivo global (GSAP ScrollTrigger, ligado al scroll con scrub):
 *  - títulos de sección: cada línea sube desde una máscara mientras entra
 *  - secciones alternas: el panel se expande de tarjeta redondeada a ancho completo
 *  - [data-parallax="n"]: desplazamiento vertical a distinta velocidad
 *  - [data-zoom]: la imagen se acerca suavemente al entrar
 *  - [data-wordmark]: la marca gigante del footer sube y se abre
 */
export default function useScrollFx(deps = []) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // títulos (fuera del hero)
      document.querySelectorAll("main > section:not(#inicio) h2").forEach((h2) => {
        const lines = h2.querySelectorAll(":scope > span.block");
        const targets = lines.length ? lines : [h2];
        gsap.fromTo(targets,
          { yPercent: 70, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" },
          { yPercent: 0, opacity: 1, clipPath: "inset(0% 0% -10% 0%)", stagger: 0.15, ease: "power2.out",
            scrollTrigger: { trigger: h2, start: "top 92%", end: "top 58%", scrub: 0.8 } });
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        // paneles alternos: de tarjeta a ancho completo
        document.querySelectorAll("main > section.section-alt").forEach((sec) => {
          gsap.fromTo(sec,
            { clipPath: "inset(0% 3.5% 0% 3.5% round 48px)" },
            { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
              scrollTrigger: { trigger: sec, start: "top bottom", end: "top 25%", scrub: true } });
        });
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

    // recalcular cuando cargan fuentes/imágenes y tras el preloader
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t1 = setTimeout(refresh, 1200);
    const t2 = setTimeout(refresh, 3200);
    return () => { ctx.revert(); window.removeEventListener("load", refresh); clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
