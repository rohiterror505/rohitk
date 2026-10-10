"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { experience } from "@/config/experience";
import { goTo, unlock } from "@/lib/store";
import { audio } from "@/lib/audio";
import { CinematicLines } from "@/components/ui/CinematicLines";

export function PasskeyOverlay() {
  const copy = experience.scenes.passkey;
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const reduce = useReducedMotion();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === "checking") return;
    setStatus("checking");
    try {
      const res = await fetch("/api/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: value }),
      });
      const data = (await res.json()) as { ok: boolean };
      if (data.ok) {
        unlock();
        audio.playSfx("portal");
        goTo("welcome", "portal");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-10 sm:py-14">
      <div className="mt-8 w-full max-w-2xl text-center sm:mt-12">
        <CinematicLines
          lines={copy.introLines}
          delayStart={0.6}
          stagger={reduce ? 0.2 : 2.2}
          lineClassName={(i) =>
            i === 0
              ? "font-script text-5xl sm:text-6xl text-blush text-glow mb-6"
              : "font-serif text-lg sm:text-xl leading-relaxed text-cream/85 mb-4"
          }
        />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="pointer-events-auto mb-4 w-full max-w-md"
        animate={status === "error" ? { x: [0, -11, 11, -7, 7, -3, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <label
          htmlFor="passkey-input"
          className="mb-3 block text-center font-serif text-sm uppercase tracking-[0.2em] text-cream/70"
        >
          {copy.inputLabel}
        </label>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <input
            id="passkey-input"
            type="password"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={copy.inputPlaceholder}
            className="glass-panel w-full flex-1 rounded-full px-5 py-3 font-serif text-lg text-cream placeholder:text-cream/35 focus:outline-none"
          />
          <button
            type="submit"
            className="btn-magical whitespace-nowrap"
            disabled={status === "checking"}
          >
            {status === "checking" ? "Unlocking…" : copy.buttonLabel}
          </button>
        </div>
        <div className="mt-3 min-h-7 text-center" aria-live="polite">
          {status === "error" && (
            <p className="font-serif text-blush">{copy.errorLabel}</p>
          )}
        </div>
      </motion.form>
    </div>
  );
}