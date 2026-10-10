"use client";

/* Runtime capability flags, decided once at bootstrap (client only). */

export const runtime = {
  reducedMotion: false,
  highQuality: true,
};

export function initRuntime() {
  if (typeof window === "undefined") return;

  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  runtime.reducedMotion = mq.matches;
  const update = () => {
    runtime.reducedMotion = mq.matches;
  };
  if (typeof mq.addEventListener === "function") mq.addEventListener("change", update);

  const smallScreen = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency ?? 4;
  runtime.highQuality = !smallScreen && cores >= 4;
}