"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import type { CakeStage } from "@/lib/store";
import { createHeartGeometry } from "./heartGeometry";
import { radialGlowTexture } from "./glowTextures";

interface CakeMeshProps {
  stage: CakeStage;
  /** increments every time the cake should sparkle (e.g. on click) */
  sparkleKey: number;
  onClick: () => void;
}

const CANDLE_COLORS = ["#c9a7eb", "#f5b8cf", "#a9c7f2", "#f5b8cf", "#c9a7eb"];

/** A little two-layer birthday cake with five glowing candles. */
export function CakeMesh({ stage, sparkleKey, onClick }: CakeMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flamesRef = useRef<THREE.Group[]>([]);
  const smokeRef = useRef<THREE.Sprite[]>([]);
  const gatherRef = useRef<THREE.Points>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const blownAt = useRef<number | null>(null);
  const wishedAt = useRef<number | null>(null);
  const bounceAt = useRef<number | null>(null);
  const sparkleAt = useRef<number | null>(null);
  const sparklesRef = useRef<THREE.Sprite | null>(null);
  const clock = useRef(0);

  const flameMap = useMemo(() => radialGlowTexture("#ffdf9e", 96), []);
  const smokeMap = useMemo(() => radialGlowTexture("#cfd3e8", 96), []);
  const heartGeometry = useMemo(() => createHeartGeometry(0.4, 0.045), []);

  useEffect(() => {
    if (stage === "blown") blownAt.current = clock.current;
    if (stage === "wished") wishedAt.current = clock.current;
  }, [stage]);
  useEffect(() => {
    if (sparkleKey > 0) sparkleAt.current = clock.current;
  }, [sparkleKey]);

  // gentle wish-gathering fireflies above the cake
  const gatherGeometry = useMemo(() => {
    const n = 34;
    const positions = new Float32Array(n * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  const gatherSeeds = useMemo(
    () =>
      Array.from({ length: 34 }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.7 + Math.random() * 1.1,
        speed: 0.6 + Math.random() * 0.9,
        y: 1.4 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    clock.current += dt;
    const t = clock.current;

    // the jelly bounce when she pokes the cake
    if (groupRef.current) {
      let sy = 1;
      if (bounceAt.current !== null) {
        const k = (t - bounceAt.current) / 0.7;
        if (k < 1) sy = 1 - 0.1 * Math.sin(k * Math.PI) * (1 - k);
        else bounceAt.current = null;
      }
      groupRef.current.scale.set(1 + (1 - sy) * 0.5, sy, 1 + (1 - sy) * 0.5);
    }

    // candle flames
    const brighten = stage === "wished" ? 1.5 : 1;
    flamesRef.current.forEach((flame, i) => {
      if (!flame) return;
      let target = 1;
      if (stage === "blown" && blownAt.current !== null) {
        const since = t - blownAt.current - i * 0.35;
        target = since > 0 ? 0 : brighten;
      } else if (stage === "wished") {
        target = brighten;
      }
      const flicker = runtime.reducedMotion
        ? 1
        : 1 + 0.16 * Math.sin(t * 13 + i * 2.4) + 0.06 * Math.sin(t * 29 + i);
      const current = flame.scale.x / (brighten || 1);
      const next = current + (target - current) * Math.min(1, dt * 6);
      flame.scale.setScalar(Math.max(0.001, next * flicker));
      const material = (flame.children[0] as THREE.Sprite).material as THREE.SpriteMaterial;
      material.opacity = Math.min(1, next * 0.95);
    });

    // little wisps of smoke after each flame goes out
    smokeRef.current.forEach((smoke, i) => {
      if (!smoke) return;
      if (stage === "blown" && blownAt.current !== null) {
        const since = t - blownAt.current - i * 0.35;
        if (since > 0 && since < 1.4) {
          const k = since / 1.4;
          smoke.visible = true;
          smoke.position.set(
            Math.sin(i * 1.3) * 0.06 * k,
            2.32 + k * 0.55,
            Math.cos(i * 2.1) * 0.05
          );
          smoke.scale.setScalar(0.14 + k * 0.22);
          (smoke.material as THREE.SpriteMaterial).opacity = 0.35 * (1 - k);
        } else {
          smoke.visible = false;
        }
      } else {
        smoke.visible = false;
      }
    });

    // warm light above the cake
    if (lightRef.current) {
      const target = stage === "blown" ? 0.25 : stage === "wished" ? 1.9 : 1.1;
      lightRef.current.intensity += (target - lightRef.current.intensity) * Math.min(1, dt * 3);
    }

    // fireflies gathering after the wish
    if (gatherRef.current) {
      const material = gatherRef.current.material as THREE.PointsMaterial;
      const since = wishedAt.current !== null ? t - wishedAt.current : 0;
      const progress = Math.min(1, since / 2.4);
      const positions = gatherGeometry.getAttribute("position") as THREE.BufferAttribute;
      const array = positions.array as Float32Array;
      gatherSeeds.forEach((s, i) => {
        if (runtime.reducedMotion) {
          array[i * 3] = Math.cos(s.angle) * s.radius;
          array[i * 3 + 1] = s.y;
          array[i * 3 + 2] = Math.sin(s.angle) * s.radius;
          return;
        }
        const shrink = 1 - progress * 0.75;
        const r = s.radius * shrink;
        const a = s.angle + t * s.speed;
        array[i * 3] = Math.cos(a) * r;
        array[i * 3 + 1] = s.y * (1 - progress * 0.25) + progress * 0.35 * Math.sin(t * 2 + s.phase);
        array[i * 3 + 2] = Math.sin(a) * r;
      });
      positions.needsUpdate = true;
      const targetOpacity = stage === "idle" ? 0 : stage === "blown" ? 0.18 : 0.85;
      material.opacity += (targetOpacity - material.opacity) * Math.min(1, dt * 2);
      gatherRef.current.visible = material.opacity > 0.02;
    }

    // click sparkles
    if (sparklesRef.current) {
      const mat = sparklesRef.current.material as THREE.SpriteMaterial;
      if (sparkleAt.current !== null) {
        const since = t - sparkleAt.current;
        if (since < 0.9) {
          sparklesRef.current.visible = true;
          const k = since / 0.9;
          sparklesRef.current.scale.setScalar(1.6 + k * 2.2);
          mat.opacity = 0.55 * (1 - k);
        } else {
          sparklesRef.current.visible = false;
          sparkleAt.current = null;
        }
      }
    }
  });

  const cakeTopY = 1.62;

  return (
    <group
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation();
        bounceAt.current = clock.current;
        onClick();
      }}
    >
      {/* plate */}
      <mesh position={[0, 0.035, 0]}>
        <cylinderGeometry args={[1.75, 1.8, 0.07, 48]} />
        <meshStandardMaterial color="#efe9f7" roughness={0.35} metalness={0.15} />
      </mesh>

      {/* bottom layer */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[1.38, 1.38, 0.55, 48]} />
        <meshStandardMaterial color="#f0cbd9" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.63, 0]}>
        <cylinderGeometry args={[1.38, 1.38, 0.06, 48]} />
        <meshStandardMaterial color="#fdf6ea" roughness={0.55} />
      </mesh>

      {/* top layer */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.44, 48]} />
        <meshStandardMaterial color="#e9c3d8" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.26, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.06, 48]} />
        <meshStandardMaterial color="#fdf6ea" roughness={0.55} />
      </mesh>

      {/* frosting scallops */}
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <mesh key={`b${i}`} position={[Math.cos(a) * 1.37, 0.6, Math.sin(a) * 1.37]}>
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial color="#fdf6ea" roughness={0.5} />
          </mesh>
        );
      })}
      {Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2;
        return (
          <mesh key={`t${i}`} position={[Math.cos(a) * 0.99, 1.23, Math.sin(a) * 0.99]}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color="#fdf6ea" roughness={0.5} />
          </mesh>
        );
      })}

      {/* tiny berry hearts around the top */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + 0.3;
        return (
          <mesh
            key={`h${i}`}
            geometry={heartGeometry}
            position={[Math.cos(a) * 0.62, 1.38, Math.sin(a) * 0.62]}
            rotation={[0.35, 0, Math.PI]}
            scale={0.6}
          >
            <meshStandardMaterial
              color="#e78aa8"
              emissive={new THREE.Color("#e78aa8")}
              emissiveIntensity={0.35}
              roughness={0.4}
            />
          </mesh>
        );
      })}

      {/* candles + flames + smoke */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 5;
        const x = Math.cos(a) * 0.52;
        const z = Math.sin(a) * 0.52;
        return (
          <group key={`c${i}`} position={[x, cakeTopY, z]}>
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.038, 0.038, 0.4, 12]} />
              <meshStandardMaterial color={CANDLE_COLORS[i]} roughness={0.55} />
            </mesh>
            <group
              ref={(el) => {
                if (el) flamesRef.current[i] = el;
              }}
              position={[0, 0.42, 0]}
            >
              <sprite scale={0.3}>
                <spriteMaterial
                  map={flameMap}
                  transparent
                  opacity={0.9}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </sprite>
              <mesh>
                <sphereGeometry args={[0.035, 10, 10]} />
                <meshStandardMaterial
                  color="#fff3d6"
                  emissive={new THREE.Color("#ffd88e")}
                  emissiveIntensity={2.2}
                />
              </mesh>
            </group>
            <sprite
              ref={(el) => {
                if (el) smokeRef.current[i] = el;
              }}
              position={[0, 0.45, 0]}
              scale={0.14}
              visible={false}
            >
              <spriteMaterial
                map={smokeMap}
                transparent
                opacity={0}
                depthWrite={false}
              />
            </sprite>
          </group>
        );
      })}

      {/* wish fireflies */}
      <points ref={gatherRef} geometry={gatherGeometry} frustumCulled={false}>
        <pointsMaterial
          size={0.09}
          color="#ffe2b8"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* click sparkle */}
      <sprite ref={sparklesRef} position={[0, 1.9, 0]} visible={false} scale={1.6}>
        <spriteMaterial
          map={flameMap}
          color={new THREE.Color("#f5b8cf")}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <pointLight
        ref={lightRef}
        position={[0, 2.1, 0.4]}
        color="#ffdba8"
        intensity={1.1}
        distance={9}
      />
    </group>
  );
}