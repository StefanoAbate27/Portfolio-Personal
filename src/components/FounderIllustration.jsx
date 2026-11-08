import React, { useEffect, useRef } from "react";

/* Ilustración vectorial del fundador con acabado tipo Disney: curvas suaves,
   degradados de piel, sombras difuminadas, ojos grandes con iris degradado y
   brillos, y contorno en marrón cálido (nítido a cualquier tamaño). Animada como una marioneta por capas:
   - la cabeza "gira" hacia el cursor: los rasgos se desplazan más que el cráneo,
     el pelo un poco menos y las orejas en sentido contrario (paralaje)
   - las pupilas siguen al cursor dentro de cada ojo
   - parpadeo natural, respiración y balanceo; si el ratón se queda quieto, mira alrededor
   - clic: sonrisa amplia y saltito */

const LINE = "#3b2216";
const C = {
  skinL: "#fbd2b3", skin: "#f2bb98", skinSh: "#d98f6c", skinDeep: "#b9694c", blush: "#f08a7a",
  hairL: "#a8703f", hair: "#7a4628", hairD: "#4a2715",
  brow: "#5a321f", irisIn: "#d0a54a", iris: "#8fa840", irisOut: "#4e6522", mouth: "#6b2620", teeth: "#fffaf3", tongue: "#c9584a", lip: "#d8806d",
  shirt: "#22212b", shirtL: "#3a3948", shirtD: "#121118",
};
const S = { stroke: LINE, strokeWidth: 4.5, strokeLinejoin: "round", strokeLinecap: "round" };

const EYES = [{ cx: 433, cy: 520, out: -1 }, { cx: 587, cy: 520, out: 1 }];
const FACE = "M318 440 C314 560 340 662 398 735 C440 788 478 812 508 812 C540 812 580 790 620 740 C676 668 694 568 690 440 C686 300 608 226 502 226 C396 226 322 300 318 440 Z";
const HAIR = "M300 486 C282 410 288 326 330 258 C350 214 384 180 424 164 C446 140 476 130 506 134 C540 112 600 108 648 128 C700 140 742 180 752 236 C760 262 754 290 748 312 C740 362 724 410 706 460 C700 428 692 402 680 386 C664 336 622 306 562 306 C502 306 442 326 402 350 C368 370 344 404 336 454 C332 476 322 496 312 512 Z";
const eyeShape = (cx, cy, rx = 44, ry = 30) =>
  `M${cx - rx} ${cy + 5} C${cx - rx * 0.66} ${cy - ry * 1.32} ${cx + rx * 0.66} ${cy - ry * 1.32} ${cx + rx} ${cy - 1} C${cx + rx * 0.56} ${cy + ry * 1.02} ${cx - rx * 0.56} ${cy + ry * 1.02} ${cx - rx} ${cy + 5}Z`;

