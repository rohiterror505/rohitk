"use client";

import { motion } from "framer-motion";
import { goTo, SCENE_ORDER, useExperience, type SceneId } from "@/lib/store";

const LABELS: Record<SceneId, string> = {
  passkey: "The little gate",
  welcome: "The beginning",
  gallery: "The memories",
  constellation: "The stars",
  garden: "The heart garden",
  cake: "The birthday cake",
  letter: "The letter",
  gift: "The final surprise",
  finale: "Home",
};

/** Tiny dots to revisit places she has already been. Only after unlocking. */
export function ExperienceNavigation() {
  const unlocked = useExperience((s) => s.unlocked);
  const scene = useExperience((s) => s.scene);
  const visited = useExperience((s) => s.visited);

  if (!unlocked) return null;

  return (
    <motion.nav
      aria-label="Little universe navigation"
      className="fixed right-2.5 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-1.5 sm:right-5"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      {SCENE_ORDER.filter((id) => id !== "passkey").map((id) => {
        const isVisited = visited.includes(id);
        const isCurrent = scene === id;
        return (
          <button
            key={id}
            disabled={!isVisited}
            aria-label={
              isCurrent
                ? `You are at: ${LABELS[id]}`
                : isVisited
                  ? `Return to ${LABELS[id]}`
                  : `${LABELS[id]} (not discovered yet)`
            }
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => goTo(id, "stars")}
            className="grid h-7 w-7 place-items-center rounded-full transition-transform hover:scale-125 disabled:cursor-default"
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                isCurrent
                  ? "h-2.5 w-2.5 bg-blush shadow-[0_0_10px_rgba(245,184,207,0.9)]"
                  : isVisited
                    ? "h-1.5 w-1.5 bg-cream/55"
                    : "h-1.5 w-1.5 bg-cream/15"
              }`}
            />
          </button>
        );
      })}
    </motion.nav>
  );
}