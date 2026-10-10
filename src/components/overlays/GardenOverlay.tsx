"use client";

import { AnimatePresence, motion } from "framer-motion";
import { experience } from "@/config/experience";
import {
  closeGardenMessage,
  discoverGardenObject,
  gardenFoundCount,
  GARDEN_OBJECTS,
  goTo,
  useExperience,
  type GardenObjectId,
} from "@/lib/store";
import { audio } from "@/lib/audio";
import { Typewriter } from "@/components/ui/Typewriter";

const OBJECT_EMOJI: Record<GardenObjectId, string> = {
  heart: "💗",
  flower: "🌸",
  star: "✨",
  butterfly: "🦋",
  gift: "🎁",
};

export function GardenOverlay() {
  const copy = experience.scenes.garden;
  const found = useExperience((s) => gardenFoundCount(s));
  const open = useExperience((s) => s.gardenOpen);

  const progress = copy.progressTemplate.replace("{n}", String(found));
  const allFound = found === GARDEN_OBJECTS.length;

  return (
    <>
      <div className="absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-8 text-center sm:pt-10">
        <h2 className="font-script text-3xl sm:text-5xl text-cream text-glow-soft">
          {copy.heading}
        </h2>
        <p className="mt-2 max-w-md font-serif italic text-cream/75">
          {copy.subheading}
        </p>

        <div
          className="pointer-events-auto mt-4 flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Little surprises"
        >
          {GARDEN_OBJECTS.map((id) => (
            <button
              key={id}
              onClick={() => {
                discoverGardenObject(id);
                audio.playSfx("chime");
              }}
              aria-label={copy.objectLabels[id]}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-serif text-sm transition-all ${
                open === id
                  ? "border-blush bg-blush/25 text-blush"
                  : "border-cream/20 bg-cream/5 text-cream/70 hover:border-blush/60 hover:text-blush"
              }`}
            >
              <span aria-hidden="true">{OBJECT_EMOJI[id]}</span>
              <span className="hidden sm:inline">{copy.objectLabels[id]}</span>
            </button>
          ))}
        </div>

        <p
          className="mt-3 font-serif text-sm tracking-wide text-gold/90"
          aria-live="polite"
        >
          {progress}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            key={open}
            className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-16 sm:pb-20"
            initial={{ opacity: 0, y: 34, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 130, damping: 17 }}
          >
            <div className="glass-card pointer-events-auto w-full max-w-lg p-6 sm:p-7">
              <p className="font-serif text-xs uppercase tracking-[0.22em] text-blush/80">
                {copy.objectLabels[open]}
              </p>
              <Typewriter
                text={copy.messages[open]}
                className="mt-3 font-serif text-lg leading-relaxed text-cream/95 sm:text-xl"
              />
              <button
                className="btn-soft mt-5 text-sm"
                onClick={() => closeGardenMessage()}
              >
                Keep exploring
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-5 sm:pb-7">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: allFound ? 1 : 0.5 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className={`btn-soft pointer-events-auto ${allFound ? "border-gold/70 text-gold" : ""}`}
          onClick={() => goTo("cake", "stars")}
        >
          {copy.continueLabel}
        </motion.button>
      </div>
    </>
  );
}