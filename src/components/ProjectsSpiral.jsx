import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import ProjectsList, { DATA } from "./Projects";

gsap.registerPlugin(ScrollTrigger);

/* Proyectos al estilo de pacomepertant.com: tarjetas curvadas (segmentos de
   cilindro) dispuestas en una espiral 3D. El scroll gira la espiral y trae
   cada proyecto al frente; las tarjetas lejanas se desenfocan (mip bias) y
   se atenúan. Etiqueta del proyecto activo abajo; clic en la tarjeta activa
   abre el proyecto, clic en otra la trae al frente. Vista "lista" alternativa. */

const R = 3.3;          // radio del cilindro de la espiral
const STEP = 0.66;      // giro entre tarjetas (rad): mayor que el ancho angular de una tarjeta (0,58) para que no se crucen
const DY = 0.5;         // subida entre tarjetas
const CW = 1.9, CH = CW / 1.6;
const REPEAT = 2;       // vueltas de proyectos (más densidad visual)

const VERT = /* glsl */ `
  varying vec2 vUv; varying float vFacing;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vFacing = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }`;
const FRAG = /* glsl */ `
  uniform sampler2D uMap; uniform float uBlur; uniform float uAlpha; uniform float uDim; uniform float uHover;
  varying vec2 vUv; varying float vFacing;
  float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(1.6, 1.0);
    float d = sdRound(p, vec2(0.8, 0.5), 0.06);
    float edge = 1.0 - smoothstep(-0.004, 0.004, d);
    if (edge < 0.01) discard;
    vec2 uv = mix(vec2(0.5), vUv, 1.0 - uHover * 0.04);         // zoom suave al pasar el ratón
    vec3 c = texture2D(uMap, uv, uBlur * 5.0).rgb;
    c *= mix(1.0, 0.45, uDim);
    float side = smoothstep(0.18, 0.45, vFacing);          // de canto: se desvanece (sin franjas)
    if (edge * uAlpha * side < 0.01) discard;
    gl_FragColor = vec4(c, edge * uAlpha * side);
    #include <colorspace_fragment>
  }`;

function curvedPlane() {
  const g = new THREE.PlaneGeometry(CW, CH, 32, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), a = x / R;
    p.setX(i, R * Math.sin(a)); p.setZ(i, R * Math.cos(a) - R);
  }
  g.computeVertexNormals();
  return g;
}

