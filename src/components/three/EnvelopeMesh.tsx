"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { runtime } from "@/lib/runtime";
import { createHeartGeometry } from "./heartGeometry";
import { StarBurst } from "./Confetti";

interface EnvelopeMeshProps {
  opened: boolean;
  onOpen: () => void;
}

/** A floating cream envelope with a wax-sealed heart. */
export function EnvelopeMesh({ opened, onOpen }: EnvelopeMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flapRef = useRef<THREE.Group>(null);
  const paperRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const open01 = useRef(0);
  const clock = useRef(0);
  const burstKey = useRef(0);

  const flapGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.95, 0);
    shape.lineTo(0.95, 0);
    shape.lineTo(0.13, -1.0);
    shape.lineTo(-0.13, -1.0);
    shape.closePath();
    return new THREE.ShapeGeometry(shape, 16);
  }, []);
  const sealGeometry = useMemo(() => createHeartGeometry(0.4, 0.09), []);

  useEffect(() => {
    if (opened && open01.current < 0.05) {
      burstKey.current += 1;
    }
  }, [opened]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    clock.current += dt;
    const t = clock.current;

    open01.current += ((opened ? 1 : 0) - open01.current) * Math.min(1, dt * 1.8);
    const o = open01.current;

    if (groupRef.current) {
      const bob = runtime.reducedMotion ? 0 : Math.sin(t * 0.8) * 0.05;
      groupRef.current.position.y = bob;
      // the envelope turns to face her as it opens
      const targetRotY = 0.35 * (1 - o);
      groupRef.current.rotation.y +=
        (targetRotY - groupRef.current.rotation.y) * Math.min(1, dt * 2);
    }
    if (flapRef.current) {
      const target = o > 0.02 ? -2.6 : 0;
      flapRef.current.rotation.x += (target - flapRef.current.rotation.x) * Math.min(1, dt * 2.2);
    }
    if (paperRef.current) {
      paperRef.current.position.y = o * 0.85;
      paperRef.current.rotation.z = Math.sin(t * 0.6) * 0.01 * o;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.4 + o * 2.6;
    }
  });

  return (
    <group>
      <group
        ref={groupRef}
        rotation={[0, 0.35, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {/* envelope body */}
        <RoundedBox args={[1.9, 1.2, 0.08]} radius={0.035} smoothness={3}>
          <meshStandardMaterial color="#f3ead6" roughness={0.55} />
        </RoundedBox>

        {/* the letter inside, rising as it opens */}
        <mesh ref={paperRef} position={[0, 0, 0.05]}>
          <planeGeometry args={[1.7, 1.05]} />
          <meshStandardMaterial color="#fbf6ea" roughness={0.7} />
        </mesh>

        {/* the flap, hinged at the top edge */}
        <group ref={flapRef} position={[0, 0.6, 0.045]}>
          <mesh geometry={flapGeometry}>
            <meshStandardMaterial
              color="#eee2c8"
              roughness={0.55}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* wax seal with a little heart */}
          <group position={[0, -0.82, 0.02]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.035, 24]} />
              <meshStandardMaterial
                color="#d76f93"
                roughness={0.3}
                emissive={new THREE.Color("#d76f93")}
                emissiveIntensity={0.25}
              />
            </mesh>
            <mesh geometry={sealGeometry} position={[0, 0, 0.026]} scale={0.55}>
              <meshStandardMaterial
                color="#e78aa8"
                roughness={0.3}
                emissive={new THREE.Color("#e78aa8")}
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* a warm golden glow that grows as the letter opens */}
      <pointLight ref={lightRef} position={[0, 0.9, 1.6]} color="#ffd9a0" intensity={0.4} distance={12} />
      <StarBurst burstKey={burstKey.current} color="#f5b8cf" count={90} />
    </group>
  );
}