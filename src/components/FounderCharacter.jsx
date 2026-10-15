import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/* Personaje 3D del fundador con acabado de ilustración (estilo daveholloway.uk):
   malla esculpida desde su hoja de personaje, textura de colores planos,
   sombreado por bandas (toon) y contorno fino de tinta.
   - cabeza y cuello giran hacia el cursor (esqueleto columna → cuello → cabeza)
   - globos oculares 3D que siguen al ratón, párpados que parpadean
   - respiración; si el ratón está quieto la mirada pasea sola
   - clic: asiente · fuera de pantalla deja de renderizar */

const MODEL = "/models/founder-toon.glb";
const SKIN = "#d9a184";
const INK = "#1a1310";

// rampa de 3 tonos: sombra marcada, medio y luz (look de ilustración plana)
function toonRamp() {
  const data = new Uint8Array([120, 120, 120, 255, 205, 205, 205, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return t;
}

// contorno por "casco invertido": se infla la malla por la normal y se dibuja solo la cara trasera
function outlineMaterial(width) {
  const m = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\n transformed += normalize(objectNormal) * ${width.toFixed(4)};`);
  };
  return m;
}

const IRIS_VERT = /* glsl */ `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const IRIS_FRAG = /* glsl */ `
  varying vec3 vP; uniform float uR;
  void main() {
    float r = length(vP.xz) / uR;
    vec3 col = mix(vec3(0.62, 0.66, 0.30), vec3(0.36, 0.42, 0.18), step(0.62, r));
    col = mix(col, vec3(0.13, 0.15, 0.07), step(0.88, r));
    col = mix(col, vec3(0.03), 1.0 - step(0.38, r));
    gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
    #include <colorspace_fragment>
  }`;

function Eyeball({ node, target, lidRef }) {
  const r = (node.userData?.radius || 0.068) * 0.98;
  const ball = useRef();
  const mats = useMemo(() => ({
    sclera: new THREE.MeshToonMaterial({ color: "#f6f1e8", gradientMap: toonRamp() }),
    iris: new THREE.ShaderMaterial({ vertexShader: IRIS_VERT, fragmentShader: IRIS_FRAG, uniforms: { uR: { value: r * 0.5 } } }),
    lid: new THREE.MeshToonMaterial({ color: SKIN, gradientMap: toonRamp(), side: THREE.DoubleSide }),
    lash: new THREE.MeshBasicMaterial({ color: INK }),
    spec: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
  }), [r]);
  const cap = Math.asin(0.5);
  useFrame(() => { if (ball.current) ball.current.lookAt(target.current); });
  return (
    <group>
      <group ref={ball}>
        <mesh material={mats.sclera}><sphereGeometry args={[r, 40, 32]} /></mesh>
        <mesh material={mats.iris} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[r * 1.004, 48, 16, 0, Math.PI * 2, 0, cap]} />
        </mesh>
      </group>
      {/* brillo fijo, como en la ilustración */}
      <mesh material={mats.spec} position={[-r * 0.28, r * 0.3, r * 1.02]}><circleGeometry args={[r * 0.16, 16]} /></mesh>
      <group ref={lidRef} rotation={[-0.55, 0, 0]}>
        <mesh material={mats.lid}><sphereGeometry args={[r * 1.06, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
        <mesh material={mats.lash} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r * 1.06, r * 0.07, 8, 48, Math.PI]} /></mesh>
      </group>
    </group>
  );
}

function Founder({ framing }) {
  const gltf = useLoader(GLTFLoader, MODEL, (l) => l.setMeshoptDecoder(MeshoptDecoder));
  const { camera, size } = useThree();
  const scene = gltf.scene;

  const rig = useMemo(() => {
    const get = (n) => scene.getObjectByName(n);
    const bones = { head: get("Head"), neck: get("Neck"), spine: get("Spine") };
    const rest = Object.fromEntries(Object.entries(bones).map(([k, b]) => [k, b ? b.quaternion.clone() : null]));
    const ramp = toonRamp();
    const outlines = [];
    scene.traverse((o) => {
      if (!o.isMesh || o.userData.outline) return;
      o.frustumCulled = false;
      const map = o.material.map;
      if (map) { map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8; }
      o.material = new THREE.MeshToonMaterial({ map, gradientMap: ramp });
      // contorno: copia de la malla con piel/huesos compartidos
      if (o.isSkinnedMesh) {
        const ol = new THREE.SkinnedMesh(o.geometry, outlineMaterial(0.0065));
        ol.userData.outline = true; ol.bind(o.skeleton, o.bindMatrix); ol.frustumCulled = false;
        outlines.push([o.parent, ol]);
      }
    });
    outlines.forEach(([p, ol]) => p.add(ol));
    const eyes = [get("EyeL"), get("EyeR")].filter(Boolean);
    const box = new THREE.Box3().setFromObject(scene);
    return { bones, rest, eyes, box };
  }, [scene]);

  // encuadre: "hero" = busto grande cortado por abajo (como Dave); "bust" = busto completo
  useEffect(() => {
    const { box } = rig;
    const h = box.max.y - box.min.y, w = box.max.x - box.min.x;
    const aspect = size.width / size.height;
    const fov = (camera.fov * Math.PI) / 180;
    const show = framing === "hero" ? 0.82 : 1.12, cyF = framing === "hero" ? 0.6 : 0.53;
    const dist = Math.max((h * show * 0.5) / Math.tan(fov / 2), (w * 0.56) / (Math.tan(fov / 2) * aspect));
    const cy = box.min.y + h * cyF;
    camera.position.set(0, cy + h * 0.03, box.max.z + dist);
    camera.lookAt(0, cy, 0);
    camera.updateProjectionMatrix();
  }, [rig, camera, size, framing]);

  const target = useRef(new THREE.Vector3(0, 0.5, 3));
  const lids = [useRef(), useRef()];
  const root = useRef();
  const st = useRef({ mx: 0, my: 0, last: 0, hx: 0, hy: 0, blinkAt: 1.4, blink: 0, nod: 0 });
  const q = useMemo(() => ({ a: new THREE.Quaternion(), e: new THREE.Euler() }), []);

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
    // el personaje está a la derecha: el centro de su mirada se desplaza hacia la izquierda
    const tx = idle ? Math.sin(t * 0.45) * 0.5 - 0.25 : s.mx + (framing === "hero" ? -0.35 : 0);
    const ty = idle ? Math.sin(t * 0.31) * 0.22 : s.my - 0.1;
    const k = 1 - Math.pow(0.03, dt);
    s.hx += (tx - s.hx) * k; s.hy += (ty - s.hy) * k;

    const headY = rig.box.min.y + (rig.box.max.y - rig.box.min.y) * 0.72;
    target.current.set(tx * 2.2, headY + ty * 1.4, 4);

    s.nod = Math.max(0, s.nod - dt * 1.5);
    const nod = Math.sin(s.nod * Math.PI);
    const yaw = s.hx * 0.55, pitch = -s.hy * 0.28 + nod * 0.22, roll = -s.hx * 0.06;
    const apply = (name, f, extra = [0, 0, 0]) => {
      const b = rig.bones[name]; if (!b) return;
      q.e.set(pitch * f + extra[0], yaw * f + extra[1], roll * f + extra[2]);
      q.a.setFromEuler(q.e);
      b.quaternion.copy(rig.rest[name]).multiply(q.a);
    };
    apply("neck", 0.38, [Math.sin(t * 0.9) * 0.006, 0, 0]);
    apply("head", 0.62, [0, Math.sin(t * 0.6) * 0.012, 0]);
    const br = Math.sin(t * 1.5);
    apply("spine", 0.12, [br * 0.006, 0, 0]);
    if (rig.bones.spine) rig.bones.spine.scale.set(1 + br * 0.004, 1 + br * 0.004, 1 + br * 0.006);

    if (t > s.blinkAt) { s.blink = 1; s.blinkAt = t + 2.6 + Math.random() * 3.2; }
    s.blink = Math.max(0, s.blink - dt * 7);
    const b = Math.sin(s.blink * Math.PI);
    const lidRot = -0.55 + b * 2.05 + Math.max(0, -s.hy) * 0.12;
    lids.forEach((l) => { if (l.current) l.current.rotation.x = lidRot; });
    if (root.current) root.current.position.y = nod * 0.015;
  });

  const react = (e) => { e.stopPropagation(); const s = st.current; s.nod = 1; s.blink = 1; s.blinkAt += 0.4; };

  return (
    <group ref={root} onPointerDown={react}>
      <primitive object={scene} />
      {rig.eyes.map((node, i) => (
        <React.Fragment key={node.name}>{createPortal(<Eyeball node={node} target={target} lidRef={lids[i]} />, node)}</React.Fragment>
      ))}
    </group>
  );
}

export default function FounderCharacter({ className = "", framing = "hero" }) {
  const wrap = useRef(null);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className={className}>
      <Canvas frameloop={active ? "always" : "never"} dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 6], fov: 22, near: 0.05, far: 50 }} data-cursor="¡Hola!">
        <ambientLight intensity={1.1} />
        <directionalLight position={[-1.8, 2.4, 3]} intensity={2.3} color="#fff6ea" />
        <directionalLight position={[2.5, 1.2, -1.5]} intensity={1.1} color="#9fb6ff" />
        <Suspense fallback={null}>
          <Founder framing={framing} />
        </Suspense>
      </Canvas>
    </div>
  );
}
