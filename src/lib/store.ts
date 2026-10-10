"use client";

import { useSyncExternalStore } from "react";
import { runtime } from "@/lib/runtime";

/* ─────────────────────────────────────────────────────────────────────────
   A tiny external store shared by the DOM overlays and the 3D world.
   Selectors must return primitives or stable references (like the state
   objects themselves) so useSyncExternalStore stays happy.
   ───────────────────────────────────────────────────────────────────────── */

export type SceneId =
  | "passkey"
  | "welcome"
  | "gallery"
  | "constellation"
  | "garden"
  | "cake"
  | "letter"
  | "gift"
  | "finale";

export const SCENE_ORDER: SceneId[] = [
  "passkey",
  "welcome",
  "gallery",
  "constellation",
  "garden",
  "cake",
  "letter",
  "gift",
  "finale",
];

export type GardenObjectId = "heart" | "flower" | "star" | "butterfly" | "gift";
export const GARDEN_OBJECTS: GardenObjectId[] = [
  "heart",
  "flower",
  "star",
  "butterfly",
  "gift",
];

export type TransitionEffect = "portal" | "stars";

export interface Transition {
  from: SceneId;
  to: SceneId;
  key: number;
  /** duration of the camera flight in ms */
  duration: number;
  effect: TransitionEffect;
}

export type CakeStage = "idle" | "wished" | "blown";

export interface ExperienceState {
  scene: SceneId;
  transition: Transition | null;
  /** passkey accepted */
  unlocked: boolean;
  /** scenes she has already reached (for the little navigation dots) */
  visited: SceneId[];
  gardenFound: Record<GardenObjectId, boolean>;
  /** which garden message card is open right now */
  gardenOpen: GardenObjectId | null;
  /** open photo index in the gallery lightbox */
  galleryFocus: number | null;
  /** open star index in the constellation */
  constellationFocus: number | null;
  cakeStage: CakeStage;
  letterOpened: boolean;
  giftOpened: boolean;
  finaleAllShown: boolean;
}

function emptyGardenFound(): Record<GardenObjectId, boolean> {
  return { heart: false, flower: false, star: false, butterfly: false, gift: false };
}

const initialState: ExperienceState = {
  scene: "passkey",
  transition: null,
  unlocked: false,
  visited: ["passkey"],
  gardenFound: emptyGardenFound(),
  gardenOpen: null,
  galleryFocus: null,
  constellationFocus: null,
  cakeStage: "idle",
  letterOpened: false,
  giftOpened: false,
  finaleAllShown: false,
};

let state: ExperienceState = initialState;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const store = {
  getState: (): ExperienceState => state,
  setState(
    patch: Partial<ExperienceState> | ((s: ExperienceState) => Partial<ExperienceState>)
  ) {
    const p = typeof patch === "function" ? patch(state) : patch;
    state = { ...state, ...p };
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useExperience<T>(selector: (s: ExperienceState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(initialState)
  );
}

/* ───────────────────────────── actions ───────────────────────────── */

let transitionKey = 0;

function flightDuration(effect: TransitionEffect, from: SceneId, to: SceneId): number {
  const distance = Math.abs(SCENE_ORDER.indexOf(to) - SCENE_ORDER.indexOf(from));
  const base = effect === "portal" ? 3400 : 2600 + distance * 160;
  return Math.min(4400, base);
}

export function goTo(
  to: SceneId,
  effect: TransitionEffect = "stars",
  durationOverride?: number
) {
  const s = store.getState();
  if (s.transition) return; // never interrupt a flight mid-air
  if (s.scene === to) return;
  if (to !== "passkey" && !s.unlocked) return; // the little gate stays closed

  const duration =
    durationOverride ?? (runtime.reducedMotion ? 300 : flightDuration(effect, s.scene, to));

  const visited = s.visited.includes(to) ? s.visited : [...s.visited, to];

  store.setState({
    scene: to,
    visited,
    transition: {
      from: s.scene,
      to,
      key: ++transitionKey,
      duration,
      effect,
    },
    // leaving a scene closes its ephemeral states
    gardenOpen: to === "garden" ? s.gardenOpen : null,
    galleryFocus: to === "gallery" ? s.galleryFocus : null,
    constellationFocus: to === "constellation" ? s.constellationFocus : null,
  });
}

export function completeTransition() {
  const s = store.getState();
  if (s.transition && s.scene === s.transition.to) {
    store.setState({ transition: null });
  } else if (s.transition) {
    // the transition was superseded (e.g. replay) — follow the scene
    store.setState({ transition: null });
  }
}

export function unlock() {
  store.setState({ unlocked: true });
}

export function nextScene(effect: TransitionEffect = "stars") {
  const s = store.getState();
  const i = SCENE_ORDER.indexOf(s.scene);
  if (i >= 0 && i < SCENE_ORDER.length - 1) {
    goTo(SCENE_ORDER[i + 1], effect);
  }
}

export function openGalleryPhoto(index: number | null) {
  store.setState({ galleryFocus: index });
}

export function focusConstellationStar(index: number | null) {
  store.setState({ constellationFocus: index });
}

export function discoverGardenObject(id: GardenObjectId) {
  store.setState((s) => ({
    gardenFound: { ...s.gardenFound, [id]: true },
    gardenOpen: id,
  }));
}

export function closeGardenMessage() {
  store.setState({ gardenOpen: null });
}

export function gardenFoundCount(s: ExperienceState): number {
  return GARDEN_OBJECTS.reduce((acc, id) => acc + (s.gardenFound[id] ? 1 : 0), 0);
}

export function setCakeStage(stage: CakeStage) {
  store.setState({ cakeStage: stage });
}

export function openLetter() {
  store.setState({ letterOpened: true });
}

export function openGift() {
  store.setState({ giftOpened: true });
}

export function markFinaleShown() {
  store.setState({ finaleAllShown: true });
}

/** Full reset, then a slow flight back to the beginning of the story. */
export function replay() {
  const s = store.getState();
  if (s.transition) return;
  store.setState({
    gardenFound: emptyGardenFound(),
    gardenOpen: null,
    galleryFocus: null,
    constellationFocus: null,
    cakeStage: "idle",
    letterOpened: false,
    giftOpened: false,
    finaleAllShown: false,
  });
  goTo("welcome", "portal", 4200);
}