"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { createPetalShape, createStarShape } from "./heartGeometry";

interface FlowerMeshProps {
  color?: string;
  centerColor?: string;
  scale?: number;
  sway?: boolean;
}

/** A soft lavender flower, gently swaying. */
export function FlowerMesh({
  color = "#c9a7eb",
  centerColor = "#ecd9a0",
  scale = 1,
  sway = true,
}: FlowerMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const petalsRef = useRef<THREE.Group>(null);

  const petalGeometry = useMemo(() => new THREE.ShapeGeometry(createPetalShape(1, 0.6), 14), []);
  const starGeometry = useMemo(
    () => new THREE.ExtrudeGeometry(createStarShape(0.16, 0.07, 5), { depth: 0.05, bevelEnabled: false }),
    []
  );
  useEffect(
    () => () => {
      petalGeometry.dispose();
      starGeometry.dispose();
    },
    [petalGeometry, starGeometry]
  );

  useFrame((state) => {
    if (!groupRef.current || runtime.reducedMotion || !sway) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.z = Math.sin(t * 0.7) * 0.07;
    groupRef.current.rotation.x = Math.cos(t * 0.5) * 0.05;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <group ref={petalsRef}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh
            key={i}
            geometry={petalGeometry}
            rotation={[0, 0, (i / 6) * Math.PI * 2]}
            scale={0.34}
          >
            <meshStandardMaterial
              color={i % 2 === 0 ? color : "#d9c3f2"}
              emissive={new THREE.Color(color)}
              emissiveIntensity={0.22}
              side={THREE.DoubleSide}
              roughness={0.55}
            />
          </mesh>
        ))}
      </group>
      <mesh geometry={starGeometry} position={[0, 0, 0.04]}>
        <meshStandardMaterial
          color={centerColor}
          emissive={new THREE.Color(centerColor)}
          emissiveIntensity={0.9}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

interface StarMeshProps {
  color?: string;
  scale?: number;
  spin?: boolean;
}

/** A tiny glowing star. */
export function StarMesh({ color = "#ecd9a0", scale = 1, spin = false }: StarMeshProps) {
  const geometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(createStarShape(1, 0.45, 5), {
        depth: 0.22,
        bevelEnabled: true,
        bevelSize: 0.1,
        bevelThickness: 0.08,
        bevelSegments: 2,
      }),
    []
  );
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!ref.current) return;
    if (spin && !runtime.reducedMotion) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.9;
    }
    const s = runtime.reducedMotion ? scale : scale * (1 + 0.05 * Math.sin(state.clock.elapsedTime * 2));
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} geometry={geometry} scale={scale}>
      <meshStandardMaterial
        color={color}
        emissive={new THREE.Color(color)}
        emissiveIntensity={0.85}
        roughness={0.35}
      />
    </mesh>
  );
}