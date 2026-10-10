"use client";

import { motion } from "framer-motion";
import { experience } from "@/config/experience";
import { goTo, replay } from "@/lib/store";
import { audio } from "@/lib/audio";

export function FinaleOverlay() {
  const copy = experience.scenes.finale;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-9 text-center sm:py-11">
      <motion.h2
        className="mt-4 font-script text-4xl text-cream text-glow sm:mt-6 sm:text-6xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        {copy.heading}
      </motion.h2>

      <motion.div
        className="pointer-events-auto mb-10 flex flex-col items-center gap-3.5 sm:mb-14 sm:flex-row sm:gap-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.9 }}
      >
        <button className="btn-soft" onClick={() => goTo("gallery", "stars")}>
          {copy.buttons.memories}
        </button>
        <button className="btn-soft" onClick={() => goTo("letter", "stars")}>
          {copy.buttons.letter}
        </button>
        <button
          className="btn-magical"
          onClick={() => {
            audio.playSfx("portal");
            replay();
          }}
        >
          {copy.buttons.replay}
        </button>
      </motion.div>

      <motion.p
        className="absolute inset-x-0 bottom-3 font-serif text-xs tracking-[0.18em] text-cream/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1.2 }}
      >
        {copy.footer}
      </motion.p>
    </div>
  );
}