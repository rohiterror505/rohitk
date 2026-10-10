"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { cloudTexture } from "./glowTextures";

/** A soft dreamy cloud platform floating under the scene. */
export function CloudDisc({
  radius = 4.4,
  y = -1.35,
  opacity = 0.4,
}: {
  radius?: number;
  y?: number;
  opacity?: number;
}) {
  const map = useMemo(() => cloudTexture(), []);

  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[radius, 56]} />
        <meshBasicMaterial
          map={map}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 0, -0.01]} scale={1.45}>
        <circleGeometry args={[radius, 56]} />
        <meshBasicMaterial
          map={map}
          transparent
          opacity={opacity * 0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** Slow drifting mist particles that give a scene its atmosphere. */
export function DriftingMotes({
  count = 60,
  radius = 8,
}: {
  count?: number;
  radius?: number;
}) {
  const points = useRef<THREE.Points>(null);
  const n = runtime.highQuality ? count : Math.floor(count / 2);

  const { geometry, speeds } = useMemo(() => {
    const positions = new Float32Array(n * 3);
    const speeds = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      speeds[i] = 0.05 + Math.random() * 0.12;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry, speeds };
  }, [n, radius]);

  useFrame((state, delta) => {
    if (runtime.reducedMotion) return;
    const dt = Math.min(delta, 0.05);
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attr.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      array[i * 3 + 1] += speeds[i] * dt;
      array[i * 3] += Math.sin(t * 0.3 + i) * 0.008;
      if (array[i * 3 + 1] > 3.2) array[i * 3 + 1] = -3.2;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.05}
        color="#cbbdf2"
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}