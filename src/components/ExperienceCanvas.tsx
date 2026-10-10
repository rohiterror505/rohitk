"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { runtime } from "@/lib/runtime";
import {
  SceneContent,
  Starfield,
  CameraDirector,
  TravelStars,
} from "@/components/scenes3d/SceneContent";

/** The one persistent WebGL canvas — the entire little universe. */
export function ExperienceCanvas() {
  return (
    <Canvas
      className="fixed inset-0"
      dpr={runtime.highQuality ? [1, 2] : 1}
      camera={{ fov: 46, near: 0.1, far: 200, position: [0, 0.55, 9.6] }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Suspense fallback={null}>
        <Starfield />
        <CameraDirector />
        <TravelStars />
        <SceneContent />

        {runtime.highQuality && (
          <EffectComposer enableNormalPass={false}>
            <Bloom
              intensity={0.6}
              luminanceThreshold={0.26}
              luminanceSmoothing={0.5}
              mipmapBlur
              radius={0.72}
            />
            <Vignette eskil={false} offset={0.16} darkness={0.68} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}