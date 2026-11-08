import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/* Personaje del fundador con el acabado exacto de su render (estilo Pixar):
   - textura HD (Real-ESRGAN ×4) proyectada sobre una malla con relieve real
     (mapa de profundidad de Depth Anything V2)
   - la cabeza gira en 3D hacia el cursor sobre el cuello (peso suave en el shader)
   - los iris HD se desplazan dentro de cada ojo siguiendo al ratón
   - parpadeo con la piel real del párpado, respiración, mirada que pasea y
     asentimiento al hacer clic */

const BASE = "/models/founder";
const CHIN_V = 0.205, COLLAR_V = 0.12, PIVOT_V = 0.17;   // alturas (UV, 0 = abajo)
const DEPTH = 0.26;

const VERT = /* glsl */ `
  uniform sampler2D uMaps; uniform float uDepth, uYaw, uPitch, uBody, uBreath;
  uniform vec3 uPivot; uniform vec2 uNeck;
  varying vec2 vUv;
  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
  vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += texture2D(uMaps, uv).r * uDepth;
    float w = smoothstep(uNeck.x, uNeck.y, uv.y);          // 0 cuerpo → 1 cabeza
    vec3 q = p - uPivot;
    q = rotX(rotY(q, uYaw * w + uBody * (1.0 - w)), uPitch * w);
    p = q + uPivot;
    p.y += uBreath * (1.0 - w) * 0.004 + uBreath * w * 0.006;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

const FRAG = /* glsl */ `
  uniform sampler2D uColor, uMaps, uIris;
  uniform vec4 uEye0, uEye1;      // cx, cy (uv), r, rs
  uniform vec4 uBox0, uBox1;      // x0, x1, y0, y1 (uv) de la abertura
  uniform vec2 uGaze; uniform float uBlink;
  varying vec2 vUv;
  vec3 eyeColor(vec3 base, vec2 uv, vec4 e, vec4 box, float side, float k) {
    vec2 h = vec2((box.y - box.x) * 0.5, (box.w - box.z) * 0.5);
    vec2 ic = e.xy + uGaze * vec2(h.x * 0.36, h.y * 0.22);
    vec2 q = (uv - ic) / (2.0 * e.w) + 0.5;
    vec4 ir = (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) ? texture2D(uIris, vec2(side * 0.5 + q.x * 0.5, q.y)) : vec4(0.0);
    // sombra de las pestañas/párpado sobre el iris (más oscuro arriba)
    vec3 iris = ir.rgb * mix(0.62, 1.0, smoothstep(0.02, 0.4, k));
    return mix(base, iris, ir.a);
  }
  void main() {
    vec4 c = texture2D(uColor, vUv);
    if (c.a < 0.04) discard;
    vec3 maps = texture2D(uMaps, vUv).rgb;
    float m = maps.g;
    if (m > 0.01) {
      float k = maps.b;
      bool left = vUv.x < 0.54;
      vec4 e = left ? uEye0 : uEye1; vec4 box = left ? uBox0 : uBox1;
      vec3 eye = eyeColor(c.rgb, vUv, e, box, left ? 0.0 : 1.0, k);
      if (k < uBlink) {
        // párpado: piel real tomada justo encima del ojo
        eye = texture2D(uColor, vec2(vUv.x, box.w + 0.012 + (box.w - vUv.y) * 0.25)).rgb * 0.97;
        if (k > uBlink - 0.05) eye = mix(eye, vec3(0.20, 0.12, 0.09), 0.75);
      }
      c.rgb = mix(c.rgb, eye, m);
    }
    gl_FragColor = vec4(c.rgb, smoothstep(0.04, 0.6, c.a));
    #include <colorspace_fragment>
  }`;

export default function FounderRender({ className = "" }) {
  const wrap = useRef(null);

  useEffect(() => {
    const el = wrap.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 20);
    const dist = 0.5 / Math.tan(THREE.MathUtils.degToRad(10));
    camera.position.set(0, 0, dist + 0.1);

    const loader = new THREE.TextureLoader();
    const tex = (f, srgb) => { const t = loader.load(`${BASE}/${f}`); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const uni = {
      uColor: { value: tex("color.webp", true) }, uMaps: { value: tex("maps.png") }, uIris: { value: tex("iris.png", true) },
      uDepth: { value: DEPTH }, uYaw: { value: 0 }, uPitch: { value: 0 }, uBody: { value: 0 }, uBreath: { value: 0 },
      uPivot: { value: new THREE.Vector3(0, PIVOT_V - 0.5, DEPTH * 0.45) }, uNeck: { value: new THREE.Vector2(COLLAR_V, CHIN_V) },
      uEye0: { value: new THREE.Vector4() }, uEye1: { value: new THREE.Vector4() },
      uBox0: { value: new THREE.Vector4() }, uBox1: { value: new THREE.Vector4() },
      uGaze: { value: new THREE.Vector2() }, uBlink: { value: 0 },
    };
    fetch(`${BASE}/meta.json`).then((r) => r.json()).then((meta) => {
      meta.eyes.forEach((e, i) => {
        uni[`uEye${i}`].value.set(e.cx, 1 - e.cy, e.r, e.rs);
        uni[`uBox${i}`].value.set(e.x0, e.x1, 1 - e.y1, 1 - e.y0);
      });
    });
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uni, transparent: true });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 320, 320), mat);
    scene.add(mesh);

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);

    const s = { mx: 0, my: 0, hx: 0, hy: 0, last: 0, blinkAt: performance.now() + 1500, blink: 0, nod: 0, vis: true, raf: 0 };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const fx = r.left + r.width * 0.54, fy = r.top + r.height * 0.45;
      s.mx = Math.max(-1, Math.min(1, (e.clientX - fx) / (window.innerWidth * 0.45)));
      s.my = Math.max(-1, Math.min(1, (e.clientY - fy) / (window.innerHeight * 0.55)));
      s.last = performance.now();
    };
    const onDown = () => { s.nod = 1; s.blink = 1; };
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onDown);
    const io = new IntersectionObserver(([en]) => { s.vis = en.isIntersecting; });
    io.observe(el);

    const loop = (now) => {
      s.raf = requestAnimationFrame(loop);
      if (!s.vis) return;
      const t = now / 1000;
      const idle = now - s.last > 2600;
      const tx = idle ? Math.sin(t * 0.45) * 0.5 : s.mx;
      const ty = idle ? Math.sin(t * 0.31) * 0.25 : s.my;
      s.hx += (tx - s.hx) * 0.07; s.hy += (ty - s.hy) * 0.07;
      s.nod = Math.max(0, s.nod - 0.02);
      const nod = Math.sin(s.nod * Math.PI);
      uni.uYaw.value = s.hx * 0.3 + Math.sin(t * 0.6) * 0.012;
      uni.uPitch.value = s.hy * 0.14 + nod * 0.12;
      uni.uBody.value = s.hx * 0.05;
      uni.uBreath.value = Math.sin(t * 1.6);
      uni.uGaze.value.set(Math.max(-1, Math.min(1, s.hx * 1.3)), Math.max(-1, Math.min(1, -s.hy * 1.3)));
      if (now > s.blinkAt) { s.blink = 1; s.blinkAt = now + 2600 + Math.random() * 3400; }
      s.blink = Math.max(0, s.blink - 0.11);
      uni.uBlink.value = Math.sin(s.blink * Math.PI) * 1.05;
      renderer.render(scene, camera);
    };
    if (reduce) { requestAnimationFrame(() => renderer.render(scene, camera)); }
    else s.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(s.raf); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove); el.removeEventListener("pointerdown", onDown);
      mesh.geometry.dispose(); mat.dispose(); Object.values(uni).forEach((u) => u.value?.isTexture && u.value.dispose());
      renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  return <div ref={wrap} className={className} role="img" aria-label="Stefano Abate, fundador de SAAE" data-cursor="¡Hola!" />;
}
