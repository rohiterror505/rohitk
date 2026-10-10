"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { travelEnvelope } from "./stations";

/** A rush of stars streaming past the camera while it flies between
    scenes. Lives in camera space, only visible during a transition. */
export function TravelStars() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const count = runtime.highQuality ? 420 : 200;
  const speed = useRef(new Float32Array(count));

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.4 + Math.random() * 9;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = -2 - Math.random() * 34;
      speed.current[i] = 9 + Math.random() * 14;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count]);

  const material = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 48;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.5, "rgba(255,255,255,0.25)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 48, 48);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return new THREE.PointsMaterial({
      map,
      size: 0.34,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color("#e9e2ff"),
      sizeAttenuation: true,
    });
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    camera.add(group);
    return () => {
      camera.remove(group);
    };
  }, [camera]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const env = travelEnvelope.value;
    material.opacity = env * 0.85;
    if (env <= 0.001) return;

    const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = positions.array as Float32Array;
    const count2 = positions.count;
    for (let i = 0; i < count2; i++) {
      const z = i * 3 + 2;
      array[z] += speed.current[i] * dt * (0.6 + env * 0.8);
      if (array[z] > 1.5) {
        array[z] = -34 - Math.random() * 6;
      }
    }
    positions.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}