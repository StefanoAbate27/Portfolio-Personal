import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import colorUrl from "../assets/founder/founder.webp";
import depthUrl from "../assets/founder/depth.png";
import eyesUrl from "../assets/founder/eyes.png";

/* Personaje 3D del fundador construido a partir de su render conceptual:
   - la imagen se proyecta sobre dos mallas con relieve (cabeza y torso) cuyo
     volumen sale de un mapa de profundidad (cráneo, pelo, nariz, mejillas,
     barbilla, cuello, hombros) y se ilumina en tiempo real según su orientación
   - la cabeza gira en 3D hacia el cursor sobre el cuello; el torso acompaña y respira
   - ojos = globos oculares 3D reales que miran al cursor, con párpados que parpadean
   - clic: asiente con un pequeño salto · scroll: se agacha detrás del titular */

const IMG_W = 822, IMG_H = 1126;
const H = 4, S = H / IMG_H, W = IMG_W * S;              // unidades de mundo
const px = (x, y) => [x * S - W / 2, H / 2 - y * S];      // píxel de la imagen → mundo
const PIVOT = px(430, 700);                              // base del cuello
const EYES = [{ c: [386.3, 397.5], z: 128 }, { c: [522.5, 398], z: 120 }];
const EYE_R = 33 * S, IRIS_R = 23.5 * S;
// profundidad calibrada con la vista de perfil del concepto (nariz-oreja ≈ 0,55 de la altura de la cabeza)
const HEAD_DEPTH = 1.35;

const VERT = /* glsl */ `
  uniform sampler2D uDepth; uniform float uScale; uniform int uMode; uniform vec2 uTexel; uniform vec2 uSize;
  varying vec2 vUv; varying vec3 vN;
  float dep(vec2 uv) { vec3 d = texture2D(uDepth, uv).rgb; return (uMode == 0 ? d.r : d.g) * uScale; }
  void main() {
    vUv = uv;
    vec3 p = position; p.z += dep(uv);
    vec2 o = uTexel * 3.0;
    float dx = (dep(uv + vec2(o.x, 0.)) - dep(uv - vec2(o.x, 0.))) / (2.0 * o.x * uSize.x);
    float dy = (dep(uv + vec2(0., o.y)) - dep(uv - vec2(0., o.y))) / (2.0 * o.y * uSize.y);
    vN = normalize(normalMatrix * normalize(vec3(-dx, -dy, 1.0)));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap; uniform sampler2D uDepth; uniform sampler2D uEyes;
  uniform int uMode; uniform float uBlink; uniform vec3 uLight;
  varying vec2 vUv; varying vec3 vN;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    float head = texture2D(uDepth, vUv).b;
    float a = smoothstep(0.25, 0.75, c.a);
    if (a < 0.01) discard;
    if (uMode == 0 && head < 0.5) discard;
    // el torso dibuja el cuello detrás (relleno al girar la cabeza), no la cara
    if (uMode == 1 && (vUv.y > 0.47 || (head > 0.5 && vUv.y > 0.45))) discard;
    vec3 col = c.rgb;
    if (uMode == 0) {
      vec2 e = texture2D(uEyes, vUv).rg;
      if (e.r > 0.5) {
        float k = e.g;
        if (k < uBlink) {
          col = mix(vec3(0.80, 0.52, 0.42), vec3(0.72, 0.44, 0.35), k / max(uBlink, 0.001));
          if (k > uBlink - 0.09) col = vec3(0.18, 0.10, 0.07);
          col = pow(col, vec3(2.2));
        } else {
          float sh = 1.0 - smoothstep(uBlink, uBlink + 0.32, k);
          if (sh < 0.01) discard;
          gl_FragColor = vec4(pow(vec3(0.24, 0.12, 0.08), vec3(2.2)), sh * 0.6);
          #include <colorspace_fragment>
          return;
        }
      }
    }
    float d = max(dot(normalize(vN), normalize(uLight)), 0.0);
    col *= 0.8 + 0.32 * d;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }`;

const IRIS_FRAG = /* glsl */ `
  varying vec3 vP; uniform float uR;
  void main() {
    float r = length(vP.xy) / uR;
    float ang = atan(vP.y, vP.x);
    vec3 amber = vec3(0.80, 0.63, 0.30), olive = vec3(0.62, 0.63, 0.33), dark = vec3(0.30, 0.31, 0.17);
    vec3 col = mix(amber, olive, smoothstep(0.35, 0.68, r));
    col = mix(col, dark, smoothstep(0.82, 1.0, r));
    float st = 0.5 + 0.5 * sin(ang * 38.0 + sin(ang * 7.0) * 2.0);
    col *= 0.86 + 0.22 * st * smoothstep(0.38, 0.6, r) * (1.0 - smoothstep(0.85, 1.0, r));
    col = mix(col, vec3(0.03), 1.0 - smoothstep(0.31, 0.34, r));     // pupila
    gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
    #include <colorspace_fragment>
  }`;
