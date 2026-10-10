"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { runtime } from "@/lib/runtime";
import { createHeartGeometry } from "./heartGeometry";

interface GiftBoxMeshProps {
  color?: string;
  lidColor?: string;
  ribbonColor?: string;
  scale?: number;
  /** 0 = closed, 1 = fully open (the lid floats up and tilts) */
  open01?: number;
}

/** A little gift box with a floating lid. */
export function GiftBoxMesh({
  color = "#f5b8cf",
  lidColor = "#e78aa8",
  ribbonColor = "#ecd9a0",
  scale = 1,
  open01 = 0,
}: GiftBoxMeshProps) {
  const lidRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const openRef = useRef(open01);
  openRef.current = open01;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (lidRef.current) {
      const o = openRef.current;
      lidRef.current.position.y = 0.66 + o * 1.5 + Math.sin(t * 1.2) * 0.02 * (1 - o);
      lidRef.current.rotation.z = o * 0.7;
      lidRef.current.rotation.x = o * 0.35;
    }
    if (bodyRef.current && !runtime.reducedMotion) {
      bodyRef.current.rotation.y = Math.sin(t * 0.4) * 0.06;
    }
  });

  return (
    <group scale={scale}>
      <group ref={bodyRef}>
        <RoundedBox args={[1.05, 1.05, 1.05]} radius={0.07} smoothness={4}>
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
        </RoundedBox>
        {/* ribbons around the body */}
        <mesh position={[0, 0, 0.001]}>
          <boxGeometry args={[0.16, 1.07, 1.06]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.3} emissive={new THREE.Color(ribbonColor)} emissiveIntensity={0.12} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.06, 1.07, 0.16]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.3} emissive={new THREE.Color(ribbonColor)} emissiveIntensity={0.12} />
        </mesh>
      </group>
      <group ref={lidRef} position={[0, 0.66, 0]}>
        <RoundedBox args={[1.15, 0.22, 1.15]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color={lidColor} roughness={0.3} metalness={0.08} />
        </RoundedBox>
        <mesh position={[0, 0.11, 0.001]}>
          <boxGeometry args={[0.16, 0.02, 1.16]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.3} />
        </mesh>
        <mesh position={[0.001, 0.11, 0]}>
          <boxGeometry args={[1.16, 0.02, 0.16]} />
          <meshStandardMaterial color={ribbonColor} roughness={0.3} />
        </mesh>
        {/* the bow — two little hearts */}
        <mesh position={[-0.1, 0.16, 0]} rotation={[0, 0, 0.5]} scale={0.024}>
          <meshStandardMaterial color={ribbonColor} roughness={0.3} emissive={new THREE.Color(ribbonColor)} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.1, 0.16, 0]} rotation={[0, 0, -0.5]} scale={0.024}>
          <meshStandardMaterial color={ribbonColor} roughness={0.3} emissive={new THREE.Color(ribbonColor)} emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/** A wax-sealed heart, used by the envelope and as a small decoration. */
export function WaxHeart({ scale = 1, color = "#e78aa8" }: { scale?: number; color?: string }) {
  const geometry = createHeartGeometry(0.5, 0.15);
  return (
    <mesh geometry={geometry} scale={scale}>
      <meshStandardMaterial color={color} roughness={0.25} emissive={new THREE.Color(color)} emissiveIntensity={0.25} />
    </mesh>
  );
}