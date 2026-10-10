"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { experience } from "@/config/experience";
import { goTo, openGalleryPhoto, useExperience } from "@/lib/store";
import { audio } from "@/lib/audio";
import { CinematicLines, cinematicDuration } from "@/components/ui/CinematicLines";

function Lightbox({ index }: { index: number }) {
  const photos = experience.photos;
  const copy = experience.scenes.gallery.lightbox;
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  const next = () => {
    openGalleryPhoto((index + 1) % photos.length);
    audio.playSfx("chime");
  };
  const prev = () => {
    openGalleryPhoto((index + photos.length - 1) % photos.length);
    audio.playSfx("chime");
  };

  useEffect(() => {
    closeRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") openGalleryPhoto(null);
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => openGalleryPhoto(null)}
      role="dialog"
      aria-modal="true"
      aria-label={`Memory ${index + 1} of ${photos.length}`}
    >
      <div className="absolute inset-0 bg-[#060515]/55 backdrop-blur-md" />
      <motion.figure
        key={index}
        className="glass-card pointer-events-auto relative w-full max-w-lg p-4 sm:p-6"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 130, damping: 18 }}
        onClick={(event) => event.stopPropagation()}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70) next();
          else if (info.offset.x > 70) prev();
        }}
      >
        <img
          src={photos[index].src}
          alt={photos[index].alt}
          className="max-h-[58vh] w-full rounded-xl object-contain"
          draggable={false}
        />
        <figcaption className="mt-4 flex items-baseline justify-between gap-3">
          <p className="font-serif text-lg italic leading-snug text-cream/90">
            {photos[index].caption}
          </p>
          <span className="shrink-0 font-serif text-sm text-blush">
            {index + 1} {copy.counterLabel}
          </span>
        </figcaption>

        <button
          ref={closeRef}
          onClick={() => openGalleryPhoto(null)}
          aria-label={copy.closeLabel}
          className="absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full glass-panel text-cream/80 transition hover:text-blush sm:-right-3 sm:-top-3"
        >
          ✕
        </button>
        <button
          onClick={prev}
          aria-label={copy.prevLabel}
          className="absolute -left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full glass-panel text-cream/80 transition hover:text-blush sm:grid"
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label={copy.nextLabel}
          className="absolute -right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full glass-panel text-cream/80 transition hover:text-blush sm:grid"
        >
          ›
        </button>
        <p className="mt-3 text-center font-serif text-xs tracking-widest text-cream/40 sm:hidden">
          swipe to see more
        </p>
      </motion.figure>
    </motion.div>
  );
}

export function GalleryOverlay() {
  const copy = experience.scenes.gallery;
  const focus = useExperience((s) => s.galleryFocus);
  const reduce = useReducedMotion();

  return (
    <>
      <div className="absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-8 text-center sm:pt-10">
        <h2 className="font-script text-3xl sm:text-5xl text-cream text-glow-soft">
          {copy.heading}
        </h2>
        <p className="mt-2 font-serif text-sm italic text-cream/60">
          {copy.hint}
        </p>
        <div className="pointer-events-auto mt-4 flex gap-2.5" role="group" aria-label="Open a memory">
          {experience.photos.map((photo, i) => (
            <button
              key={photo.src}
              onClick={() => {
                openGalleryPhoto(i);
                audio.playSfx("chime");
              }}
              aria-label={`Open memory ${i + 1}`}
              className={`grid h-9 w-9 place-items-center rounded-full border font-serif text-sm transition-all ${
                focus === i
                  ? "border-blush bg-blush/25 text-blush"
                  : "border-cream/20 bg-cream/5 text-cream/60 hover:border-blush/60 hover:text-blush"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-6 pb-8 text-center">
        <CinematicLines
          lines={copy.footerLines}
          delayStart={1.2}
          stagger={reduce ? 0.2 : 2.0}
          lineClassName={(i) =>
            i === 0
              ? "font-serif text-lg sm:text-xl text-cream/90"
              : "font-serif italic text-cream/60"
          }
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: cinematicDuration(2, 1.2, reduce ? 0.2 : 2.0, !!reduce) + 0.5,
            duration: 0.8,
          }}
          className="pointer-events-auto"
        >
          <button className="btn-soft" onClick={() => goTo("constellation", "stars")}>
            {copy.continueLabel}
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {focus !== null && <Lightbox key="lightbox" index={focus} />}
      </AnimatePresence>
    </>
  );
}