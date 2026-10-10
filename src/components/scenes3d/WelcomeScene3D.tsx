"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { experience } from "@/config/experience";
import { GlassHeart } from "@/components/three/GlassHeart";
import { FloatingHearts } from "@/components/three/FloatingHearts";
import { Butterflies } from "@/components/three/ButterflyMesh";
import { FlowerMesh } from "@/components/three/FlowerStarMeshes";
import { radialGlowTexture } from "@/components/three/glowTextures";

/** A soft glowing moon. */
function Moon() {
  const glowMap = useMemo(() => radialGlowTexture("#fff3d9", 256), []);
  const glowRef = useRef<THREE.Sprite>(null);

  useFrame((state) => {
    if (glowRef.current && !runtime.reducedMotion) {
      const t = state.clock.elapsedTime;
      (glowRef.current.material as THREE.SpriteMaterial).opacity =
        0.5 + 0.05 * Math.sin(t * 0.7);
    }
  });

  return (
    <group position={[-3.4, 2.9, -5.5]}>
      <mesh>
        <sphereGeometry args={[0.95, 48, 48]} />
        <meshStandardMaterial
          color="#f7ecd4"
          emissive={new THREE.Color("#f2e2bd")}
          emissiveIntensity={0.85}
          roughness={0.9}
        />
      </mesh>
      <sprite ref={glowRef} scale={7}>
        <spriteMaterial
          map={glowMap}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <pointLight color="#ffedb8" intensity={1.6} distance={22} />
    </group>
  );
}

/** The opening scene: a moonlit night, soft flowers, drifting hearts. */
export function WelcomeScene3D() {
  return (
    <group>
      <Moon />
      {/* floating flowers */}
      <group position={[-2.6, -1.1, 0.4]} scale={0.85}>
        <FlowerMesh color={experience.theme.lavender} />
      </group>
      <group position={[2.9, -1.5, 1.2]} scale={0.65}>
        <FlowerMesh color={experience.theme.blush} />
      </group>
      <group position={[1.9, -0.6, -1.6]} scale={0.5}>
        <FlowerMesh color={experience.theme.babyblue} />
      </group>
      {/* a quiet little heart, waiting for the story to begin */}
      <group position={[2.4, 1.7, -2.5]} scale={0.45}>
        <GlassHeart glowScale={3.2} lightIntensity={1.2} />
      </group>
      <Butterflies count={3} center={[0, 0.4, 0]} radius={3.4} scale={0.55} />
      <FloatingHearts count={26} area={[12, 6, 6]} center={[0, 0.3, -1]} />
    </group>
  );
}