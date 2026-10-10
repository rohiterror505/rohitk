"use client";

import { motion, useReducedMotion } from "framer-motion";
import { experience } from "@/config/experience";
import { goTo, openGift, useExperience } from "@/lib/store";
import { audio } from "@/lib/audio";
import {
  CinematicLines,
  cinematicDuration,
} from "@/components/ui/CinematicLines";

export function GiftOverlay() {
  const copy = experience.scenes.gift;
  const opened = useExperience((s) => s.giftOpened);
  const reduce = useReducedMotion();

  if (opened) {
    const stagger = reduce ? 0.2 : 2.4;
    const creditDelay = cinematicDuration(
      copy.finalLines.length,
      1.4,
      stagger,
      !!reduce
    );

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center">
        <CinematicLines
          lines={copy.finalLines}
          delayStart={1.4}
          stagger={stagger}
          lineClassName={(i) =>
            i === copy.finalLines.length - 1
              ? "font-script text-5xl sm:text-7xl text-blush text-glow"
              : "font-serif text-xl italic text-cream/90 sm:text-2xl"
          }
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: creditDelay + 0.8, duration: 1 }}
          className="flex flex-col items-center gap-7"
        >
          <p className="font-serif text-lg text-gold/90">{copy.credit}</p>
          <motion.button
            className="btn-magical pointer-events-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: creditDelay + 1.6, duration: 0.8 }}
            onClick={() => goTo("finale", "stars", 4400)}
          >
            Stay a little longer →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-9 px-6 text-center">
      <motion.h2
        className="max-w-xl font-serif text-2xl italic text-cream/95 sm:text-3xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0.3 : 1.0, duration: 0.8 }}
      >
        {copy.intro}
      </motion.h2>
      <motion.button
        className="btn-magical pointer-events-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0.5 : 2.2, duration: 0.8 }}
        onClick={() => {
          openGift();
          audio.playSfx("sparkle");
        }}
      >
        {copy.button}
      </motion.button>
    </div>
  );
}