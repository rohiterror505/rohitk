"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { openLetter, useExperience } from "@/lib/store";
import { audio } from "@/lib/audio";
import { EnvelopeMesh } from "@/components/three/EnvelopeMesh";
import { CloudDisc, DriftingMotes } from "@/components/three/CloudDisc";

/** The letter scene: cool night light that turns warm and golden as
    the envelope opens. */
export function LetterScene3D() {
  const opened = useExperience((s) => s.letterOpened);
  const keyRef = useRef<THREE.PointLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    // warm golden light rises, cool light softens
    if (keyRef.current) {
      const target = opened ? 3.2 : 0.25;
      keyRef.current.intensity +=
        (target - keyRef.current.intensity) * Math.min(1, dt * 1.4);
      keyRef.current.color.lerp(
        new THREE.Color(opened ? "#ffd9a0" : "#a9c7f2"),
        Math.min(1, dt * 1.2)
      );
      if (!opened) keyRef.current.position.x = Math.sin(t * 0.5) * 0.6;
    }
    if (fillRef.current) {
      const target = opened ? 1.4 : 0.5;
      fillRef.current.intensity +=
        (target - fillRef.current.intensity) * Math.min(1, dt * 1.2);
    }
  });

  return (
    <group>
      <CloudDisc radius={5.4} y={-2.2} opacity={0.34} />
      <DriftingMotes count={44} radius={6} />

      {/* lights for this scene */}
      <pointLight ref={keyRef} position={[0, 1.6, 1.8]} intensity={0.25} distance={16} color="#a9c7f2" />
      <pointLight ref={fillRef} position={[-2.2, -0.5, 2.4]} intensity={0.5} distance={18} color="#c9a7eb" />

      <group position={[0, 0.25, 0]} scale={1.15}>
        <EnvelopeMesh
          opened={opened}
          onOpen={() => {
            if (!opened) {
              openLetter();
              audio.playSfx("paper");
            }
          }}
        />
      </group>

      {/* slow floating stars fill the sky when the letter is open */}
      {opened && (
        <Sparkles count={120} scale={[16, 10, 10]} position={[0, 1, -3]} size={2.4} speed={0.25} color="#ffe9c9" />
      )}
    </group>
  );
}