export default function FounderIllustration({ className = "" }) {
  const svg = useRef(null);
  const g = useRef({});
  const set = (k) => (el) => { g.current[k] = el; };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = { mx: 0, my: 0, hx: 0, hy: 0, last: 0, blinkAt: performance.now() + 1600, blink: 0, joy: 0, raf: 0, vis: true };
    const onMove = (e) => {
      const r = svg.current?.getBoundingClientRect(); if (!r) return;
      // dirección del cursor respecto a la cara del personaje
      const fx = r.left + r.width * 0.51, fy = r.top + r.height * 0.47;
      s.mx = Math.max(-1, Math.min(1, (e.clientX - fx) / (window.innerWidth * 0.42)));
      s.my = Math.max(-1, Math.min(1, (e.clientY - fy) / (window.innerHeight * 0.55)));
      s.last = performance.now();
    };
    const onDown = () => { s.joy = 1; s.blink = 1; };
    window.addEventListener("pointermove", onMove, { passive: true });
    svg.current?.addEventListener("pointerdown", onDown);
    const io = new IntersectionObserver(([en]) => { s.vis = en.isIntersecting; });
    if (svg.current) io.observe(svg.current);

    const T = (el, v) => el && el.setAttribute("transform", v);
    const loop = (now) => {
      s.raf = requestAnimationFrame(loop);
      if (!s.vis) return;
      const t = now / 1000;
      const idle = now - s.last > 2600;
      const tx = idle ? Math.sin(t * 0.45) * 0.55 : s.mx;
      const ty = idle ? Math.sin(t * 0.32) * 0.3 : s.my;
      s.hx += (tx - s.hx) * 0.08; s.hy += (ty - s.hy) * 0.08;
      const x = s.hx, y = s.hy;

      s.joy = Math.max(0, s.joy - 0.018);
      const joy = Math.sin(s.joy * Math.PI);
      const breathe = Math.sin(t * 1.6);
      const bob = breathe * 2.5 - joy * 14;

      T(g.current.body, `translate(${x * 3} ${breathe * 1.2}) scale(1 ${1 + breathe * 0.006})`);
      T(g.current.headwrap, `translate(${x * 6} ${y * 4 + bob}) rotate(${x * 3.2 + Math.sin(t * 0.7) * 0.6} 510 760)`);
      T(g.current.earL, `translate(${-x * 9} ${y * 2})`);
      T(g.current.earR, `translate(${-x * 9} ${y * 2})`);
      T(g.current.features, `translate(${x * 15} ${y * 9})`);
      T(g.current.hair, `translate(${x * 7} ${y * 3 - Math.abs(x) * 2})`);
      T(g.current.shade, `translate(${x * 10} ${y * 3})`);

      // pupilas
      (g.current.pupils || []).forEach((p) => T(p, `translate(${x * 13} ${y * 7})`));

      // parpadeo
      if (now > s.blinkAt) { s.blink = 1; s.blinkAt = now + 2600 + Math.random() * 3400; }
      s.blink = Math.max(0, s.blink - 0.12);
      const b = Math.sin(s.blink * Math.PI);
      (g.current.lids || []).forEach((l) => T(l, `translate(0 ${6 + b * 62 + joy * 10 - Math.max(0, -y) * 5})`));

      // sonrisa amplia al hacer clic
      T(g.current.mouth, `translate(510 700) scale(${1 + joy * 0.06} ${1 + joy * 0.28}) translate(-510 -700)`);
      T(g.current.browL, `translate(0 ${-joy * 10 - Math.max(0, -y) * 6})`);
      T(g.current.browR, `translate(0 ${-joy * 10 - Math.max(0, -y) * 6})`);
    };
    if (!reduce) s.raf = requestAnimationFrame(loop);
    const el = svg.current;
    return () => { cancelAnimationFrame(s.raf); io.disconnect(); window.removeEventListener("pointermove", onMove); el?.removeEventListener("pointerdown", onDown); };
  }, []);

  const pupils = (el) => { if (el) { g.current.pupils = g.current.pupils || []; if (!g.current.pupils.includes(el)) g.current.pupils.push(el); } };
  const lids = (el) => { if (el) { g.current.lids = g.current.lids || []; if (!g.current.lids.includes(el)) g.current.lids.push(el); } };

  return (
    <svg ref={svg} viewBox="0 0 1000 1100" className={className} role="img" aria-label="Ilustración de Stefano Abate, fundador de SAAE" data-cursor="¡Hola!">
      <defs>
        <filter id="fi-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
        <filter id="fi-soft-s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" /></filter>
        <radialGradient id="fi-skin" cx="0.42" cy="0.42" r="0.7"><stop offset="0" stopColor={C.skinL} /><stop offset="0.55" stopColor={C.skin} /><stop offset="1" stopColor={C.skinSh} /></radialGradient>
        <linearGradient id="fi-neck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.skinSh} /><stop offset="0.45" stopColor={C.skin} /></linearGradient>
        <radialGradient id="fi-blush" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={C.blush} stopOpacity="0.45" /><stop offset="1" stopColor={C.blush} stopOpacity="0" /></radialGradient>
        <linearGradient id="fi-hair" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor={C.hairL} /><stop offset="0.5" stopColor={C.hair} /><stop offset="1" stopColor={C.hairD} /></linearGradient>
        <linearGradient id="fi-hair-sheen" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stopColor="#c48a52" stopOpacity="0" /><stop offset="0.45" stopColor="#d49a5e" stopOpacity="0.85" /><stop offset="1" stopColor="#c48a52" stopOpacity="0" /></linearGradient>
        <radialGradient id="fi-iris" cx="0.5" cy="0.5" r="0.5"><stop offset="0.3" stopColor={C.irisIn} /><stop offset="0.62" stopColor={C.iris} /><stop offset="1" stopColor={C.irisOut} /></radialGradient>
        <radialGradient id="fi-white" cx="0.5" cy="0.62" r="0.65"><stop offset="0.5" stopColor="#ffffff" /><stop offset="1" stopColor="#e9ddd2" /></radialGradient>
        <linearGradient id="fi-shirt" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stopColor={C.shirtL} /><stop offset="0.5" stopColor={C.shirt} /><stop offset="1" stopColor={C.shirtD} /></linearGradient>
        <linearGradient id="fi-brow" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.hairD} /><stop offset="1" stopColor={C.brow} /></linearGradient>
        {EYES.map((e, i) => <clipPath key={i} id={`fi-eye${i}`}><path d={eyeShape(e.cx, e.cy)} /></clipPath>)}
        <clipPath id="fi-face"><path d={FACE} /></clipPath>
        <clipPath id="fi-neckclip"><path d="M428 730 C430 780 428 820 424 852 L510 968 L594 852 C590 820 586 780 588 730 Z" /></clipPath>
        <clipPath id="fi-hairclip"><path d={HAIR} /></clipPath>
        <clipPath id="fi-mouth"><path d="M438 676 C474 694 546 694 584 668 C578 706 546 732 510 732 C474 732 446 708 438 676 Z" /></clipPath>
      </defs>

      {/* ---------- cuerpo ---------- */}
      <g ref={set("body")}>
        <path d="M428 730 C430 780 428 820 424 852 L510 968 L594 852 C590 820 586 780 588 730 Z" fill="url(#fi-neck)" {...S} />
        <g clipPath="url(#fi-neckclip)">
          <ellipse cx="510" cy="760" rx="120" ry="48" fill={C.skinDeep} opacity="0.55" filter="url(#fi-soft)" />
          <path d="M470 840 C490 880 500 920 510 960" fill="none" stroke={C.skinSh} strokeWidth="10" opacity="0.5" filter="url(#fi-soft-s)" />
        </g>
        <path d="M30 1100 C52 975 135 912 282 876 C340 862 392 853 430 846 L510 962 L590 846 C628 853 680 862 738 876 C885 912 958 975 975 1100 Z" fill="url(#fi-shirt)" stroke="#0b0a0e" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M120 1100 C140 1010 196 952 300 918 C250 970 222 1036 214 1100 Z" fill="#4a4958" opacity="0.35" filter="url(#fi-soft-s)" />
        <path d="M700 905 C760 960 800 1030 812 1100" fill="none" stroke="#000" strokeWidth="14" opacity="0.35" filter="url(#fi-soft-s)" />
        <path d="M510 962 L510 1100" stroke="#0b0a0e" strokeWidth="4" />
        <path d="M428 836 C408 860 392 884 384 912 L468 982 L508 958 Z" fill={C.shirtL} stroke="#0b0a0e" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M592 836 C612 860 628 884 636 912 L552 982 L512 958 Z" fill={C.shirtL} stroke="#0b0a0e" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M410 872 C428 900 446 924 466 944" fill="none" stroke="#5a596a" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
        <circle cx="510" cy="1014" r="8" fill="#43424f" stroke="#0b0a0e" strokeWidth="3" />
        <circle cx="510" cy="1076" r="8" fill="#43424f" stroke="#0b0a0e" strokeWidth="3" />
      </g>

      {/* ---------- cabeza ---------- */}
      <g ref={set("headwrap")}>
        <g ref={set("earL")}>
          <path d="M326 470 C290 450 262 486 270 534 C278 584 304 610 338 602 Z" fill="url(#fi-skin)" {...S} />
          <path d="M318 500 C298 498 292 524 298 548 C304 568 316 576 328 572" fill="none" stroke={C.skinDeep} strokeWidth="7" strokeLinecap="round" opacity="0.8" />
        </g>
        <g ref={set("earR")}>
          <path d="M676 470 C712 450 740 486 732 534 C724 584 698 610 664 602 Z" fill="url(#fi-skin)" {...S} />
          <path d="M684 500 C704 498 710 524 704 548 C698 568 686 576 674 572" fill="none" stroke={C.skinDeep} strokeWidth="7" strokeLinecap="round" opacity="0.8" />
        </g>

        <path d={FACE} fill="url(#fi-skin)" />
        {/* modelado suave de la cara (sombras difuminadas) */}
        <g clipPath="url(#fi-face)">
          <g ref={set("shade")}>
            <path d="M650 330 C700 430 700 590 660 680 C636 736 596 782 540 812 L780 840 L780 290 Z" fill={C.skinSh} opacity="0.85" filter="url(#fi-soft)" />
            <path d="M300 380 C390 340 480 326 570 330 C630 334 676 360 710 410 L710 240 L300 240 Z" fill={C.skinSh} opacity="0.8" filter="url(#fi-soft)" />
            <path d="M330 470 C330 560 352 640 400 712" fill="none" stroke={C.skinSh} strokeWidth="26" opacity="0.5" filter="url(#fi-soft)" />
            <ellipse cx="470" cy="420" rx="70" ry="34" fill="#fff" opacity="0.18" filter="url(#fi-soft)" />
            <ellipse cx="420" cy="600" rx="40" ry="26" fill="#fff" opacity="0.14" filter="url(#fi-soft)" />
          </g>
        </g>
        <path d={FACE} fill="none" {...S} />

        <g ref={set("features")}>
          <ellipse cx="400" cy="626" rx="46" ry="26" fill="url(#fi-blush)" />
          <ellipse cx="626" cy="626" rx="40" ry="24" fill="url(#fi-blush)" />

          {/* nariz */}
          <path d="M518 526 C528 570 536 596 550 612 C532 624 514 624 498 618" fill={C.skinSh} opacity="0.7" filter="url(#fi-soft-s)" />
          <ellipse cx="512" cy="600" rx="14" ry="9" fill="#fff" opacity="0.28" filter="url(#fi-soft-s)" />
          <path d="M480 614 C494 630 528 632 546 614" fill="none" stroke="#8c4d36" strokeWidth="4" strokeLinecap="round" />
          <path d="M488 612 C492 618 498 620 503 619 M534 612 C530 618 524 620 519 619" fill="none" stroke="#8c4d36" strokeWidth="3.5" strokeLinecap="round" />

          {/* boca: sonrisa franca */}
          <g ref={set("mouth")}>
            <path d="M438 676 C474 694 546 694 584 668 C578 706 546 732 510 732 C474 732 446 708 438 676 Z" fill={C.mouth} />
            <g clipPath="url(#fi-mouth)">
              <ellipse cx="514" cy="728" rx="40" ry="14" fill={C.tongue} />
              <path d="M436 674 C474 694 546 694 586 666 C584 684 580 694 574 700 C540 708 484 708 450 699 C444 690 440 682 436 674 Z" fill={C.teeth} />
            </g>
            <path d="M438 676 C474 694 546 694 584 668 C578 706 546 732 510 732 C474 732 446 708 438 676 Z" fill="none" stroke={LINE} strokeWidth="4" strokeLinejoin="round" />
            <path d="M472 744 C494 752 528 752 550 744" fill="none" stroke={C.lip} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
            <path d="M426 664 C430 672 434 676 440 678 M596 656 C592 664 588 668 582 670" fill="none" stroke="#8c4d36" strokeWidth="4" strokeLinecap="round" />
          </g>
          <path d="M488 788 C502 796 522 796 536 788" fill="none" stroke={C.skinDeep} strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />

          {/* ojos grandes */}
          {EYES.map((e, i) => (
            <g key={i}>
              <path d={eyeShape(e.cx, e.cy)} fill="url(#fi-white)" />
              <g clipPath={`url(#fi-eye${i})`}>
                <g ref={pupils}>
                  <circle cx={e.cx} cy={e.cy + 3} r="24" fill="url(#fi-iris)" />
                  <circle cx={e.cx} cy={e.cy + 3} r="24" fill="none" stroke="#2f3d12" strokeWidth="3" />
                  <circle cx={e.cx} cy={e.cy + 3} r="11" fill="#140d0a" />
                  <circle cx={e.cx - 9} cy={e.cy - 6} r="7" fill="#fff" />
                  <circle cx={e.cx + 9} cy={e.cy + 11} r="3" fill="#fff" opacity="0.9" />
                </g>
                <path d={`M${e.cx - 60} ${e.cy - 50} H${e.cx + 60} V${e.cy - 18} Q${e.cx} ${e.cy - 34} ${e.cx - 60} ${e.cy - 18} Z`} fill={C.skinDeep} opacity="0.35" filter="url(#fi-soft-s)" />
                <rect ref={lids} x={e.cx - 60} y={e.cy - 100} width="120" height="66" fill={C.skin} />
              </g>
              {/* pestañas superiores: trazo grueso que se afina hacia el lagrimal */}
              <path d={`M${e.cx - 46 * -e.out} ${e.cy + (e.out < 0 ? -1 : 5)} C${e.cx - 26 * -e.out} ${e.cy - 40} ${e.cx + 26 * -e.out} ${e.cy - 40} ${e.cx + 47 * -e.out} ${e.cy + (e.out < 0 ? 5 : -1)}`} fill="none" stroke={LINE} strokeWidth="6.5" strokeLinecap="round" />
              <path d={`M${e.cx + 44 * e.out} ${e.cy - 3} l${10 * e.out} -8`} stroke={LINE} strokeWidth="5" strokeLinecap="round" />
              <path d={`M${e.cx - 34} ${e.cy + 22} C${e.cx - 14} ${e.cy + 32} ${e.cx + 14} ${e.cy + 32} ${e.cx + 34} ${e.cy + 20}`} fill="none" stroke={C.skinDeep} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              <path d={`M${e.cx - 34} ${e.cy - 40} C${e.cx - 12} ${e.cy - 52} ${e.cx + 14} ${e.cy - 52} ${e.cx + 36} ${e.cy - 40}`} fill="none" stroke={C.skinDeep} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
            </g>
          ))}

          {/* cejas expresivas y afinadas */}
          <path ref={set("browL")} d="M372 478 C396 450 446 438 488 452 C490 460 486 466 480 467 C448 460 412 466 382 488 C374 488 370 484 372 478 Z" fill="url(#fi-brow)" />
          <path ref={set("browR")} d="M534 452 C574 434 624 438 654 464 C654 472 648 476 640 476 C612 460 574 458 542 467 C534 464 532 458 534 452 Z" fill="url(#fi-brow)" />
        </g>

        {/* pelo: tupé voluminoso con mechones y brillo */}
        <g ref={set("hair")}>
          <path d={HAIR} fill="url(#fi-hair)" />
          <g clipPath="url(#fi-hairclip)">
            <path d="M402 350 C432 262 524 206 646 216 C696 222 734 252 748 310 C710 260 646 250 594 260 C524 274 454 304 402 350 Z" fill={C.hairL} opacity="0.75" />
            <path d="M380 250 C460 190 580 170 700 210" fill="none" stroke="url(#fi-hair-sheen)" strokeWidth="30" strokeLinecap="round" filter="url(#fi-soft-s)" />
            <path d="M470 160 C546 144 632 158 692 204 C630 184 552 182 484 196 Z" fill={C.hairD} opacity="0.75" />
            <path d="M356 306 C376 254 420 212 472 186 C432 224 402 264 388 316 Z" fill={C.hairD} opacity="0.8" />
            <path d="M694 450 C706 406 714 364 718 324 C728 376 722 424 706 460 Z" fill={C.hairD} opacity="0.8" />
            <path d="M300 420 C330 400 360 380 400 352 L404 470 Z" fill={C.hairD} opacity="0.35" filter="url(#fi-soft-s)" />
          </g>
          <path d="M440 300 C484 258 548 236 620 236 M470 324 C514 294 566 282 626 284 M520 200 C580 186 640 192 690 222" fill="none" stroke="#c4884f" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d={HAIR} fill="none" {...S} />
        </g>
      </g>
    </svg>
  );
}
