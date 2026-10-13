import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* Personaje 3D estilizado (estilo animación) del fundador, modelado por
   código con primitivas suaves: cabeza grande, ojos expresivos que siguen
   el ratón, parpadeo, cejas que reaccionan, pelo castaño peinado de lado y
   camisa negra (como en su foto). Está apoyado con los brazos cruzados sobre
   el borde superior del titular: todo lo que queda por debajo de esa
   "repisa" se recorta con un plano de corte. */

const LEDGE = -1.62; // altura de la repisa (borde superior del titular)
const COLORS = {
  skin: "#efc2a2",
  skinShade: "#e2a987",
  blush: "#ff8f7d",
  hair: "#3a281d",
  hairHi: "#4a3426",
  shirt: "#17181c",
  button: "#2c2d33",
  lips: "#b9675d",
  iris: "#6b4226",
};

/* Cápsula entre dos puntos (brazos, antebrazos, cuello de camisa…). */
function Limb({ a, b, r, material }) {
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const dir = B.clone().sub(A);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { pos: A.add(B).multiplyScalar(0.5), quat: q, len: dir.length() };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} material={material} castShadow>
      <capsuleGeometry args={[r, len, 12, 24]} />
    </mesh>
  );
}

function Eye({ side, mats, target, lidRef }) {
  const eye = useRef();
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!eye.current) return;
    // los ojos convergen ligeramente hacia el punto que mira
    tmp.copy(target.current);
    eye.current.lookAt(tmp);
  });
  const x = side * 0.37;
  return (
    <group position={[x, 0.04, 0.68]}>
      <group ref={eye}>
        <mesh material={mats.sclera}><sphereGeometry args={[0.29, 40, 40]} /></mesh>
        {/* iris + pupila + brillo */}
        <mesh position={[0, 0, 0.283]} material={mats.iris}><circleGeometry args={[0.15, 40]} /></mesh>
        <mesh position={[0, 0, 0.287]} material={mats.pupil}><circleGeometry args={[0.075, 32]} /></mesh>
        <mesh position={[0.055, 0.06, 0.292]} material={mats.spec}><circleGeometry args={[0.034, 20]} /></mesh>
        <mesh position={[-0.04, -0.045, 0.29]} material={mats.spec}><circleGeometry args={[0.015, 16]} /></mesh>
      </group>
      {/* párpado superior (rota hacia delante para parpadear) */}
      <mesh ref={lidRef} material={mats.lid} rotation={[-0.8, 0, 0]}>
        <sphereGeometry args={[0.298, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {/* línea de pestañas en el borde del párpado */}
        <mesh material={mats.lash} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.298, 0.016, 8, 40, Math.PI]} /></mesh>
      </mesh>
    </group>
  );
}

