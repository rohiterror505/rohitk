"use client";

import { useEffect, useState } from "react";
import { experience } from "@/config/experience";
import { hasWebGL } from "@/lib/webgl";
import { initRuntime } from "@/lib/runtime";
import { preloadPhotos } from "@/lib/photos";
import LoadingScreen from "@/components/LoadingScreen";
import { ExperienceCanvas } from "@/components/ExperienceCanvas";
import { SceneOverlay } from "@/components/SceneOverlay";
import { ExperienceNavigation } from "@/components/ExperienceNavigation";
import { MusicController } from "@/components/MusicController";
import FallbackExperience from "@/components/FallbackExperience";

export default function ExperienceRoot() {
  const [checked, setChecked] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    initRuntime();
    setWebgl(hasWebGL());
    setChecked(true);
    if (hasWebGL()) {
      preloadPhotos(
        experience.photos.map((p) => p.src),
        (loaded, total) => setProgress(loaded / total)
      ).then(() => setReady(true));
    }
  }, []);

  if (!checked) return <LoadingScreen label="Wishing upon a star…" />;

  if (!webgl) return <FallbackExperience />;

  if (!ready) {
    return (
      <LoadingScreen
        label={
          progress > 0 && progress < 1
            ? `Gathering five little memories… ${Math.round(progress * 100)}%`
            : "Gathering five little memories…"
        }
      />
    );
  }

  return (
    <main className="fixed inset-0 overflow-hidden" aria-label="A little universe for Manvi">
      <ExperienceCanvas />
      <SceneOverlay />
      <ExperienceNavigation />
      <MusicController />
    </main>
  );
}