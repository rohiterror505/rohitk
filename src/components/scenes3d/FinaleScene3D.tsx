"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { experience } from "@/config/experience";
import { getPhotoAspect, getPhotoTexture } from "@/lib/photos";
import { GlassHeart } from "@/components/three/GlassHeart";
import { CloudDisc, DriftingMotes } from "@/components/three/CloudDisc";
import { FloatingHearts } from "@/components/three/FloatingHearts";
import { Butterflies } from "@/components/three/ButterflyMesh";

/** One photograph orbiting the glowing heart. */
function OrbitingPhoto({ index }: { index: number }) {
  const src = experience.photos[index].src;
  const texture = useMemo(() => getPhotoTexture(src), [src]);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const appear = useRef(0);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    appear.current = Math.min(1, appear.current + delta * 0.5);
    const t = state.clock.elapsedTime;
    const a = (index / 5) * Math.PI * 2 + t * 0.07;
    const radius = 4.4;
    mesh.position.set(
      Math.cos(a) * radius,
      Math.sin(t * 0.4 + index * 1.3) * 0.45,
      Math.sin(a) * radius
    );
    mesh.lookAt(camera.position);
    const s = appear.current * (0.98 + 0.02 * Math.sin(t * 0.6 + index));
    mesh.scale.setScalar(s);
    (mesh.material as THREE.MeshStandardMaterial).opacity = appear.current;
  });

  return (
    <mesh ref={meshRef} scale={0.001}>
      <planeGeometry args={[1.42, 1.42 / getPhotoAspect(src)]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0}
        emissive={new THREE.Color("#2a2168")}
        emissiveIntensity={0.2}
        roughness={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** The final scene: all five photographs around one glowing heart. */
export function FinaleScene3D() {
  return (
    <group>
      <CloudDisc radius={7.4} y={-3.1} opacity={0.36} />
      <DriftingMotes count={56} radius={8} />
      <FloatingHearts count={26} area={[15, 8, 12]} center={[0, 0.5, 0]} />
      <Butterflies count={4} center={[0, 0.4, 2.5]} radius={4.6} scale={0.5} />

      <GlassHeart scale={1.35} glowScale={5.4} lightIntensity={3.2} />

      <Sparkles count={110} scale={[17, 11, 12]} position={[0, 0.8, -2]} size={2.2} speed={0.22} color="#f5d7e6" />

      <OrbitingPhoto index={0} />
      <OrbitingPhoto index={1} />
      <OrbitingPhoto index={2} />
      <OrbitingPhoto index={3} />
      <OrbitingPhoto index={4} />
    </group>
  );
}