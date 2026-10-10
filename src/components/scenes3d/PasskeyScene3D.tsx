"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { GlassHeart } from "@/components/three/GlassHeart";

/** Particles orbiting the passkey heart like little moons. */
function OrbitingParticles({ count = 70 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const n = runtime.highQuality ? count : Math.floor(count / 2);

  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(n * 3);
    const seeds = Array.from({ length: n }, () => ({
      radius: 1.7 + Math.random() * 1.4,
      speed: 0.12 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      yWave: 0.3 + Math.random() * 0.9,
      size: 0.4 + Math.random() * 0.9,
    }));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry, seeds };
  }, [n]);

  useFrame((state) => {
    if (runtime.reducedMotion) return;
    const t = state.clock.elapsedTime;
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attr.array as Float32Array;
    seeds.forEach((s, i) => {
      const a = s.phase + t * s.speed;
      array[i * 3] = Math.cos(a) * s.radius;
      array[i * 3 + 1] = Math.sin(t * s.speed * 1.6 + s.phase) * s.yWave * 0.5;
      array[i * 3 + 2] = Math.sin(a) * s.radius;
    });
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.05}
        color="#e9d5ff"
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/** The quiet opening scene: one glowing heart, waiting for her. */
export function PasskeyScene3D() {
  return (
    <group>
      <GlassHeart scale={1.1} glowScale={4.2} lightIntensity={2.4} />
      <OrbitingParticles />
    </group>
  );
}