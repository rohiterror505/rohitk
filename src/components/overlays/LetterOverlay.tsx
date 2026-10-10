"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { experience } from "@/config/experience";
import { goTo, openLetter, useExperience } from "@/lib/store";
import { audio } from "@/lib/audio";

function HeartBadge() {
  return (
    <div
      className="animate-heartbeat text-blush"
      style={{ filter: "drop-shadow(0 0 24px rgba(231,138,168,0.8))" }}
      aria-hidden="true"
    >
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
        <path
          d="M32 51 C12 38 7 25.5 15 18.5 C20.8 13.6 28.6 16 32 23 C35.4 16 43.2 13.6 49 18.5 C57 25.5 52 38 32 51 Z"
          fill="url(#letterHeartGrad)"
        />
        <defs>
          <linearGradient id="letterHeartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5b8cf" />
            <stop offset="100%" stopColor="#e78aa8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/** The letter itself — warm paper, revealed at her own reading pace. */
function LetterPaper() {
  const copy = experience.scenes.letter;
  const letter = experience.letters[experience.letterTone] ?? experience.letters.full;
  const [readKey, setReadKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-2xl"
        style={{ transformPerspective: 1400 }}
        initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: -75, y: 90 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, rotateX: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 55, damping: 15, delay: 0.4 }}
      >
        <div
          ref={scrollRef}
          className="letter-scroll max-h-[82vh] overflow-y-auto rounded-[1.4rem] border border-[#e8d9bd] bg-gradient-to-br from-[#fbf5e8] via-[#f8f0de] to-[#f3e7cd] px-6 py-9 shadow-[0_30px_90px_rgba(4,3,18,0.65)] sm:px-12 sm:py-12"
        >
          {letter.paragraphs.map((paragraph, i) => (
            <motion.p
              key={`${readKey}:${i}`}
              className={`whitespace-pre-line leading-8 text-[#2a2352] ${
                i === 0 || paragraph === "Happy Birthday, Manvi."
                  ? "mb-6 font-script text-3xl text-[#8a4a6b] sm:text-4xl"
                  : "mb-5 font-serif text-[1.04rem] sm:text-lg"
              }`}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-18% 0px -18% 0px" }}
              transition={{ duration: 0.7, delay: reduce ? 0 : i < 2 ? 0.35 + i * 0.8 : 0.15 }}
            >
              {paragraph}
            </motion.p>
          ))}

          {experience.signature && (
            <p className="mt-8 text-right font-script text-2xl text-[#5b3a86] sm:text-3xl">
              {experience.signature}
            </p>
          )}

          <div className="mt-8 flex justify-center">
            <HeartBadge />
          </div>
          <p className="mt-3 text-center font-serif text-sm italic tracking-wide text-[#7a6a9e]">
            {copy.closingGlowLabel}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              className="btn-soft"
              onClick={() => {
                setReadKey((k) => k + 1);
                scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                audio.playSfx("paper");
              }}
            >
              {copy.againButton}
            </button>
            <button
              className="btn-magical"
              onClick={() => goTo("gift", "stars")}
            >
              {copy.continueButton}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LetterOverlay() {
  const copy = experience.scenes.letter;
  const opened = useExperience((s) => s.letterOpened);
  const reduce = useReducedMotion();

  if (opened) return <LetterPaper />;

  return (
    <div className="absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-10 text-center sm:pt-12">
      <h2 className="max-w-xl font-serif text-2xl italic text-cream/95 sm:text-3xl">
        {copy.heading}
      </h2>
      <p className="mt-3 font-serif text-lg text-cream/70">{copy.subheading}</p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0.3 : 1.8, duration: 0.8 }}
        className="pointer-events-auto mt-8"
      >
        <button
          className="btn-magical"
          onClick={() => {
            openLetter();
            audio.playSfx("paper");
          }}
        >
          {copy.openButton}
        </button>
      </motion.div>
    </div>
  );
}