function Character({ progress, onReady }) {
  const { gl, size } = useThree();
  const root = useRef();
  const head = useRef();
  const torso = useRef();
  const browL = useRef();
  const browR = useRef();
  const mouth = useRef();
  const lidL = useRef();
  const lidR = useRef();
  const target = useRef(new THREE.Vector3(0, 0.6, 6));
  const st = useRef({ mx: 0, my: 0, last: performance.now(), blinkAt: performance.now() + 2200, blink: 0, joy: 0, hx: 0, hy: 0 });

  useEffect(() => { gl.localClippingEnabled = true; onReady?.(); }, [gl, onReady]);

  const headGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 72, 72);
    const v = g.attributes.position;
    for (let i = 0; i < v.count; i++) {
      const y = v.getY(i);
      if (y < 0.15) {
        const t = Math.pow((0.15 - y) / 1.15, 1.25);
        v.setX(i, v.getX(i) * (1 - 0.3 * t));
        v.setZ(i, v.getZ(i) * (1 - 0.1 * t) + 0.06 * t);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);

  // ratón en coordenadas normalizadas de la VENTANA (no del canvas): los ojos siguen el cursor por toda la página
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

  const mats = useMemo(() => {
    const clip = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -LEDGE)];
    const skin = new THREE.MeshPhysicalMaterial({ color: COLORS.skin, roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color("#ffb3a1"), sheenRoughness: 0.5, clearcoat: 0.06 });
    return {
      skin,
      skinClip: Object.assign(skin.clone(), { clippingPlanes: clip }),
      lid: new THREE.MeshPhysicalMaterial({ color: COLORS.skin, roughness: 0.6, sheen: 0.4, sheenColor: new THREE.Color("#ffb3a1") }),
      lash: new THREE.MeshStandardMaterial({ color: "#2a1c14", roughness: 0.6 }),
      blush: new THREE.MeshBasicMaterial({ color: COLORS.blush, transparent: true, opacity: 0.12, depthWrite: false }),
      hair: new THREE.MeshPhysicalMaterial({ color: COLORS.hair, roughness: 0.48, sheen: 0.5, sheenColor: new THREE.Color("#8a6248"), clearcoat: 0.15, clearcoatRoughness: 0.6 }),
      shirt: new THREE.MeshStandardMaterial({ color: COLORS.shirt, roughness: 0.82, clippingPlanes: clip }),
      shirtArm: new THREE.MeshStandardMaterial({ color: COLORS.shirt, roughness: 0.82 }),
      button: new THREE.MeshStandardMaterial({ color: COLORS.button, roughness: 0.35, metalness: 0.1, clippingPlanes: clip }),
      sclera: new THREE.MeshPhysicalMaterial({ color: "#fbfaf6", roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
      iris: new THREE.MeshStandardMaterial({ color: COLORS.iris, roughness: 0.3 }),
      pupil: new THREE.MeshBasicMaterial({ color: "#0d0a08" }),
      spec: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
      lips: new THREE.MeshStandardMaterial({ color: COLORS.lips, roughness: 0.45 }),
      brow: new THREE.MeshStandardMaterial({ color: COLORS.hair, roughness: 0.7 }),
      stubble: new THREE.MeshBasicMaterial({ color: "#5a4334", transparent: true, opacity: 0.1, depthWrite: false }),
      shadow: new THREE.ShadowMaterial({ opacity: 0.22 }),
    };
  }, []);

  useFrame((state, dt) => {
    const s = st.current;
    const now = performance.now();
    const t = state.clock.elapsedTime;
    const idle = now - s.last > 2600;
    // si el cursor está quieto, la mirada pasea suavemente
    const mx = idle ? Math.sin(t * 0.45) * 0.45 : s.mx;
    const my = idle ? Math.sin(t * 0.31) * 0.18 + 0.05 : s.my;
    const k = 1 - Math.pow(0.0015, dt);
    s.hx += (mx - s.hx) * k * 0.9;
    s.hy += (my - s.hy) * k * 0.9;

    // punto de mirada en el mundo (delante del personaje, escalado al tamaño de la ventana)
    target.current.set(mx * 5.5, 0.55 + my * 3.6, 5.5);

    // cabeza: gira hacia el cursor (menos que los ojos) + balanceo
    if (head.current) {
      head.current.rotation.y = s.hx * 0.38;
      head.current.rotation.x = -s.hy * 0.2 + Math.sin(t * 1.1) * 0.012;
      head.current.rotation.z = -s.hx * 0.06 + Math.sin(t * 0.7) * 0.015 + Math.sin(s.joy * Math.PI) * 0.12;
      head.current.position.y = 0.58 + Math.sin(t * 1.6) * 0.012 + Math.sin(s.joy * Math.PI) * 0.06;
    }
    // respiración
    if (torso.current) torso.current.scale.set(1 + Math.sin(t * 1.6) * 0.006, 1 + Math.sin(t * 1.6) * 0.012, 1);

    // parpadeo (y entrecerrar al sonreír)
    if (now > s.blinkAt) { s.blink = 1; s.blinkAt = now + 2400 + Math.random() * 3200; }
    s.blink = Math.max(0, s.blink - dt * 7.5);
    const b = Math.sin(Math.min(1, s.blink) * Math.PI);
    s.joy = Math.max(0, s.joy - dt * 0.9);
    const joy = Math.sin(Math.min(1, s.joy) * Math.PI);
    const lidRot = -0.8 + b * 2.25 + joy * 0.55 - Math.max(0, s.hy) * 0.2;
    if (lidL.current) lidL.current.rotation.x = lidRot;
    if (lidR.current) lidR.current.rotation.x = lidRot;

    // cejas: suben cuando mira arriba o al reaccionar
    const browY = 0.43 + Math.max(0, s.hy) * 0.05 + joy * 0.08;
    if (browL.current) { browL.current.position.y = browY; browL.current.rotation.z = Math.PI / 2 - 0.12 - joy * 0.15; }
    if (browR.current) { browR.current.position.y = browY + 0.01; browR.current.rotation.z = Math.PI / 2 + 0.08 + joy * 0.15; }
    if (mouth.current) mouth.current.scale.set(1 + joy * 0.25, 1 + joy * 0.6, 1);

    // salida al hacer scroll: se agacha detrás del titular
    const p = progress ? progress.get() : 0;
    const sink = Math.min(1, Math.max(0, p / 0.07));
    if (root.current) root.current.position.y = -sink * 3.4;
  });

  const react = (e) => { e.stopPropagation(); st.current.joy = 1; };

  const narrow = size.width < 520;
  return (
    <group ref={root} onPointerDown={react} scale={narrow ? 0.92 : 1}>
      {/* sombra de los brazos sobre la repisa */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LEDGE + 0.001, 0.8]} receiveShadow material={mats.shadow}>
        <planeGeometry args={[9, 3]} />
      </mesh>

      {/* torso con camisa */}
      <group ref={torso} position={[0, -1.85, -0.15]}>
        <mesh material={mats.shirt} scale={[1.62, 1.25, 0.95]} castShadow><sphereGeometry args={[1, 48, 48]} /></mesh>
        {/* botones */}
        {[0.95, 0.55, 0.15].map((y) => (
          <mesh key={y} position={[0.02, y, 0.82 - (0.95 - y) * 0.12]} material={mats.button}><sphereGeometry args={[0.045, 16, 16]} /></mesh>
        ))}
      </group>
      {/* cuello */}
      <mesh position={[0, -0.6, -0.08]} material={mats.skinClip}><cylinderGeometry args={[0.33, 0.38, 0.9, 32]} /></mesh>
      {/* cuello de camisa (button-down) */}
      <Limb a={[-0.45, -0.72, 0.05]} b={[-0.05, -1.02, 0.42]} r={0.07} material={mats.shirtArm} />
      <Limb a={[0.45, -0.72, 0.05]} b={[0.05, -1.02, 0.42]} r={0.07} material={mats.shirtArm} />

      {/* brazos cruzados apoyados en la repisa */}
      <Limb a={[-1.38, -0.95, -0.05]} b={[-1.58, LEDGE + 0.3, 0.75]} r={0.29} material={mats.shirtArm} />
      <Limb a={[1.38, -0.95, -0.05]} b={[1.58, LEDGE + 0.3, 0.75]} r={0.29} material={mats.shirtArm} />
      <Limb a={[-1.58, LEDGE + 0.29, 0.78]} b={[0.55, LEDGE + 0.29, 1.12]} r={0.27} material={mats.shirtArm} />
      <Limb a={[1.58, LEDGE + 0.3, 0.72]} b={[-0.5, LEDGE + 0.36, 1.32]} r={0.265} material={mats.shirtArm} />
      {/* manos */}
      <mesh position={[0.92, LEDGE + 0.27, 1.17]} rotation={[0, -0.3, 0]} scale={[0.34, 0.24, 0.3]} material={mats.skin} castShadow><sphereGeometry args={[1, 32, 32]} /></mesh>
      <mesh position={[-0.88, LEDGE + 0.33, 1.38]} rotation={[0, 0.3, 0]} scale={[0.33, 0.24, 0.3]} material={mats.skin} castShadow><sphereGeometry args={[1, 32, 32]} /></mesh>

      {/* cabeza */}
      <group ref={head} position={[0, 0.58, 0]}>
        {/* cabeza en forma de huevo: una sola superficie con barbilla afinada */}
        <mesh geometry={headGeo} material={mats.skin} scale={[0.9, 1.1, 0.95]} castShadow />
        {/* orejas */}
        {[-1, 1].map((sd) => (
          <mesh key={sd} material={mats.skin} position={[sd * 0.9, 0.02, -0.05]} rotation={[0, sd * 0.35, sd * -0.12]} scale={[0.15, 0.27, 0.13]}><sphereGeometry args={[1, 24, 24]} /></mesh>
        ))}
        {/* mejillas */}
        {[-1, 1].map((sd) => (
          <mesh key={sd} material={mats.blush} position={[sd * 0.52, -0.2, 0.74]} scale={[0.2, 0.12, 0.05]}><sphereGeometry args={[1, 20, 20]} /></mesh>
        ))}
        {/* nariz */}
        <mesh material={mats.skin} position={[0, -0.1, 0.93]} scale={[0.12, 0.2, 0.14]}><sphereGeometry args={[1, 32, 32]} /></mesh>
        <mesh material={mats.skin} position={[0, -0.22, 0.95]} scale={[0.15, 0.1, 0.12]}><sphereGeometry args={[1, 24, 24]} /></mesh>
        {/* boca: sonrisa ligera (un poco asimétrica, como en la foto) */}
        <group ref={mouth} position={[0.03, -0.3, 0.92]}>
          <mesh material={mats.lips} rotation={[-0.32, 0, -Math.PI / 2 - 0.8]}><torusGeometry args={[0.17, 0.032, 12, 40, 1.6]} /></mesh>
        </group>

        {/* ojos */}
        <Eye side={-1} mats={mats} target={target} lidRef={lidL} />
        <Eye side={1} mats={mats} target={target} lidRef={lidR} />

        {/* cejas */}
        <mesh ref={browL} material={mats.brow} position={[-0.37, 0.43, 0.84]} rotation={[0.25, 0.3, Math.PI / 2]}><capsuleGeometry args={[0.052, 0.3, 8, 16]} /></mesh>
        <mesh ref={browR} material={mats.brow} position={[0.37, 0.44, 0.84]} rotation={[0.25, -0.3, Math.PI / 2]}><capsuleGeometry args={[0.052, 0.3, 8, 16]} /></mesh>

        {/* pelo: casquete + volumen peinado hacia un lado con raya a la izquierda */}
        <group>
          <mesh material={mats.hair} position={[0, 0.12, -0.08]} rotation={[-0.42, 0, 0]} scale={[1.0, 1.0, 1.02]}>
            <sphereGeometry args={[1, 56, 56, 0, Math.PI * 2, 0, 1.32]} />
          </mesh>
          <mesh material={mats.hair} position={[0, 0.25, -0.35]} scale={[0.98, 0.9, 0.8]}><sphereGeometry args={[1, 48, 48]} /></mesh>
          {/* tupé */}
          <mesh material={mats.hair} position={[-0.32, 0.92, 0.38]} rotation={[0.3, 0, 0.35]} scale={[0.5, 0.26, 0.5]}><sphereGeometry args={[1, 40, 40]} /></mesh>
          <mesh material={mats.hair} position={[0.12, 1.0, 0.36]} rotation={[0.25, 0, -0.12]} scale={[0.62, 0.3, 0.52]}><sphereGeometry args={[1, 40, 40]} /></mesh>
          <mesh material={mats.hair} position={[0.55, 0.86, 0.25]} rotation={[0.2, 0, -0.45]} scale={[0.46, 0.27, 0.5]}><sphereGeometry args={[1, 40, 40]} /></mesh>
          <mesh material={mats.hair} position={[0.7, 0.62, 0.32]} rotation={[0.1, 0.2, -0.9]} scale={[0.32, 0.2, 0.36]}><sphereGeometry args={[1, 32, 32]} /></mesh>
          {/* patillas / sienes */}
          {[-1, 1].map((sd) => (
            <mesh key={sd} material={mats.hair} position={[sd * 0.84, 0.36, 0.05]} rotation={[0, 0, sd * -0.15]} scale={[0.17, 0.42, 0.45]}><sphereGeometry args={[1, 32, 32]} /></mesh>
          ))}
          {/* raya marcada */}
          <mesh material={mats.hairHi} position={[-0.5, 0.92, 0.2]} rotation={[0.4, 0.2, 0.9]}><capsuleGeometry args={[0.02, 0.5, 6, 12]} /></mesh>
        </group>
      </group>
    </group>
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#fff6ec", "#2a2f3d", 0.75]} />
      <directionalLight position={[3.5, 5, 6]} intensity={2.1} color="#fff3e6" castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <directionalLight position={[-5, 2, 3]} intensity={0.55} color="#c9d6ff" />
      {/* luz de contorno dorada (acento SAAE) */}
      <directionalLight position={[-2, 0.5, -6]} intensity={0.9} color="#e0b46a" />
      <pointLight position={[-3.5, 1.5, -3]} intensity={6} distance={10} color="#d4a85a" />
    </>
  );
}

export default function FounderCharacter({ progress, className = "", onReady }) {
  // solo renderiza mientras el personaje está a la vista (ahorra GPU/batería)
  const [active, setActive] = useState(true);
  useEffect(() => {
    if (!progress) return;
    const on = (v) => setActive(v < 0.1);
    on(progress.get());
    return progress.on("change", on);
  }, [progress]);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      className={className}
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.9, 8], fov: 30, near: 0.1, far: 50 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.12, 0)}
      data-cursor="¡Hola!"
    >
      <Lights />
      <Character progress={progress} onReady={onReady} />
    </Canvas>
  );
}
