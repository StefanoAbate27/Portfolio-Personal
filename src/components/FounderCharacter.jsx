import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/* Personaje 3D del fundador: malla esculpida a partir de su hoja de personaje
   (frente, perfiles y espalda) con textura horneada y esqueleto
   columna → cuello → cabeza (public/models/founder.glb).
   - cabeza y cuello giran hacia el cursor repartiendo el giro entre ambos huesos
   - globos oculares 3D que miran al cursor y párpados que parpadean
   - respiración y balanceo sutil del torso; mirada que pasea si el ratón está quieto
   - clic: asiente y parpadea · scroll: se agacha detrás del titular */

const MODEL = "/models/founder.glb";
const SKIN = "#c2937d";

const IRIS_VERT = /* glsl */ `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const IRIS_FRAG = /* glsl */ `
  varying vec3 vP; uniform float uR;
  void main() {
    float r = length(vP.xz) / uR;
    float ang = atan(vP.z, vP.x);
    vec3 amber = vec3(0.72, 0.56, 0.28), olive = vec3(0.50, 0.53, 0.29), dark = vec3(0.20, 0.22, 0.12);
    vec3 col = mix(amber, olive, smoothstep(0.32, 0.68, r));
    col = mix(col, dark, smoothstep(0.82, 1.0, r));
    float st = 0.5 + 0.5 * sin(ang * 40.0 + sin(ang * 7.0) * 2.0);
    col *= 0.86 + 0.24 * st * smoothstep(0.36, 0.6, r) * (1.0 - smoothstep(0.86, 1.0, r));
    col = mix(col, vec3(0.02), 1.0 - smoothstep(0.36, 0.39, r));
    gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
    #include <colorspace_fragment>
  }`;

function Eyeball({ node, target, lidRef }) {
  const r = (node.userData?.radius || 0.068) * 0.98;
  const ball = useRef();
  const mats = useMemo(() => ({
    sclera: new THREE.MeshPhysicalMaterial({ color: "#f3efe9", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
    iris: new THREE.ShaderMaterial({ vertexShader: IRIS_VERT, fragmentShader: IRIS_FRAG, uniforms: { uR: { value: r * 0.5 } } }),
    lid: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6, side: THREE.DoubleSide }),
    lash: new THREE.MeshStandardMaterial({ color: "#2a1a12", roughness: 0.7 }),
  }), [r]);
  const cap = Math.asin(0.5);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => { if (ball.current) { tmp.copy(target.current); ball.current.lookAt(tmp); } });
  return (
    <group>
      <group ref={ball}>
        <mesh material={mats.sclera}><sphereGeometry args={[r, 40, 32]} /></mesh>
        <mesh material={mats.iris} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[r * 1.004, 48, 16, 0, Math.PI * 2, 0, cap]} />
        </mesh>
      </group>
      {/* párpado superior: casquete de piel que baja al parpadear */}
      <group ref={lidRef} rotation={[-0.55, 0, 0]}>
        <mesh material={mats.lid}><sphereGeometry args={[r * 1.06, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
        <mesh material={mats.lash} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r * 1.06, r * 0.05, 8, 48, Math.PI]} /></mesh>
      </group>
    </group>
  );
}

function Founder({ progress, onReady }) {
  const gltf = useLoader(GLTFLoader, MODEL, (l) => l.setMeshoptDecoder(MeshoptDecoder));
  const { camera, size } = useThree();
  const scene = gltf.scene;

  const rig = useMemo(() => {
    const get = (n) => scene.getObjectByName(n);
    const bones = { head: get("Head"), neck: get("Neck"), spine: get("Spine") };
    const rest = Object.fromEntries(Object.entries(bones).map(([k, b]) => [k, b ? b.quaternion.clone() : null]));
    scene.traverse((o) => {
      if (o.isMesh) {
        o.frustumCulled = false;
        if (o.material) {
          o.material.roughness = 0.62; o.material.metalness = 0;
          if (o.material.map) { o.material.map.anisotropy = 8; o.material.map.colorSpace = THREE.SRGBColorSpace; }
        }
      }
    });
    const eyes = [get("EyeL"), get("EyeR")].filter(Boolean);
    const box = new THREE.Box3().setFromObject(scene);
    return { bones, rest, eyes, box };
  }, [scene]);

  // encuadre: busto completo, la cabeza en el tercio superior
  useEffect(() => {
    const { box } = rig;
    const h = box.max.y - box.min.y, w = box.max.x - box.min.x;
    const aspect = size.width / size.height;
    const fov = (camera.fov * Math.PI) / 180;
    const dist = Math.max((h * 0.56) / Math.tan(fov / 2), (w * 0.56) / (Math.tan(fov / 2) * aspect));
    const cy = box.min.y + h * 0.53;
    camera.position.set(0, cy + h * 0.04, box.max.z + dist);
    camera.lookAt(0, cy, 0);
    camera.updateProjectionMatrix();
    onReady?.();
  }, [rig, camera, size, onReady]);

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
    const tx = idle ? Math.sin(t * 0.45) * 0.5 : s.mx;
    const ty = idle ? Math.sin(t * 0.31) * 0.22 : s.my - 0.2;
    const k = 1 - Math.pow(0.03, dt);
    s.hx += (tx - s.hx) * k; s.hy += (ty - s.hy) * k;

    // punto de mirada (delante del personaje)
    const headY = rig.box.min.y + (rig.box.max.y - rig.box.min.y) * 0.72;
    target.current.set(tx * 2.2, headY + ty * 1.4, 4);

    s.nod = Math.max(0, s.nod - dt * 1.5);
    const nod = Math.sin(s.nod * Math.PI);
    const yaw = s.hx * 0.55, pitch = -s.hy * 0.28 + nod * 0.22, roll = -s.hx * 0.06;
    const apply = (name, f, extra = [0, 0, 0]) => {
      const b = rig.bones[name]; if (!b) return;
      // el eje Y del hueso apunta a lo largo del cuello: Y = girar, X = asentir
      q.e.set(pitch * f + extra[0], yaw * f + extra[1], roll * f + extra[2]);
      q.a.setFromEuler(q.e);
      b.quaternion.copy(rig.rest[name]).multiply(q.a);
    };
    apply("neck", 0.38, [Math.sin(t * 0.9) * 0.006, 0, 0]);
    apply("head", 0.62, [0, Math.sin(t * 0.6) * 0.012, 0]);
    const br = Math.sin(t * 1.5);
    apply("spine", 0.12, [br * 0.006, 0, 0]);
    if (rig.bones.spine) rig.bones.spine.scale.set(1 + br * 0.004, 1 + br * 0.004, 1 + br * 0.006);

    // parpadeo
    if (t > s.blinkAt) { s.blink = 1; s.blinkAt = t + 2.6 + Math.random() * 3.2; }
    s.blink = Math.max(0, s.blink - dt * 7);
    const b = Math.sin(s.blink * Math.PI);
    const lidRot = -0.55 + b * 2.05 + Math.max(0, -s.hy) * 0.12;
    lids.forEach((l) => { if (l.current) l.current.rotation.x = lidRot; });

    const p = progress ? progress.get() : 0;
    const sink = Math.min(1, Math.max(0, p / 0.08));
    if (root.current) root.current.position.y = -sink * (rig.box.max.y - rig.box.min.y) * 0.9 + nod * 0.015;
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
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
      camera={{ position: [0, 0, 6], fov: 22, near: 0.05, far: 50 }} data-cursor="¡Hola!">
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#4a4640", 1.0]} />
      <directionalLight position={[-1.4, 2.0, 3.2]} intensity={2.4} color="#fff8f0" />
      <directionalLight position={[2.4, 0.8, 2.2]} intensity={0.9} color="#e6ecff" />
      <directionalLight position={[0.6, 2.4, -3]} intensity={1.6} color="#e7b766" />
      <directionalLight position={[-2.6, 1, -2]} intensity={0.8} color="#d4a85a" />
      <Suspense fallback={null}>
        <Founder progress={progress} />
      </Suspense>
    </Canvas>
  );
}
