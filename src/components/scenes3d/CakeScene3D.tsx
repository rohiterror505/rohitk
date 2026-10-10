"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "@/lib/store";
import { audio } from "@/lib/audio";
import { CakeMesh } from "@/components/three/CakeMesh";
import { CloudDisc, DriftingMotes } from "@/components/three/CloudDisc";
import { FloatingHearts } from "@/components/three/FloatingHearts";
import { Confetti, StarBurst } from "@/components/three/Confetti";

/** The birthday cake, floating on a little cloud. */
export function CakeScene3D() {
  const stage = useExperience((s) => s.cakeStage);
  const [burstKey, setBurstKey] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const lightRef = useRef<THREE.AmbientLight>(null);

  // when the candles go out, celebrate
  useEffect(() => {
    if (stage === "blown") {
      setBurstKey((k) => k + 1);
      audio.playSfx("whoosh");
      window.setTimeout(() => audio.playSfx("sparkle"), 700);
      window.setTimeout(() => audio.playSfx("pop"), 1100);
    }
    if (stage === "wished") {
      audio.playSfx("wish");
    }
  }, [stage]);

  // the sky dims a little while she makes her wish
  useFrame((_, delta) => {
    if (!lightRef.current) return;
    const target = stage === "idle" ? 0.55 : 0.32;
    lightRef.current.intensity +=
      (target - lightRef.current.intensity) * Math.min(1, delta * 2);
  });

  return (
    <group>
      <ambientLight ref={lightRef} intensity={0.55} color="#8a7fd0" />
      <CloudDisc radius={5.2} y={-2.1} opacity={0.4} />
      <DriftingMotes count={40} radius={6} />
      <FloatingHearts count={14} area={[11, 6, 7]} center={[0, 0.6, 0]} />

      <group position={[0, -0.55, 0]} scale={1.25}>
        <CakeMesh
          stage={stage}
          sparkleKey={sparkleKey}
          onClick={() => {
            setSparkleKey((k) => k + 1);
            audio.playSfx("pop");
          }}
        />
      </group>

      <group position={[0, 0.6, 0]}>
        <Confetti burstKey={burstKey} />
        <StarBurst burstKey={burstKey} color="#ffe2b8" count={160} />
      </group>
    </group>
  );
}