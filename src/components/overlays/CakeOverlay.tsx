"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { experience } from "@/config/experience";
import { goTo, setCakeStage, useExperience } from "@/lib/store";
import { audio } from "@/lib/audio";

export function CakeOverlay() {
  const copy = experience.scenes.cake;
  const stage = useExperience((s) => s.cakeStage);
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-10 text-center sm:py-12">
      <AnimatePresence mode="wait">
        {stage === "idle" && (
          <motion.div
            key="idle"
            className="mt-6 flex max-w-2xl flex-col items-center"
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-script text-4xl sm:text-6xl text-cream text-glow">
              {copy.heading}
            </h2>
            <p className="mt-4 font-serif text-lg italic leading-relaxed text-cream/85">
              {copy.subheading}
            </p>
          </motion.div>
        )}

        {stage === "wished" && (
          <motion.div
            key="wished"
            className="mt-6 flex flex-col items-center"
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="font-script text-3xl text-gold text-glow-soft sm:text-4xl">
              {copy.afterWishLine}
            </p>
          </motion.div>
        )}

        {stage === "blown" && (
          <motion.div
            key="blown"
            className="mt-6 flex max-w-2xl flex-col items-center"
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.8 }}
          >
            <p className="font-serif text-xl italic leading-relaxed text-cream/95 sm:text-2xl">
              {copy.finalMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto mb-2">
        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.button
              key="wish"
              className="btn-magical"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 1.6, duration: 0.7 }}
              onClick={() => {
                setCakeStage("wished");
                audio.playSfx("wish");
              }}
            >
              {copy.wishButton}
            </motion.button>
          )}
          {stage === "wished" && (
            <motion.button
              key="blow"
              className="btn-magical"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 1.0, duration: 0.7 }}
              onClick={() => setCakeStage("blown")}
            >
              {copy.blowButton}
            </motion.button>
          )}
          {stage === "blown" && (
            <motion.button
              key="continue"
              className="btn-magical"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 2.2, duration: 0.8 }}
              onClick={() => goTo("letter", "stars")}
            >
              {copy.continueLabel}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}