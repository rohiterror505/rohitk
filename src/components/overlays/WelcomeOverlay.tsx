"use client";

import { motion, useReducedMotion } from "framer-motion";
import { experience } from "@/config/experience";
import { goTo } from "@/lib/store";
import { audio } from "@/lib/audio";
import {
  CinematicLines,
  cinematicDuration,
} from "@/components/ui/CinematicLines";

export function WelcomeOverlay() {
  const copy = experience.scenes.welcome;
  const reduce = useReducedMotion();

  const buttonDelay = cinematicDuration(copy.lines.length, 0.6, reduce ? 0.2 : 2.5, !!reduce) + (reduce ? 0.2 : 0.8);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <CinematicLines
        lines={copy.lines}
        delayStart={0.6}
        stagger={reduce ? 0.2 : 2.5}
        lineClassName={(i) =>
          i === 0
            ? "font-script text-6xl sm:text-8xl text-cream text-glow mb-7"
            : i === 1
              ? "font-serif text-xl sm:text-2xl text-blush mb-5 tracking-wide"
              : "font-serif text-lg sm:text-xl italic text-cream/85"
        }
      />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: buttonDelay, duration: 0.8 }}
        className="pointer-events-auto mt-10"
      >
        <button
          className="btn-magical"
          onClick={() => {
            audio.playSfx("portal");
            goTo("gallery", "stars");
          }}
        >
          {copy.buttonLabel}
        </button>
      </motion.div>
    </div>
  );
}