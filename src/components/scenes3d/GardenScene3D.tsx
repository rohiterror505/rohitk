"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { experience } from "@/config/experience";
import {
  discoverGardenObject,
  useExperience,
  type GardenObjectId,
} from "@/lib/store";
import { audio } from "@/lib/audio";
import { GlassHeart } from "@/components/three/GlassHeart";
import { FlowerMesh, StarMesh } from "@/components/three/FlowerStarMeshes";
import { ButterflyMesh } from "@/components/three/ButterflyMesh";
import { GiftBoxMesh } from "@/components/three/GiftBoxMesh";
import { CloudDisc, DriftingMotes } from "@/components/three/CloudDisc";
import { FloatingHearts } from "@/components/three/FloatingHearts";
import { radialGlowTexture } from "@/components/three/glowTextures";

/** Wraps a garden object: click pulse, hover glow, and a golden aura
    once discovered. */
function GardenObject({
  id,
  position,
  scale = 1,
  children,
}: {
  id: GardenObjectId;
  position: [number, number, number];
  scale?: number;
  children: React.ReactNode;
}) {
  const found = useExperience((s) => s.gardenFound[id]);
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Sprite>(null);
  const pulseAt = useRef<number | null>(null);
  const clock = useRef(0);
  const auraMap = useMemo(() => radialGlowTexture("#ecd9a0", 128), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    clock.current += dt;
    const g = groupRef.current;
    if (g) {
      let scaleMul = 1;
      if (pulseAt.current !== null) {
        const k = (clock.current - pulseAt.current) / 0.8;
        if (k < 1) scaleMul = 1 + 0.35 * Math.sin(k * Math.PI) * (1 - k);
        else pulseAt.current = null;
      }
      g.scale.setScalar(scale * scaleMul);
    }
    if (auraRef.current) {
      const material = auraRef.current.material as THREE.SpriteMaterial;
      const target = found ? 0.5 : 0;
      material.opacity += (target - material.opacity) * Math.min(1, dt * 2.5);
      auraRef.current.visible = material.opacity > 0.02;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        pulseAt.current = clock.current;
        discoverGardenObject(id);
        audio.playSfx("chime");
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {children}
      <sprite ref={auraRef} scale={2.2} visible={false} raycast={() => null}>
        <spriteMaterial
          map={auraMap}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/** A butterfly that hovers in place, gently bobbing. */
function RestingButterfly() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current || runtime.reducedMotion) return;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.18;
  });
  return (
    <group ref={ref}>
      <ButterflyMesh scale={0.75} />
    </group>
  );
}

/** The little heart garden floating in a twilight sky. */
export function GardenScene3D() {
  return (
    <group>
      <CloudDisc radius={5.6} y={-1.9} opacity={0.42} />
      <DriftingMotes count={46} radius={6.5} />
      <FloatingHearts count={20} area={[12, 6, 8]} center={[0, 0.6, 0]} />

      <GardenObject id="heart" position={[-2.1, 0.55, 0.6]} scale={0.5}>
        <GlassHeart glowScale={3.4} lightIntensity={1.6} />
      </GardenObject>

      <GardenObject id="flower" position={[1.9, 0.35, 0.9]} scale={1.05}>
        <FlowerMesh color={experience.theme.lavender} />
      </GardenObject>

      <GardenObject id="star" position={[0.1, 1.8, -0.9]} scale={0.4}>
        <StarMesh color={experience.theme.gold} spin />
      </GardenObject>

      <GardenObject id="butterfly" position={[-0.9, 1.35, -1.3]} scale={1}>
        <RestingButterfly />
      </GardenObject>

      <GardenObject id="gift" position={[0.95, -0.35, 1.5]} scale={0.55}>
        <GiftBoxMesh />
      </GardenObject>
    </group>
  );
}