export default function ProjectsSpiral() {
  const { language } = useLanguage();
  const data = DATA[language] || DATA.es;
  const projects = data.projects;
  const es = language === "es";
  const [mode, setMode] = useState("spiral");
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const canvasWrap = useRef(null);
  const api = useRef({});

  const cards = useMemo(() => Array.from({ length: projects.length * REPEAT }, (_, i) => ({ i, p: projects[i % projects.length], k: i % projects.length })), [projects]);
  const total = cards.length;

  // escena three.js
  useEffect(() => {
    if (mode !== "spiral") return;
    const wrap = canvasWrap.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    const spiral = new THREE.Group(); scene.add(spiral);
    const geo = curvedPlane();
    const loader = new THREE.TextureLoader();
    const texCache = {};
    const meshes = cards.map((c) => {
      const url = c.p.img;
      if (!texCache[url]) {
        const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 8;
        texCache[url] = t;
      }
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: THREE.DoubleSide,
        uniforms: { uMap: { value: texCache[url] }, uBlur: { value: 0 }, uAlpha: { value: 1 }, uDim: { value: 0 }, uHover: { value: 0 } },
      });
      const m = new THREE.Mesh(geo, mat);
      const a = c.i * STEP;
      m.position.set(R * Math.sin(a), -c.i * DY, R * Math.cos(a)); m.rotation.y = a;
      m.userData = { idx: c.i, hover: 0, scale: 1 };
      spiral.add(m);
      return m;
    });

    const s = { f: 0, target: 0, changed: 0, mx: 0, my: 0, hovered: -1, raf: 0, lastActive: -1 };
    api.current.setTarget = (v) => { s.target = v; s.changed = performance.now(); };
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(-9, -9);

    const resize = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.position.set(0, 0.15, R + (w / h < 1 ? 7.6 : 5.4));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      s.mx = ((e.clientX - r.left) / r.width) * 2 - 1; s.my = -(((e.clientY - r.top) / r.height) * 2 - 1);
      ndc.set(s.mx, s.my);
    };
    const onLeave = () => ndc.set(-9, -9);
    const onClick = () => {
      if (s.hovered < 0) return;
      const f = Math.round(s.f);
      if (s.hovered === f) window.open(cards[f].p.demo, "_blank", "noopener");
      else api.current.goTo?.(s.hovered);
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("click", onClick);

    const tmp = new THREE.Vector3();
    const loop = () => {
      s.raf = requestAnimationFrame(loop);
      let goal = s.target * (total - 1);
      if (performance.now() - s.changed > 140) goal = Math.round(goal);   // reposo: centra la tarjeta
      s.f += (goal - s.f) * 0.085;
      const f = s.f;
      spiral.rotation.y = -f * STEP + s.mx * 0.08;
      spiral.position.y = f * DY;
      spiral.rotation.x = -s.my * 0.05;
      spiral.rotation.z = s.mx * 0.02;

      // hover
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(meshes, false).find((h) => h.object.material.uniforms.uAlpha.value > 0.2);
      s.hovered = hit ? hit.object.userData.idx : -1;
      wrap.style.cursor = s.hovered >= 0 ? "pointer" : "";

      meshes.forEach((m) => {
        const d = Math.abs(m.userData.idx - f);
        m.getWorldPosition(tmp);
        const behind = tmp.z < 0.5 ? 1 : 0;
        const u = m.material.uniforms;
        u.uBlur.value = Math.min(1, Math.max(0, (d - 0.35) * 0.42));
        u.uAlpha.value = 1 - Math.min(1, Math.max(0, (d - 4.5) / 2.5));
        u.uDim.value = Math.min(1, d * 0.12 + behind * 0.4);
        m.userData.hover += ((s.hovered === m.userData.idx ? 1 : 0) - m.userData.hover) * 0.15;
        u.uHover.value = m.userData.hover;
        const sc = 1 + m.userData.hover * 0.05;
        m.scale.setScalar(sc);
        m.renderOrder = Math.round(tmp.z * 100);
      });

      const a = ((Math.round(f) % projects.length) + projects.length) % projects.length;
      if (a !== s.lastActive) { s.lastActive = a; setActive(a); }
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(s.raf); ro.disconnect();
      wrap.removeEventListener("pointermove", onMove); wrap.removeEventListener("pointerleave", onLeave); wrap.removeEventListener("click", onClick);
      geo.dispose(); meshes.forEach((m) => m.material.dispose()); Object.values(texCache).forEach((t) => t.dispose());
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [mode, cards, total, projects.length]);

  // el scroll (sección fijada) gira la espiral
  useLayoutEffect(() => {
    if (mode !== "spiral") return;
    const st = ScrollTrigger.create({
      trigger: root.current, start: "top top", end: () => `+=${window.innerHeight * (total - 1) * 0.42}`,
      pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: (self) => api.current.setTarget?.(self.progress),
    });
    api.current.goTo = (idx) => {
      const y = st.start + (st.end - st.start) * (idx / (total - 1));
      window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: "smooth" });
    };
    ScrollTrigger.refresh();
    return () => st.kill();
  }, [mode, total]);

  const toggle = (m) => { if (m !== mode) { setMode(m); setTimeout(() => ScrollTrigger.refresh(), 60); } };
  const cur = projects[active];

  const Toggle = (
    <div className="flex items-center gap-3 text-sm font-semibold">
      {[["spiral", es ? "espiral" : "spiral"], ["list", es ? "lista" : "list"]].map(([k, label], i) => (
        <React.Fragment key={k}>
          {i > 0 && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
          <button onClick={() => toggle(k)} className={`transition-opacity ${mode === k ? "opacity-100" : "opacity-45 hover:opacity-80"}`}>{label}</button>
        </React.Fragment>
      ))}
    </div>
  );

  if (mode === "list") {
    return (
      <div className="relative">
        <div className="container-x flex justify-end pt-24 md:pt-28">{Toggle}</div>
        <div className="-mt-24 md:-mt-28"><ProjectsList /></div>
      </div>
    );
  }

  return (
    <div ref={root} className="spiral-bg relative h-[100svh] overflow-hidden text-[#f4efe4]">
      <div ref={canvasWrap} className="absolute inset-0" />

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-56 bg-gradient-to-b from-[#0b0f1c] via-[#0b0f1c]/70 to-transparent md:h-64" />
      {/* cabecera */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-6 pt-24 md:px-12 md:pt-28">
        <div>
          <span className="eyebrow !text-[#d4a85a]">{data.eyebrow}</span>
          <h2 className="mt-3 text-4xl font-bold uppercase tracking-[-0.04em] md:text-5xl">{data.title}</h2>
        </div>
        <div className="pointer-events-auto">{Toggle}</div>
      </div>

      {/* contador */}
      <div className="pointer-events-none absolute bottom-8 left-6 z-10 font-mono text-sm tabular-nums text-[#f4efe4]/70 md:bottom-10 md:left-12">
        <span className="text-[#f4efe4]">{String(active + 1).padStart(2, "0")}</span> / {String(projects.length).padStart(2, "0")}
      </div>

      {/* etiqueta del proyecto activo */}
      <div className="absolute inset-x-0 bottom-7 z-10 flex justify-center md:bottom-9">
        <AnimatePresence mode="wait">
          <motion.a key={cur.title} href={cur.demo} target="_blank" rel="noopener noreferrer" data-cursor={data.demo}
            initial={{ y: 18, opacity: 0, scale: 0.94 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -12, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 rounded-2xl bg-[#f4efe4] p-1.5 pr-4 text-[#0a0f1d] shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)]">
            <img src={cur.img} alt="" className="h-11 w-11 rounded-xl object-cover object-top" />
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold">{cur.title}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0a0f1d]/55">{cur.cat}</span>
            </span>
            <ArrowUpRight size={18} className="ml-1" />
          </motion.a>
        </AnimatePresence>
      </div>
    </div>
  );
}
