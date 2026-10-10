"use client";

interface LoadingScreenProps {
  label?: string;
}

export default function LoadingScreen({
  label = "Gathering five little memories…",
}: LoadingScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        className="animate-heartbeat text-blush"
        style={{ filter: "drop-shadow(0 0 26px rgba(245,184,207,0.65))" }}
      >
        <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 51 C12 38 7 25.5 15 18.5 C20.8 13.6 28.6 16 32 23 C35.4 16 43.2 13.6 49 18.5 C57 25.5 52 38 32 51 Z"
            fill="url(#heartGrad)"
          />
          <defs>
            <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f5b8cf" />
              <stop offset="100%" stopColor="#c9a7eb" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <p className="font-serif text-lg tracking-wide text-cream/70">{label}</p>
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-cream/40"
            style={{
              animation: `float-soft 1.4s ease-in-out ${i * 0.22}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}