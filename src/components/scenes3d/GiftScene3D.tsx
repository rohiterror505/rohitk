"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { openGift, useExperience } from "@/lib/store";
import { audio } from "@/lib/audio";
import { experience } from "@/config/experience";
import { getPhotoAspect, getPhotoTexture } from "@/lib/photos";
import { GiftBoxMesh } from "@/components/three/GiftBoxMesh";
import { CloudDisc, DriftingMotes } from "@/components/three/CloudDisc";
import { StarBurst } from "@/components/three/Confetti";

/** One photo in the final collage. */
function CollagePhoto({ index }: { index: number }) {
  const src = experience.photos[index].src;
  const texture = useMemo(() => getPhotoTexture(src), [src]);
  const meshRef = useRef<THREE.Mesh>(null);
  const target = useMemo(
    () => ({
      angle: (index / 5) * Math.PI * 2 - Math.PI / 2,
      radius: 2.5,
      y: Math.sin(index * 1.7) * 0.55,
    }),
    [index]
  );
  const appear = useRef(0);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    appear.current = Math.min(1, appear.current + delta * 0.7);
    const t = state.clock.elapsedTime;
    const a = target.angle + Math.sin(t * 0.25) * 0.12;
    mesh.position.set(
      Math.cos(a) * target.radius,
      target.y + Math.sin(t * 0.5 + index) * 0.08,
      Math.sin(a) * target.radius
    );
    mesh.lookAt(0, 0.2, 8);
    const s = appear.current * (0.98 + 0.02 * Math.sin(t * 0.8 + index));
    mesh.scale.setScalar(s);
    (mesh.material as THREE.MeshStandardMaterial).opacity = appear.current;
  });

  return (
    <mesh ref={meshRef} scale={0.001}>
      <planeGeometry args={[1.5, 1.5 / getPhotoAspect(src)]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0}
        emissive={new THREE.Color("#2a2168")}
        emissiveIntensity={0.18}
        roughness={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** The final gift, and the collage of all five photographs. */
export function GiftScene3D() {
  const opened = useExperience((s) => s.giftOpened);
  const burstKey = useRef(0);

  return (
    <group>
      <CloudDisc radius={5.6} y={-2.3} opacity={0.38} />
      <DriftingMotes count={44} radius={6.5} />

      <group
        scale={1.15}
        onClick={(event) => {
          event.stopPropagation();
          if (!opened) {
            openGift();
            burstKey.current += 1;
            audio.playSfx("sparkle");
          }
        }}
        onPointerOver={() => {
          if (!opened) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <GiftBoxMesh open01={opened ? 1 : 0} />
      </group>

      {opened && (
        <group position={[0, 0.9, 0]}>
          <CollagePhoto index={0} />
          <CollagePhoto index={1} />
          <CollagePhoto index={2} />
          <CollagePhoto index={3} />
          <CollagePhoto index={4} />
        </group>
      )}

      {opened && (
        <group position={[0, 0.6, 0]}>
          <StarBurst burstKey={opened ? 1 : 0} color="#ffe2b8" count={240} />
        </group>
      )}
    </group>
  );
}