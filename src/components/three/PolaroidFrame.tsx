"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { experience, type PhotoConfig } from "@/config/experience";
import { runtime } from "@/lib/runtime";
import { getPhotoAspect, getPhotoTexture } from "@/lib/photos";
import { radialGlowTexture } from "./glowTextures";

interface PolaroidFrameProps {
  photo: PhotoConfig;
  index: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  focused?: boolean;
  onClick?: () => void;
}

/** One floating polaroid holding one of the five photographs. */
export function PolaroidFrame({
  photo,
  index,
  position,
  rotation = [0, 0, 0],
  focused = false,
  onClick,
}: PolaroidFrameProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const hoverScale = useRef(1);
  const phase = useRef(index * 1.37);

  const texture = useMemo(() => getPhotoTexture(photo.src), [photo.src]);
  const aspect = getPhotoAspect(photo.src);
  const photoW = 1.18;
  const H = Math.min(photoW / aspect, 1.5);
  const frameW = photoW + 0.16;
  const frameH = H + 0.16 + 0.24; // wider bottom margin, like a real polaroid

  const glowMap = useMemo(() => radialGlowTexture("#f5b8cf", 128), []);
  const glowRef = useRef<THREE.Sprite>(null);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    const targetHover = hovered.current || focused ? 1.05 : 1;
    hoverScale.current += (targetHover - hoverScale.current) * Math.min(1, dt * 6);

    const floatY = runtime.reducedMotion ? 0 : Math.sin(t * 0.55 + phase.current) * 0.09;
    g.position.set(position[0], position[1] + floatY, position[2]);
    g.scale.setScalar(hoverScale.current);

    // tilt gently toward the cursor
    const tilt = runtime.reducedMotion ? 0 : 1;
    const targetRotY = rotation[1] + state.pointer.x * 0.1 * tilt;
    const targetRotX = rotation[0] - state.pointer.y * 0.08 * tilt;
    g.rotation.y += (targetRotY - g.rotation.y) * Math.min(1, dt * 3);
    g.rotation.x += (targetRotX - g.rotation.x) * Math.min(1, dt * 3);
    g.rotation.z += (rotation[2] - g.rotation.z) * Math.min(1, dt * 3);

    if (glowRef.current) {
      const material = glowRef.current.material as THREE.SpriteMaterial;
      const target = hovered.current || focused ? 0.5 : 0.16;
      material.opacity += (target - material.opacity) * Math.min(1, dt * 5);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        hovered.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sprite ref={glowRef} position={[0, 0, -0.06]} scale={frameW * 2.6} raycast={() => null}>
        <spriteMaterial
          map={glowMap}
          color={new THREE.Color(experience.theme.blush)}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <RoundedBox args={[frameW, frameH, 0.05]} radius={0.03} smoothness={3}>
        <meshStandardMaterial color="#f6f1e6" roughness={0.65} metalness={0} />
      </RoundedBox>
      <mesh position={[0, 0.12, 0.028]}>
        <planeGeometry args={[photoW, H]} />
        <meshStandardMaterial map={texture} roughness={0.8} toneMapped={true} />
      </mesh>
    </group>
  );
}