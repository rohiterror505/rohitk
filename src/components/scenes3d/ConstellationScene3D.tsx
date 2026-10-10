"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import { runtime } from "@/lib/runtime";
import { experience } from "@/config/experience";
import { focusConstellationStar, useExperience } from "@/lib/store";
import { audio } from "@/lib/audio";
import {
  CONSTELLATION_LINES,
  CONSTELLATION_STARS,
} from "@/components/three/stations";
import { StarMesh } from "@/components/three/FlowerStarMeshes";
import { radialGlowTexture } from "@/components/three/glowTextures";

function ConstellationStar({
  index,
  focused,
}: {
  index: number;
  focused: boolean;
}) {
  const position = CONSTELLATION_STARS[index];
  const glowRef = useRef<THREE.Sprite>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const glowMap = useMemo(() => radialGlowTexture("#ffd9a0", 128), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.SpriteMaterial;
      const targetOpacity = focused ? 1.0 : 0.55;
      material.opacity += (targetOpacity - material.opacity) * 0.06;
      const targetScale = focused
        ? 2.6
        : 1.1 + (runtime.reducedMotion ? 0 : 0.14 * Math.sin(t * 1.4 + index));
      const s = THREE.MathUtils.lerp(glowRef.current.scale.x, targetScale, 0.06);
      glowRef.current.scale.setScalar(s);
    }
    if (orbRef.current) {
      const target = focused ? 1 : 0.001;
      const s = THREE.MathUtils.lerp(orbRef.current.scale.x, target, 0.07);
      orbRef.current.scale.setScalar(s);
      if (!runtime.reducedMotion) orbRef.current.rotation.z = t * 0.4;
    }
  });

  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        focusConstellationStar(index);
        audio.playSfx("chime");
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <StarMesh
        color={experience.theme.gold}
        scale={0.16 + (index % 2) * 0.03}
        spin={!focused}
      />
      <sprite ref={glowRef} scale={1.1} raycast={() => null}>
        <spriteMaterial
          map={glowMap}
          color={new THREE.Color("#ffe2b8")}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* the orb a star becomes when she touches it */}
      <mesh ref={orbRef} scale={0.001}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial
          color={new THREE.Color("#f5b8cf")}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Sparkles
        count={focused ? 40 : 10}
        scale={focused ? 2.4 : 1.1}
        size={focused ? 4 : 2.2}
        speed={0.3}
        color="#ffe2b8"
      />
    </group>
  );
}

/** The memory constellation: five stars, each holding one photograph. */
export function ConstellationScene3D() {
  const focus = useExperience((s) => s.constellationFocus);

  return (
    <group>
      {CONSTELLATION_STARS.map((pos, i) => (
        <ConstellationStar key={i} index={i} focused={focus === i} />
      ))}

      {CONSTELLATION_LINES.map(([a, b], i) => (
        <Line
          key={i}
          points={[CONSTELLATION_STARS[a], CONSTELLATION_STARS[b]]}
          color="#c9a7eb"
          lineWidth={1}
          transparent
          opacity={focus === a || focus === b ? 0.7 : 0.35}
        />
      ))}
    </group>
  );
}