"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { createWingShape } from "./heartGeometry";

interface ButterflyMeshProps {
  color?: string;
  wingColor2?: string;
  scale?: number;
  flapSpeed?: number;
}

/** One gentle butterfly with softly flapping wings. */
export function ButterflyMesh({
  color = "#c9a7eb",
  wingColor2 = "#f5b8cf",
  scale = 1,
  flapSpeed = 1,
}: ButterflyMeshProps) {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  const wingGeometry = useMemo(() => {
    const shape = createWingShape();
    const geometry = new THREE.ShapeGeometry(shape, 18);
    return geometry;
  }, []);
  useEffect(() => () => wingGeometry.dispose(), [wingGeometry]);

  useFrame((state) => {
    if (runtime.reducedMotion) {
      if (leftRef.current) leftRef.current.rotation.y = 0.8;
      if (rightRef.current) rightRef.current.rotation.y = -0.8;
      return;
    }
    const t = state.clock.elapsedTime * (7 + flapSpeed * 3) + phase.current;
    const flap = 0.35 + 0.55 * Math.sin(t);
    if (leftRef.current) leftRef.current.rotation.y = flap;
    if (rightRef.current) rightRef.current.rotation.y = -flap;
  });

  return (
    <group scale={scale}>
      {/* body */}
      <mesh>
        <capsuleGeometry args={[0.028, 0.34, 4, 8]} />
        <meshStandardMaterial color="#5b4a86" roughness={0.6} />
      </mesh>
      <group ref={leftRef}>
        <mesh geometry={wingGeometry} position={[0.01, 0.05, 0]}>
          <meshStandardMaterial
            color={color}
            emissive={new THREE.Color(color)}
            emissiveIntensity={0.25}
            side={THREE.DoubleSide}
            roughness={0.5}
            transparent
            opacity={0.92}
          />
        </mesh>
      </group>
      <group ref={rightRef}>
        <mesh geometry={wingGeometry} position={[-0.01, 0.05, 0]} scale={[-1, 1, 1]}>
          <meshStandardMaterial
            color={wingColor2}
            emissive={new THREE.Color(wingColor2)}
            emissiveIntensity={0.25}
            side={THREE.DoubleSide}
            roughness={0.5}
            transparent
            opacity={0.92}
          />
        </mesh>
      </group>
    </group>
  );
}

interface ButterfliesProps {
  count?: number;
  center?: [number, number, number];
  radius?: number;
  scale?: number;
}

/** A little flock of butterflies wandering through the air. */
export function Butterflies({
  count = 3,
  center = [0, 0, 0],
  radius = 3,
  scale = 1,
}: ButterfliesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        ax: 1.2 + Math.random() * 1.6,
        ay: 0.5 + Math.random() * 0.7,
        speed: 0.12 + Math.random() * 0.14,
        phase: Math.random() * Math.PI * 2,
        rotPhase: Math.random() * Math.PI * 2,
      })),
    [count]
  );

  useFrame((state) => {
    if (!groupRef.current || runtime.reducedMotion) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const s = seeds[i];
      const x = Math.cos(t * s.speed * s.ax + s.phase) * radius;
      const y = Math.sin(t * s.speed * 1.7 + s.phase) * radius * 0.32;
      const z = Math.sin(t * s.speed * s.ax + s.phase) * radius * 0.7;
      child.position.set(center[0] + x, center[1] + y, center[2] + z);
      child.rotation.y = -t * s.speed * s.ax + s.rotPhase + Math.PI / 2;
      child.rotation.z = Math.sin(t * 2 + s.phase) * 0.1;
    });
  });

  return (
    <group ref={groupRef}>
      {seeds.map((_, i) => (
        <group key={i} scale={scale}>
          <ButterflyMesh
            color={i % 2 === 0 ? "#c9a7eb" : "#a9c7f2"}
            wingColor2={i % 2 === 0 ? "#f5b8cf" : "#ecd9a0"}
          />
        </group>
      ))}
    </group>
  );
}