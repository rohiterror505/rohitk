"use client";

import { useMemo } from "react";
import { useExperience } from "@/lib/store";
import { STATIONS } from "@/components/three/stations";
import { Starfield } from "@/components/three/Starfield";
import { CameraDirector } from "@/components/three/CameraDirector";
import { TravelStars } from "@/components/three/TravelStars";
import { PasskeyScene3D } from "@/components/scenes3d/PasskeyScene3D";
import { WelcomeScene3D } from "@/components/scenes3d/WelcomeScene3D";
import { GalleryScene3D } from "@/components/scenes3d/GalleryScene3D";
import { ConstellationScene3D } from "@/components/scenes3d/ConstellationScene3D";
import { GardenScene3D } from "@/components/scenes3d/GardenScene3D";
import { CakeScene3D } from "@/components/scenes3d/CakeScene3D";
import { LetterScene3D } from "@/components/scenes3d/LetterScene3D";
import { GiftScene3D } from "@/components/scenes3d/GiftScene3D";
import { FinaleScene3D } from "@/components/scenes3d/FinaleScene3D";

const SCENE_COMPONENTS = {
  passkey: PasskeyScene3D,
  welcome: WelcomeScene3D,
  gallery: GalleryScene3D,
  constellation: ConstellationScene3D,
  garden: GardenScene3D,
  cake: CakeScene3D,
  letter: LetterScene3D,
  gift: GiftScene3D,
  finale: FinaleScene3D,
} as const;

/** Renders the 3D content of the current scene (plus the one we are
    leaving, while the camera is still flying). */
function SceneContent() {
  const scene = useExperience((s) => s.scene);
  const transition = useExperience((s) => s.transition);

  const mounted = useMemo(() => {
    const set = new Set<string>([scene]);
    if (transition) {
      set.add(transition.from);
      set.add(transition.to);
    }
    return set;
  }, [scene, transition]);

  return (
    <>
      {(Object.keys(SCENE_COMPONENTS) as (keyof typeof SCENE_COMPONENTS)[]).map(
        (id) => {
          const Scene = SCENE_COMPONENTS[id];
          return mounted.has(id) ? (
            <group key={id} position={STATIONS[id]}>
              <Scene />
            </group>
          ) : null;
        }
      )}
    </>
  );
}

export { SceneContent, Starfield, CameraDirector, TravelStars };