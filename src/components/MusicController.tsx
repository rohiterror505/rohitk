"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { experience } from "@/config/experience";
import { audio } from "@/lib/audio";

/** Music stays off until she taps this. Then a gentle generated melody
    plays — and every sound in the universe wakes up with it. */
export function MusicController() {
  const [on, setOn] = useState(experience.music.enabledByDefault);

  return (
    <motion.button
      aria-pressed={on}
      aria-label={on ? "Pause the music" : "Play soft music"}
      className="glass-panel fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full transition-transform hover:scale-110 sm:bottom-6 sm:right-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      onClick={async () => {
        const enabled = await audio.toggle();
        setOn(enabled);
        if (enabled) audio.playSfx("chime");
      }}
    >
      {on ? (
        <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="eq-bar block h-full w-[3px] rounded-full bg-blush"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </span>
      ) : (
        <span className="text-lg text-cream/55" aria-hidden="true">
          ♪
        </span>
      )}
    </motion.button>
  );
}