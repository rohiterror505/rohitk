"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  completeTransition,
  store,
  useExperience,
  type Transition,
} from "@/lib/store";
import { runtime } from "@/lib/runtime";
import { getIdleView, STATIONS, travelEnvelope } from "./stations";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const tmpPos = new THREE.Vector3();

interface Flight {
  spec: Transition;
  t: number;
  fromPos: THREE.Vector3;
  fromLook: THREE.Vector3;
  control: THREE.Vector3;
  toPos: THREE.Vector3;
  toLook: THREE.Vector3;
}

/** The cinematic camera. It rests at each station, drifts with the
    cursor, and flies gently between stations — through the portal heart,
    or through fields of stars. */
export function CameraDirector() {
  const transition = useExperience((s) => s.transition);
  const camera = useThree((s) => s.camera);
  const flight = useRef<Flight | null>(null);
  const look = useRef(new THREE.Vector3(0, 0.15, 0));
  const sceneTime = useRef(0);
  const flightKeyRef = useRef(-1);

  useEffect(() => {
    const idle = getIdleView(store.getState());
    camera.position.copy(idle.pos);
    look.current.copy(idle.look);
    camera.lookAt(look.current);
  }, [camera]);

  useEffect(() => {
    if (!transition || flightKeyRef.current === transition.key) return;
    flightKeyRef.current = transition.key;
    const to = getIdleView({ ...store.getState(), scene: transition.to });
    const fromPos = camera.position.clone();
    const fromLook = look.current.clone();

    let control = fromPos.clone().lerp(to.pos, 0.5);
    control.y += 1.7;
    if (transition.effect === "portal") {
      // dive straight through the glowing heart
      const heart = STATIONS.passkey;
      control = new THREE.Vector3(heart[0], heart[1] + 0.08, heart[2] - 1.2);
    }

    flight.current = {
      spec: transition,
      t: 0,
      fromPos,
      fromLook,
      control,
      toPos: to.pos,
      toLook: to.look,
    };
    sceneTime.current = 0;
  }, [transition, camera]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = store.getState();

    if (s.transition && flight.current) {
      const f = flight.current;
      f.t = Math.min(1, f.t + (dt * 1000) / f.spec.duration);
      const e = easeInOutCubic(f.t);

      // quadratic bezier through the control point
      const it = 1 - e;
      tmpPos.set(0, 0, 0)
        .addScaledVector(f.fromPos, it * it)
        .addScaledVector(f.control, 2 * it * e)
        .addScaledVector(f.toPos, e * e);
      camera.position.copy(tmpPos);
      look.current.lerpVectors(f.fromLook, f.toLook, e);
      camera.lookAt(look.current);

      // the star-travel envelope: rise quickly, hold, fall away
      travelEnvelope.value = Math.sin(Math.min(1, f.t) * Math.PI);
      if (f.t >= 1) {
        flight.current = null;
        travelEnvelope.value = 0;
        completeTransition();
      }
    } else if (!s.transition) {
      sceneTime.current += dt;
      const idle = getIdleView(s, sceneTime.current);

      const target = tmpPos.copy(idle.pos);
      if (!runtime.reducedMotion) {
        const px = state.pointer.x;
        const py = state.pointer.y;
        target.x += px * 0.38;
        target.y += py * 0.22;
        target.y += Math.sin(sceneTime.current * 0.4) * 0.07;
        target.x += Math.sin(sceneTime.current * 0.27) * 0.05;
      }

      const smoothing = 1 - Math.pow(0.002, dt);
      camera.position.lerp(target, smoothing);
      look.current.lerp(idle.look, smoothing);
      camera.lookAt(look.current);
    }
  });

  return null;
}