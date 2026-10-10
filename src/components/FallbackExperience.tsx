"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { experience } from "@/config/experience";

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className={`mx-auto w-full max-w-3xl px-6 py-14 text-center ${className}`}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.section>
  );
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const copy = experience.scenes.passkey;
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");

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
      if (data.ok) onUnlock();
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Section className="flex min-h-screen flex-col justify-center">
      <h1 className="font-script text-4xl text-blush text-glow sm:text-6xl">
        {copy.introLines[0]}
      </h1>
      <p className="mx-auto mt-5 max-w-xl font-serif text-lg text-cream/85 sm:text-xl">
        {copy.introLines[1]}
      </p>
      <form onSubmit={handleSubmit} className="mx-auto mt-10 w-full max-w-md">
        <label
          htmlFor="fallback-passkey"
          className="mb-3 block font-serif text-sm uppercase tracking-[0.2em] text-cream/70"
        >
          {copy.inputLabel}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="fallback-passkey"
            type="password"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={copy.inputPlaceholder}
            className="glass-panel flex-1 rounded-full px-5 py-3 font-serif text-lg text-cream placeholder:text-cream/35"
          />
          <button type="submit" className="btn-magical" disabled={status === "checking"}>
            {status === "checking" ? "Unlocking…" : copy.buttonLabel}
          </button>
        </div>
        {status === "error" && (
          <p className="mt-3 font-serif text-blush" aria-live="polite">
            {copy.errorLabel}
          </p>
        )}
      </form>
      <p className="mt-16 font-serif text-xs text-cream/35">
        (this little world is being shown in storybook mode)
      </p>
    </Section>
  );
}

/** A gentle storybook version for browsers without WebGL. */
export default function FallbackExperience() {
  const [unlocked, setUnlocked] = useState(false);
  const letter = experience.letters[experience.letterTone] ?? experience.letters.full;
  const garden = experience.scenes.garden;

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: "radial-gradient(120% 90% at 50% 10%, #221a5e 0%, #14103d 45%, #0b0926 100%)" }}
    >
      <Section>
        <h1 className="font-script text-5xl text-cream text-glow sm:text-7xl">
          Happy Birthday, Manvi.
        </h1>
        <p className="mt-5 font-serif text-xl text-blush">
          11.10.2002 — the day the world got a little more beautiful.
        </p>
      </Section>

      <Section>
        <h2 className="font-script text-3xl text-cream sm:text-5xl">
          {experience.scenes.gallery.heading}
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {experience.photos.map((photo) => (
            <figure key={photo.src} className="glass-card p-4">
              <img
                src={photo.src}
                alt={photo.alt}
                className="mx-auto max-h-[52vh] w-full rounded-xl object-contain"
                loading="lazy"
              />
              <figcaption className="mt-3 font-serif italic text-cream/85">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8 font-serif text-lg text-cream/90">
          Five little frames. A thousand little feelings.
        </p>
      </Section>

      <Section>
        <h2 className="font-script text-3xl text-cream sm:text-4xl">
          {experience.scenes.constellation.heading}
        </h2>
        <p className="mt-2 font-serif italic text-cream/70">
          {experience.scenes.constellation.subheading}
        </p>
        <div className="mt-8 space-y-4">
          {experience.scenes.constellation.starMessages.map((message, i) => (
            <div key={i} className="glass-card px-6 py-4">
              <span className="text-gold" aria-hidden="true">
                ✦
              </span>
              <p className="mt-1 font-serif italic text-cream/90">{message}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="font-script text-3xl text-cream sm:text-4xl">
          {garden.heading}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Object.entries(garden.messages).map(([id, message]) => (
            <div key={id} className="glass-card px-6 py-5 text-left">
              <p className="font-serif text-xs uppercase tracking-[0.2em] text-blush/80">
                {garden.objectLabels[id as keyof typeof garden.objectLabels]}
              </p>
              <p className="mt-2 font-serif leading-relaxed text-cream/90">{message}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="font-script text-3xl text-cream sm:text-5xl">
          {experience.scenes.cake.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-serif italic text-cream/85">
          {experience.scenes.cake.subheading}
        </p>
        <p className="mt-6 text-4xl" aria-hidden="true">
          🎂✨
        </p>
        <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-cream/95">
          {experience.scenes.cake.finalMessage}
        </p>
      </Section>

      <Section>
        <h2 className="font-serif text-2xl italic text-cream/95 sm:text-3xl">
          {experience.scenes.letter.heading}
        </h2>
        <div className="letter-scroll mx-auto mt-8 max-h-[70vh] max-w-2xl overflow-y-auto rounded-[1.4rem] border border-[#e8d9bd] bg-gradient-to-br from-[#fbf5e8] to-[#f3e7cd] px-6 py-10 text-left sm:px-12">
          {letter.paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={
                i === 0 || paragraph === "Happy Birthday, Manvi."
                  ? "mb-6 font-script text-3xl text-[#8a4a6b]"
                  : "mb-5 font-serif text-lg leading-8 text-[#2a2352]"
              }
            >
              {paragraph}
            </p>
          ))}
          {experience.signature && (
            <p className="mt-8 text-right font-script text-2xl text-[#5b3a86]">
              {experience.signature}
            </p>
          )}
        </div>
      </Section>

      <Section>
        <h2 className="font-serif text-2xl italic text-cream/95 sm:text-3xl">
          {experience.scenes.gift.intro}
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {experience.photos.map((photo) => (
            <img
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              className="w-full rounded-lg border border-cream/20"
              loading="lazy"
            />
          ))}
        </div>
        <div className="mt-10 space-y-4">
          {experience.scenes.gift.finalLines.map((line, i) => (
            <p
              key={i}
              className={
                i === experience.scenes.gift.finalLines.length - 1
                  ? "font-script text-4xl text-blush text-glow sm:text-6xl"
                  : "font-serif text-xl italic text-cream/90"
              }
            >
              {line}
            </p>
          ))}
        </div>
        <p className="mt-10 font-serif text-gold/90">
          {experience.scenes.gift.credit}
        </p>
      </Section>

      <footer className="pb-10 pt-4 text-center font-serif text-xs tracking-[0.18em] text-cream/45">
        {experience.scenes.finale.footer}
      </footer>
    </div>
  );
}