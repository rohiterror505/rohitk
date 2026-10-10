"use client";

import { AnimatePresence, motion } from "framer-motion";
import { experience } from "@/config/experience";
import {
  focusConstellationStar,
  goTo,
  useExperience,
} from "@/lib/store";
import { audio } from "@/lib/audio";
import { Typewriter } from "@/components/ui/Typewriter";

export function ConstellationOverlay() {
  const copy = experience.scenes.constellation;
  const focus = useExperience((s) => s.constellationFocus);
  const hasSeenOne = focus !== null;

  return (
    <>
      <div className="absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-8 text-center sm:pt-10">
        <h2 className="font-script text-3xl sm:text-5xl text-cream text-glow-soft">
          {copy.heading}
        </h2>
        <p className="mt-2 font-serif italic text-cream/75">{copy.subheading}</p>
        <p className="mt-1 font-serif text-sm text-cream/50">{copy.hint}</p>
        <div
          className="pointer-events-auto mt-4 flex gap-2.5"
          role="group"
          aria-label="Open a star memory"
        >
          {experience.photos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                focusConstellationStar(i);
                audio.playSfx("chime");
              }}
              aria-label={`Star memory ${i + 1}`}
              className={`grid h-9 w-9 place-items-center rounded-full border text-sm transition-all ${
                focus === i
                  ? "border-gold bg-gold/20 text-gold"
                  : "border-cream/20 bg-cream/5 text-cream/60 hover:border-gold/60 hover:text-gold"
              }`}
            >
              ✦
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {focus !== null && (
          <motion.div
            key={`card-${focus}`}
            className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6 sm:pb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            <div className="glass-card pointer-events-auto flex w-full max-w-md items-center gap-4 p-4 sm:p-5">
              <img
                src={experience.photos[focus].src}
                alt={experience.photos[focus].alt}
                className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
                draggable={false}
              />
              <div className="min-w-0">
                <Typewriter
                  text={copy.starMessages[focus]}
                  className="font-serif text-base italic leading-snug text-cream/90 sm:text-lg"
                />
                <button
                  className="btn-soft mt-3 text-sm"
                  onClick={() => focusConstellationStar(null)}
                >
                  {copy.backLabel}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-6 sm:pb-8">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: hasSeenOne ? 1 : 0.45 }}
          transition={{ delay: hasSeenOne ? 0.4 : 0, duration: 0.8 }}
          className="btn-soft pointer-events-auto"
          onClick={() => goTo("garden", "stars")}
        >
          {copy.continueLabel}
        </motion.button>
      </div>
    </>
  );
}