"use client";

import { motion, useReducedMotion } from "framer-motion";

interface CinematicLinesProps {
  lines: string[];
  /** seconds before the first line appears */
  delayStart?: number;
  /** seconds between lines */
  stagger?: number;
  className?: string;
  lineClassName?: string | ((index: number) => string);
}

/** Lines that appear one by one, like a quiet film. */
export function CinematicLines({
  lines,
  delayStart = 0.4,
  stagger = 1.6,
  className,
  lineClassName,
}: CinematicLinesProps) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <motion.p
          key={i}
          className={
            typeof lineClassName === "function" ? lineClassName(i) : lineClassName
          }
          initial={{ opacity: 0, y: reduce ? 0 : 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: reduce
              ? Math.min(i * 0.15, 0.5)
              : delayStart + i * stagger,
            duration: reduce ? 0.25 : 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

/** The total seconds CinematicLines needs before its last line lands. */
export function cinematicDuration(
  lines: number,
  delayStart = 0.4,
  stagger = 1.6,
  reduced = false
): number {
  if (reduced) return Math.min(lines * 0.15, 0.5) + 0.25;
  return delayStart + (lines - 1) * stagger + 0.9;
}