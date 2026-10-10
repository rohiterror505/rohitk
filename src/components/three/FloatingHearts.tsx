"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { heartSpriteTexture } from "./glowTextures";

interface FloatingHeartsProps {
  count?: number;
  area?: [number, number, number];
  center?: [number, number, number];
  color?: string;
  size?: number;
}

/** Little hearts drifting gently upward through the air. */
export function FloatingHearts({
  count,
  area = [9, 5.5, 9],
  center = [0, 0, 0],
  color = "#f5b8cf",
  size = 0.4,
}: FloatingHeartsProps) {
  const n = count ?? (runtime.highQuality ? 34 : 16);
  const map = useMemo(() => heartSpriteTexture(color), [color]);
  const positionsRef = useRef<Float32Array | null>(null);
  const speedsRef = useRef<Float32Array | null>(null);
  const phasesRef = useRef<Float32Array | null>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(n * 3);
    const speeds = new Float32Array(n);
    const phases = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = center[0] + (Math.random() - 0.5) * area[0];
      positions[i * 3 + 1] = center[1] + (Math.random() - 0.5) * area[1];
      positions[i * 3 + 2] = center[2] + (Math.random() - 0.5) * area[2];
      speeds[i] = 0.1 + Math.random() * 0.16;
      phases[i] = Math.random() * Math.PI * 2;
    }
    positionsRef.current = positions;
    speedsRef.current = speeds;
    phasesRef.current = phases;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, area[0], area[1], area[2], center[0], center[1], center[2]]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        map,
        size,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [map, size]
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = positions.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      if (runtime.reducedMotion) break;
      const speed = speedsRef.current![i];
      const phase = phasesRef.current![i];
      array[i * 3 + 1] += speed * dt;
      array[i * 3] += Math.sin(t * 0.6 + phase) * 0.06 * dt;
      if (array[i * 3 + 1] > center[1] + area[1] / 2) {
        array[i * 3 + 1] = center[1] - area[1] / 2;
      }
    }
    positions.needsUpdate = true;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}