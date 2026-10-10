# A Little Universe for Manvi ❤️

> *Some people deserve a little universe of their own.*

An interactive 3D birthday experience — a passkey gate, a glowing heart,
five photographs, a memory constellation, a heart garden, a birthday cake,
a letter, and one final surprise. Built with Next.js, React Three Fiber,
Framer Motion, and Tailwind CSS.

**Her birthday: 11 October 2002 · Her little secret: stored in the `PASSKEY` environment variable**

---

## Quick start

```bash
npm install
npm run dev        # develop at http://localhost:3000
```

Production:

```bash
npm run build
npm start          # serves the finished experience
```

## Editing everything personal

**Every word she will read lives in one file: [`src/config/experience.ts`](src/config/experience.ts)**

There you can change:

| What | Where in the file |
|---|---|
| Her name & birthday | `recipient` |
| The five photo captions | `photos[]` |
| Every scene's lines, buttons, hints | `scenes.*` |
| The garden's five messages | `scenes.garden.messages` |
| The birthday letter (5 tones) | `letters` + `letterTone` |
| The final surprise messages | `scenes.gift` |
| The signature (empty = anonymous) | `signature` |
| The color palette | `theme` |
| Whether music starts available/off | `music` |

The letter ships with five interchangeable tones — `full` (the original),
`short`, `playful`, `emotional`, and `romantic`. Set `letterTone` to switch.

### Changing the photographs

Replace the files in `public/photos/` (keep the names `photo-1.jpeg` …
`photo-5.jpeg`), or point `photos[].src` at new paths. Originals are never
altered — the website simply displays them.

### Changing the passkey

The passkey is validated **on the server**, never shipped to the browser:

- locally: edit `.env.local` (`PASSKEY=her-little-secret`)
- on Vercel: **Project Settings → Environment Variables → `PASSKEY`**

A gentle honesty note: this is a sweet little gate, not bank-grade
security — but the secret itself never appears in the client bundle, and
the check is timing-safe on the server.

## Music & sound

All sound is **synthesized live** with the Web Audio API (a soft generative
piano/pad loop, plus tiny chimes, whooshes, and sparkles). No audio files,
no licensing worries. The song **begins by itself** with her very first tap
or keypress — browsers only require one interaction before sound can start,
and typing her little secret counts. The small button in the corner lets her
mute or unmute everything at any time.

## Accessibility & resilience

- `prefers-reduced-motion` → snappy fades instead of long flights
- Full keyboard navigation (Enter, arrows, Escape), visible focus rings
- Every 3D object also has a keyboard-reachable button
- Touch & swipe on mobile
- No WebGL? A gentle storybook version of the whole journey is shown

## Testing

With the server running (`npm start` or `npm run dev`):

```bash
npm test           # full browser walk-through, 31 checks, no console errors
npm run test:visual # screenshots of every scene into ./screenshots
```

## Deploying to Vercel

1. Push this folder to a GitHub repository:

   ```bash
   git init
   git add .
   git commit -m "A little universe for Manvi ❤️"
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. On [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Add the environment variable `PASSKEY` = her little secret.
4. Deploy. Done — share the link with her. 🎉

---

*Created especially for Manvi · 11 October 2002*