const IRIS_VERT = /* glsl */ `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

function useSurfaceMaterial(mode, maps) {
  return useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true,
    uniforms: {
      uMap: { value: maps.color }, uDepth: { value: maps.depth }, uEyes: { value: maps.eyes },
      uMode: { value: mode }, uScale: { value: 255 * S * (mode === 0 ? HEAD_DEPTH : 1) }, uBlink: { value: 0 },
      uTexel: { value: new THREE.Vector2(1 / IMG_W, 1 / IMG_H) }, uSize: { value: new THREE.Vector2(W, H) },
      uLight: { value: new THREE.Vector3(-0.35, 0.45, 0.82) },
    },
  }), [mode, maps]);
}

function Eye({ c, z, target, irisMat, scleraMat }) {
  const g = useRef();
  const [x, y] = px(...c);
  const pos = [x - PIVOT[0], y - PIVOT[1], z * S * HEAD_DEPTH - EYE_R * 0.55];
  useFrame(() => g.current && g.current.lookAt(target.current));
  const cap = Math.asin(IRIS_R / EYE_R);
  return (
    <group position={pos}>
      <group ref={g}>
        <mesh material={scleraMat}><sphereGeometry args={[EYE_R, 40, 40]} /></mesh>
        <mesh material={irisMat} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[EYE_R * 1.004, 48, 16, 0, Math.PI * 2, 0, cap]} />
        </mesh>
      </group>
      {/* reflejo de la córnea (fijo respecto a la luz) */}
      <mesh position={[-EYE_R * 0.28, EYE_R * 0.32, EYE_R * 1.02]}><circleGeometry args={[EYE_R * 0.17, 20]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[EYE_R * 0.22, -EYE_R * 0.2, EYE_R * 1.0]}><circleGeometry args={[EYE_R * 0.06, 12]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.6} /></mesh>
    </group>
  );
}

function Founder({ progress }) {
  const [color, depth, eyes] = useLoader(THREE.TextureLoader, [colorUrl, depthUrl, eyesUrl]);
  const maps = useMemo(() => {
    color.colorSpace = THREE.SRGBColorSpace;
    [color, depth, eyes].forEach((t) => { t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true; });
    return { color, depth, eyes };
  }, [color, depth, eyes]);
  const headMat = useSurfaceMaterial(0, maps);
  const bodyMat = useSurfaceMaterial(1, maps);
  const geo = useMemo(() => new THREE.PlaneGeometry(W, H, 260, 356), []);
  const irisMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: IRIS_VERT, fragmentShader: IRIS_FRAG, uniforms: { uR: { value: IRIS_R } } }), []);
  const scleraMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f6f2ec", roughness: 0.3 }), []);

  const root = useRef(), headRot = useRef(), body = useRef();
  const target = useRef(new THREE.Vector3(0, 0, 6));
  const st = useRef({ mx: 0, my: 0, last: 0, hx: 0, hy: 0, blinkAt: 1.6, blink: 0, nod: 0 });

  useEffect(() => {
    const onMove = (e) => {
      const s = st.current;
      s.mx = (e.clientX / window.innerWidth) * 2 - 1;
      s.my = -((e.clientY / window.innerHeight) * 2 - 1);
      s.last = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    const s = st.current, t = state.clock.elapsedTime;
    const idle = performance.now() - s.last > 2600;
    // el personaje está arriba en la pantalla: el "centro" de su mirada queda algo por encima del centro
    const tx = idle ? Math.sin(t * 0.5) * 0.5 : s.mx;
    const ty = idle ? Math.sin(t * 0.33) * 0.25 : s.my - 0.25;
    const k = 1 - Math.pow(0.02, dt);
    s.hx += (tx - s.hx) * k; s.hy += (ty - s.hy) * k;

    target.current.set(tx * 2.4, ty * 1.6 + 0.9, 8);

    s.nod = Math.max(0, s.nod - dt * 1.6);
    const nod = Math.sin(s.nod * Math.PI);
    if (headRot.current) {
      headRot.current.rotation.y = s.hx * 0.34 + Math.sin(t * 0.6) * 0.015;
      headRot.current.rotation.x = -s.hy * 0.13 + nod * 0.16 + Math.sin(t * 0.9) * 0.008;
      headRot.current.rotation.z = -s.hx * 0.035;
    }
    if (body.current) {
      body.current.rotation.y = s.hx * 0.09;
      const br = Math.sin(t * 1.5);
      body.current.scale.set(1 + br * 0.004, 1 + br * 0.006, 1);
    }

    // parpadeo
    if (t > s.blinkAt) { s.blink = 1; s.blinkAt = t + 2.6 + Math.random() * 3.2; }
    s.blink = Math.max(0, s.blink - dt * 7);
    const b = Math.sin(s.blink * Math.PI);
    headMat.uniforms.uBlink.value = b * 1.02;

    const p = progress ? progress.get() : 0;
    const sink = Math.min(1, Math.max(0, p / 0.08));
    if (root.current) root.current.position.y = -sink * 2.6 + nod * 0.06;
  });

  const react = (e) => { e.stopPropagation(); const s = st.current; s.nod = 1; s.blink = 1; s.blinkAt = s.blinkAt + 0.4; };

  return (
    <group ref={root} onPointerDown={react}>
      <group ref={body} position={[0, -H / 2, 0]}>
        <mesh geometry={geo} material={bodyMat} position={[0, H / 2, 0]} />
      </group>
      <group position={[PIVOT[0], PIVOT[1], 0]}>
        <group ref={headRot}>
          <mesh geometry={geo} material={headMat} position={[-PIVOT[0], -PIVOT[1], 0]} renderOrder={2} />
          {EYES.map((e, i) => <Eye key={i} {...e} target={target} irisMat={irisMat} scleraMat={scleraMat} />)}
        </group>
      </group>
    </group>
  );
}

export default function FounderCharacter({ progress, className = "" }) {
  const [active, setActive] = useState(true);
  useEffect(() => {
    if (!progress) return;
    const on = (v) => setActive(v < 0.12);
    on(progress.get());
    return progress.on("change", on);
  }, [progress]);
  return (
    <Canvas className={className} frameloop={active ? "always" : "never"} dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 15], fov: 16, near: 1, far: 40 }} data-cursor="¡Hola!">
      <ambientLight intensity={0.9} />
      <directionalLight position={[-3, 4, 6]} intensity={1.6} />
      <React.Suspense fallback={null}>
        <Founder progress={progress} />
      </React.Suspense>
    </Canvas>
  );
}
