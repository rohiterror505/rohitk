"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface TypewriterProps {
  text: string;
  /** ms per character */
  speed?: number;
  className?: string;
}

/** Text that types itself out, letter by letter. */
export function Typewriter({ text, speed = 26, className }: TypewriterProps) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let interval: ReturnType<typeof setInterval> | null = null;
    interval = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          if (interval) clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [text, speed, reduce]);

  const done = count >= text.length;
  return (
    <p className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {!done && (
        <span
          aria-hidden="true"
          className="text-blush animate-pulse"
        >
          ▌
        </span>
      )}
    </p>
  );
}