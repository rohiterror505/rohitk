"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { experience } from "@/config/experience";
import { createHeartGeometry } from "./heartGeometry";
import { radialGlowTexture } from "./glowTextures";

interface GlassHeartProps {
  scale?: number;
  color?: string;
  glowColor?: string;
  beat?: boolean;
  glowScale?: number;
  lightIntensity?: number;
}

/** The signature glowing glass heart. */
export function GlassHeart({
  scale = 1,
  color = experience.theme.blush,
  glowColor = experience.theme.rosy,
  beat = true,
  glowScale = 3.4,
  lightIntensity = 2.6,
}: GlassHeartProps) {
  const geometry = useMemo(() => createHeartGeometry(0.5, 0.15), []);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const glowMap = useMemo(() => radialGlowTexture("#ffd6e8", 128), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = beat && !runtime.reducedMotion
      ? 1 + 0.03 * Math.sin(t * 2.3) + 0.018 * Math.sin(t * 4.6)
      : 1;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale * pulse);
      meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.22;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(glowScale * scale * (0.96 + 0.06 * Math.sin(t * 2.3)));
      const material = glowRef.current.material as THREE.SpriteMaterial;
      material.opacity = 0.42 + 0.1 * Math.sin(t * 2.3);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        {runtime.highQuality ? (
          <meshPhysicalMaterial
            color={color}
            transmission={0.72}
            thickness={1.1}
            roughness={0.14}
            ior={1.38}
            emissive={new THREE.Color(glowColor)}
            emissiveIntensity={0.5}
            clearcoat={1}
            clearcoatRoughness={0.25}
            transparent
            opacity={0.96}
          />
        ) : (
          <meshPhysicalMaterial
            color={color}
            emissive={new THREE.Color(glowColor)}
            emissiveIntensity={0.85}
            roughness={0.3}
            transparent
            opacity={0.92}
          />
        )}
      </mesh>
      <sprite ref={glowRef} scale={glowScale * scale} raycast={() => null}>
        <spriteMaterial
          map={glowMap}
          color={new THREE.Color(glowColor)}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <pointLight color={new THREE.Color(glowColor)} intensity={lightIntensity} distance={8} />
    </group>
  );
}