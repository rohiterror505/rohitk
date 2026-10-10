"use client";

import { AnimatePresence, motion } from "framer-motion";
import { experience } from "@/config/experience";
import { useExperience } from "@/lib/store";
import type { SceneId } from "@/lib/store";
import { PasskeyOverlay } from "@/components/overlays/PasskeyOverlay";
import { WelcomeOverlay } from "@/components/overlays/WelcomeOverlay";
import { GalleryOverlay } from "@/components/overlays/GalleryOverlay";
import { ConstellationOverlay } from "@/components/overlays/ConstellationOverlay";
import { GardenOverlay } from "@/components/overlays/GardenOverlay";
import { CakeOverlay } from "@/components/overlays/CakeOverlay";
import { LetterOverlay } from "@/components/overlays/LetterOverlay";
import { GiftOverlay } from "@/components/overlays/GiftOverlay";
import { FinaleOverlay } from "@/components/overlays/FinaleOverlay";

const OVERLAYS: Record<SceneId, () => React.ReactNode> = {
  passkey: PasskeyOverlay,
  welcome: WelcomeOverlay,
  gallery: GalleryOverlay,
  constellation: ConstellationOverlay,
  garden: GardenOverlay,
  cake: CakeOverlay,
  letter: LetterOverlay,
  gift: GiftOverlay,
  finale: FinaleOverlay,
};

/** The DOM layer: one scene's UI at a time, gently cross-faded.
    While the camera flies, the sky is clear — pure cinema. */
export function SceneOverlay() {
  const scene = useExperience((s) => s.scene);
  const transition = useExperience((s) => s.transition);
  const Overlay = OVERLAYS[scene];

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <AnimatePresence mode="wait">
        {transition === null && (
          <motion.div
            key={scene}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Overlay />
          </motion.div>
        )}
      </AnimatePresence>

      {/* a soft line while flying through the portal */}
      {transition && transition.effect === "portal" && (
        <motion.div
          key={transition.key}
          className="absolute inset-0 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: transition.duration / 1000,
            times: [0, 0.3, 0.72, 1],
            ease: "easeInOut",
          }}
        >
          <p className="text-center font-script text-4xl text-blush text-glow sm:text-5xl">
            {experience.scenes.passkey.unlockedHeading}
          </p>
        </motion.div>
      )}
    </div>
  );
}