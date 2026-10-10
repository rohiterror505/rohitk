"use client";

import * as THREE from "three";
import type { ExperienceState } from "@/lib/store";

/* Every scene lives at its own station in the world. The camera flies
   from station to station, which is what makes this feel like one
   continuous little universe. */

export const STATIONS: Record<string, [number, number, number]> = {
  passkey: [0, 0, 0],
  welcome: [0, 0, -42],
  gallery: [6, 0, -84],
  constellation: [-6, 0, -126],
  garden: [4, 0, -168],
  cake: [-4, 0, -210],
  letter: [3, 0, -252],
  gift: [-3, 0, -294],
  finale: [0, 0, -336],
};

/* Five floating polaroids, arranged in a gentle arc facing the camera. */
export const GALLERY_FRAMES: {
  pos: [number, number, number];
  rot: [number, number, number];
}[] = [
  { pos: [-4.3, 0.45, -0.6], rot: [0, 0.22, -0.05] },
  { pos: [-2.2, -0.35, 0.5], rot: [0, 0.1, 0.07] },
  { pos: [0, 0.3, 1.0], rot: [0, 0, -0.03] },
  { pos: [2.2, -0.3, 0.5], rot: [0, -0.1, 0.05] },
  { pos: [4.3, 0.5, -0.6], rot: [0, -0.22, 0.07] },
];

/* Five stars arranged like a little heart in the sky. */
export const CONSTELLATION_STARS: [number, number, number][] = [
  [-1.15, 0.95, 0], // left lobe
  [0, 0.5, 0], // dip
  [1.15, 0.95, 0], // right lobe
  [-0.6, -0.9, 0], // left point
  [0.6, -0.9, 0], // right point
];

export const CONSTELLATION_LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [2, 4],
  [3, 4],
  [3, 1],
  [1, 4],
];

export interface CameraView {
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

function view(
  station: [number, number, number],
  posOff: [number, number, number],
  lookOff: [number, number, number]
): CameraView {
  return {
    pos: new THREE.Vector3(
      station[0] + posOff[0],
      station[1] + posOff[1],
      station[2] + posOff[2]
    ),
    look: new THREE.Vector3(
      station[0] + lookOff[0],
      station[1] + lookOff[1],
      station[2] + lookOff[2]
    ),
  };
}

/** Where the camera rests for a given state (with a few loving exceptions). */
export function getIdleView(s: ExperienceState, sceneTime = 0): CameraView {
  const st = STATIONS[s.scene] as [number, number, number];
  switch (s.scene) {
    case "passkey": {
      // a very slow, cinematic drift toward the heart
      const push = Math.min(sceneTime / 70, 1);
      return view(st, [0, 0.55, 9.6 - push * 1.8], [0, 0.15, 0]);
    }
    case "welcome":
      return view(st, [0, 0.35, 9.2], [0, 0.5, 0]);
    case "gallery": {
      if (s.galleryFocus !== null) {
        const f = GALLERY_FRAMES[s.galleryFocus];
        return view(
          st,
          [f.pos[0] + 0.08, f.pos[1] + 0.1, f.pos[2] + 2.45],
          [f.pos[0], f.pos[1], f.pos[2] + 0.3]
        );
      }
      return view(st, [0, 0.5, 9.0], [0, 0.1, 0]);
    }
    case "constellation":
      if (s.constellationFocus !== null) return view(st, [0, 0.1, 7.0], [0, 0.1, 0]);
      return view(st, [0, 0.25, 8.8], [0, 0.1, 0]);
    case "garden":
      return view(st, [0, 0.7, 9.2], [0, 0.1, 0]);
    case "cake":
      if (s.cakeStage !== "idle") return view(st, [0, 0.85, 6.9], [0, 0.85, 0]);
      return view(st, [0, 0.6, 8.2], [0, 0.7, 0]);
    case "letter":
      if (s.letterOpened) return view(st, [0, 0.35, 6.6], [0, 0.15, 0]);
      return view(st, [0, 0.45, 8.4], [0, 0.1, 0]);
    case "gift":
      if (s.giftOpened) return view(st, [0, 0.9, 11.4], [0, 0.35, 0]);
      return view(st, [0, 0.5, 8.0], [0, 0.2, 0]);
    case "finale":
      return view(st, [0, 0.7, 11.2], [0, 0.3, 0]);
    default:
      return view(st, [0, 0.6, 8.8], [0, 0.2, 0]);
  }
}

/** Fades in and out while the camera flies — the star-travel envelope. */
export const travelEnvelope = { value: 0 };