"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { experience } from "@/config/experience";
import { audio } from "@/lib/audio";

/** The song begins by itself — browsers only ask for one little
    interaction first (her first tap or keypress on the passkey screen
    counts). The button stays as a gentle mute/unmute toggle. */
export function MusicController() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!experience.music.autoplay) return;
    let started = false;
    const start = async () => {
      if (started) return;
      started = true;
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      try {
        await audio.enable();
        setOn(true);
      } catch {
        /* no Web Audio in this browser — the world stays silent */
      }
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  return (
    <motion.button
      aria-pressed={on}
      aria-label={on ? "Mute the music" : "Unmute the music"}
      title={on ? "Mute the music" : "Unmute the music"}
      className="glass-panel fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full transition-transform hover:scale-110 sm:bottom-6 sm:right-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      onClick={async () => {
        const enabled = await audio.toggle();
        setOn(enabled);
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