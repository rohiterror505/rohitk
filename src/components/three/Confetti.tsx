"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { runtime } from "@/lib/runtime";
import { sparkleTexture } from "./glowTextures";

const CONFETTI_COLORS = ["#f5b8cf", "#c9a7eb", "#a9c7f2", "#ecd9a0", "#f7efe2"];

/** A one-shot burst of pastel confetti. Change `burstKey` to fire again. */
export function Confetti({ burstKey }: { burstKey: number }) {
  const count = runtime.highQuality ? 150 : 70;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const state = useRef({
    active: false,
    age: 0,
    positions: [] as THREE.Vector3[],
    velocities: [] as THREE.Vector3[],
    rotations: [] as THREE.Euler[],
    spins: [] as THREE.Vector3[],
  });
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.09, 0.14);
    // white per-vertex colors, combined with per-instance colors
    const whites = new Float32Array(g.attributes.position.count * 3).fill(1);
    g.setAttribute("color", new THREE.BufferAttribute(whites, 3));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        vertexColors: true,
      }),
    []
  );

  const instanceColors = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const color = new THREE.Color(CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
      array[i * 3] = color.r;
      array[i * 3 + 1] = color.g;
      array[i * 3 + 2] = color.b;
    }
    return array;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMemo(() => {
    // reset whenever the key changes
    const s = state.current;
    s.active = true;
    s.age = 0;
    s.positions = [];
    s.velocities = [];
    s.rotations = [];
    s.spins = [];
    for (let i = 0; i < count; i++) {
      s.positions.push(new THREE.Vector3(0, 0.4, 0));
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.6 + Math.random() * 3.2;
      s.velocities.push(
        new THREE.Vector3(
          Math.cos(angle) * speed * 0.7,
          2.2 + Math.random() * 3.4,
          Math.sin(angle) * speed * 0.7
        )
      );
      s.rotations.push(
        new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
      );
      s.spins.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burstKey, count]);

  useFrame((_, delta) => {
    const s = state.current;
    const mesh = meshRef.current;
    if (!mesh || !s.active) return;
    const dt = Math.min(delta, 0.05);
    s.age += dt;
    const life = 3.4;
    const fade = Math.max(0, 1 - s.age / life);

    for (let i = 0; i < count; i++) {
      const p = s.positions[i];
      const v = s.velocities[i];
      v.y -= 2.4 * dt;
      v.multiplyScalar(1 - 0.35 * dt);
      p.addScaledVector(v, dt);
      const r = s.rotations[i];
      r.x += s.spins[i].x * dt;
      r.y += s.spins[i].y * dt;
      r.z += s.spins[i].z * dt;
      dummy.position.copy(p);
      dummy.rotation.copy(r);
      dummy.scale.setScalar(Math.max(0.001, fade));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.visible = true;
    if (s.age > life) {
      s.active = false;
      mesh.visible = false;
    }
  });

  return (
    <instancedMesh
      key={burstKey}
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    >
      <instancedBufferAttribute attach="instanceColor" args={[instanceColors, 3]} />
    </instancedMesh>
  );
}

/** A one-shot burst of glowing stars. Change `burstKey` to fire again. */
export function StarBurst({
  burstKey,
  color = "#ecd9a0",
  count,
}: {
  burstKey: number;
  color?: string;
  count?: number;
}) {
  const n = count ?? (runtime.highQuality ? 220 : 110);
  const map = useMemo(() => sparkleTexture(color), [color]);
  const state = useRef({ active: false, age: 0 });
  const positions = useMemo(() => new Float32Array(n * 3), [n]);
  const velocities = useMemo(
    () =>
      Array.from({ length: n }, () => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 2.2 + Math.random() * 4.5;
        return new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed + 1.2,
          Math.cos(phi) * speed
        );
      }),
    [n]
  );

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        map,
        size: 0.42,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color(color),
        sizeAttenuation: true,
      }),
    [map, color]
  );

  useMemo(() => {
    state.current.active = true;
    state.current.age = 0;
    for (let i = 0; i < n; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    geometry.getAttribute("position").needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burstKey, n]);

  useFrame((_, delta) => {
    const s = state.current;
    if (!s.active) return;
    const dt = Math.min(delta, 0.05);
    s.age += dt;
    const life = 3.2;
    const fade = Math.max(0, 1 - s.age / life);
    material.opacity = Math.min(1, fade * 1.6);
    for (let i = 0; i < n; i++) {
      const v = velocities[i];
      v.multiplyScalar(1 - 1.6 * dt);
      positions[i * 3] += v.x * dt;
      positions[i * 3 + 1] += v.y * dt;
      positions[i * 3 + 2] += v.z * dt;
    }
    (geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    if (s.age > life) {
      s.active = false;
      material.opacity = 0;
    }
  });

  return <points key={burstKey} geometry={geometry} material={material} frustumCulled={false} />;
}