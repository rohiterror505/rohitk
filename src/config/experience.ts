/**
 * ─────────────────────────────────────────────────────────────────────────
 *  A LITTLE UNIVERSE FOR MANVI — everything personal lives in this file.
 *
 *  Edit words, captions, messages, the letter, colors, or the signature
 *  without touching any component code. ❤️
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface PhotoConfig {
  /** Path under /public — replace files, keep the same names, or change paths here. */
  src: string;
  /** Shown under the photo in the gallery lightbox and in the constellation. */
  caption: string;
  /** Alt text for accessibility. */
  alt: string;
}

export interface LetterConfig {
  /** Shown one paragraph at a time, at a comfortable reading pace. */
  paragraphs: string[];
}

export const experience = {
  /** The person this little universe belongs to. */
  recipient: {
    name: "Manvi",
    birthday: "11 October 2002",
    birthdayShort: "11.10.2002",
  },

  /** Environment variable that stores the real passkey on the server. */
  passkeyEnvKey: "PASSKEY",
  /** Placeholder only — the real secret lives in .env.local / Vercel, never in the repo. */
  passkeyFallback: "set-passkey-in-env",

  /** The five photographs. Replace the files in public/photos/ to swap pictures. */
  photos: [
    {
      src: "/photos/photo-1.jpeg",
      caption: "A little moment that deserves to be remembered.",
      alt: "A personal photograph of Manvi",
    },
    {
      src: "/photos/photo-2.jpeg",
      caption: "Some memories just make you smile.",
      alt: "A personal photograph of Manvi",
    },
    {
      src: "/photos/photo-3.jpeg",
      caption: "A picture, a moment, a memory to keep.",
      alt: "A personal photograph of Manvi",
    },
    {
      src: "/photos/photo-4.jpeg",
      caption: "Little things that somehow mean a lot.",
      alt: "A personal photograph of Manvi",
    },
    {
      src: "/photos/photo-5.jpeg",
      caption: "And this one will always have a special place here.",
      alt: "A personal photograph of Manvi",
    },
  ] as PhotoConfig[],

  /** Copy for every scene, in order of the experience. */
  scenes: {
    passkey: {
      introLines: [
        "Hey, Manvi! ❤️",
        "It's your birthday, so a plain old text wasn't going to cut it.",
      ],
      inputLabel: "Enter your little secret",
      inputPlaceholder: "the little secret…",
      buttonLabel: "Enter your little universe ✨",
      errorLabel: "Hmm, not quite. Try that little secret again. 💗",
      unlockedHeading: "Alright, birthday girl — let's begin. ✨",
    },

    welcome: {
      lines: [
        "Happy Birthday, Manvi.",
        "11.10.2002 — the day the world got a little more beautiful.",
        "And today, I made you a little something that's entirely yours — because that's what friends are for.",
      ],
      buttonLabel: "Start our little story →",
    },

    gallery: {
      heading: "Five little moments, kept for you.",
      hint: "Touch a frame to look closer ✨",
      footerLines: [
        "Five little frames. A thousand little feelings.",
        "And this is only the beginning…",
      ],
      lightbox: {
        prevLabel: "Previous memory",
        nextLabel: "Next memory",
        closeLabel: "Close",
        counterLabel: "of five little frames",
      },
      continueLabel: "Now let's look at the stars →",
    },

    constellation: {
      heading: "Some moments stay with us.",
      subheading: "Not every memory needs a reason to be special.",
      hint: "Touch a star to remember ✨",
      starMessages: [
        "Some moments quietly become a part of us.",
        "A little snapshot of a day worth remembering.",
        "Some feelings don't need words. Just a moment like this.",
        "Proof that the littlest moments can matter the most.",
        "One of those memories that stays warm.",
      ],
      backLabel: "Back to the stars",
      continueLabel: "There's a garden waiting for you →",
    },

    garden: {
      heading: "The little heart garden",
      subheading:
        "Five little things are floating around. Each one is hiding something for you.",
      hint: "Touch the glowing things ✨",
      messages: {
        heart: "Manvi, I hope you always have more reasons to smile than to stress — and on the heavy days, I hope you remember how many people are rooting for you. (Spoiler: a lot.)",
        flower: "Here's to a year of good news, calm days, and people who appreciate the gem you are. You give the world a lot of kindness — I hope it starts handing it right back.",
        star: "Never stop chasing the life you're dreaming about. There's so much ahead of you — and when you make it big, I expect front-row bragging rights as your friend.",
        butterfly: "Keep becoming exactly who you want to be — at your own pace, in your own way. Watching you grow is honestly one of the best parts of knowing you.",
        gift: "There's something more waiting for you. But first, explore a little. ✨",
      },
      objectLabels: {
        heart: "A glowing pink heart",
        flower: "A lavender flower",
        star: "A tiny star",
        butterfly: "A butterfly",
        gift: "A small gift box",
      },
      progressTemplate: "{n} of 5 little surprises discovered.",
      continueLabel: "One more little thing →",
    },

    cake: {
      heading: "Okay, birthday girl. It's wish time. 🎂",
      subheading: "Close your eyes, make a wish, and keep it just for yourself.",
      wishButton: "Make a little wish ✨",
      afterWishLine: "Your little wish is safe with the stars.",
      blowButton: "Blow out the candles 💨",
      finalMessage:
        "May this year bring you more happiness, more laughter, beautiful surprises, and moments you'll want to remember forever.",
      continueLabel: "There's a letter for you →",
    },

    letter: {
      heading: "Manvi, there's something I wanted to say…",
      subheading: "Some things are easier to write than to say.",
      openButton: "Open your letter 💌",
      againButton: "Read it again",
      continueButton: "One last little surprise →",
      closingGlowLabel: "from a friend who really cares ❤️",
    },

    gift: {
      intro: "Manvi, there's one last little surprise…",
      button: "Open your final surprise 🎁",
      finalLines: [
        "If there's one thing I hope you take away from this…",
        "It's that your happiness matters.",
        "And I'm really glad you're here.",
        "Happy Birthday, Manvi. ❤️",
      ],
      credit: "Made with lots of care, just for you.",
    },

    finale: {
      heading: "This little universe is yours, always.",
      buttons: {
        memories: "Visit my memories",
        letter: "Read your letter again",
        replay: "Replay your little universe",
      },
      footer: "Created especially for Manvi · 11 October 2002",
    },
  },

  /** Which letter tone to show. Options: "full" | "short" | "playful" | "emotional" | "romantic" */
  letterTone: "full" as "full" | "short" | "playful" | "emotional" | "romantic",

  letters: {
    full: {
      paragraphs: [
        "Happy Birthday, Manvi! ❤️",
        "I wanted to do something a little different for your birthday, because a plain message with a cake emoji felt far too small for you. So I built you an entire little universe instead. You know, as one does.",
        "Here's something I think somebody should say to you more often: you're the kind of person who makes everything a little brighter just by being around. The kind of friend people are genuinely glad to have in their corner.",
        "I'm really glad I know you, and I hope you already know that. But just in case — consider this entire website my way of saying it.",
        "On your birthday, I hope life is kind to you. I hope you find happiness in little things, courage when things get difficult, peace when you need it, and people who appreciate you for exactly who you are.",
        "I hope this new year of your life takes you closer to your dreams. I hope you laugh a lot, worry very little, collect wonderful stories, and get every good thing you've been quietly working towards.",
        "You deserve all of it — the good things you're wishing for, the opportunities you're chasing, and the same warmth you're always handing out to everyone else.",
        "I made this little universe with five photographs, a few words, and a lot of thought, because I wanted to give you something you could open, explore, and maybe revisit someday with a smile. Or at least a chuckle. I'll take either.",
        "I don't know if a website can explain how much a friend can value someone, but I hope this one manages to get at least a little of the point across.",
        "So today, I hope you feel celebrated, appreciated, and reminded of how special you are. It's your day — own it.",
        "Happy Birthday, Manvi.",
        "Here's to your dreams, your happiness, your beautiful memories ahead, and all the wonderful chapters still waiting for you. I'll be cheering you on the whole way.",
        "I hope this little surprise made you smile. ❤️",
      ],
    },
    short: {
      paragraphs: [
        "Happy Birthday, Manvi! ❤️",
        "A plain birthday text felt far too small for you, so I built you a tiny universe instead. Normal friend behavior, I promise.",
        "You're one of my favorite people, and I hope you know how much you're valued — today and every day.",
        "Here's to a year full of little joys, courage, laughter, and everything you've been quietly working towards.",
        "I hope this made you smile. ❤️",
      ],
    },
    playful: {
      paragraphs: [
        "Happy Birthday, Manvi. ❤️",
        "Fair warning: I may have gone slightly overboard for your birthday. A simple message felt too small — so instead I built you a tiny universe. You know, as one does.",
        "Somewhere between all the ordinary days, you became one of my favorite people. No, I'm not taking questions on that.",
        "So here's my official birthday wish for you: ridiculous amounts of laughter, beautifully random little adventures, dreams that actually come true, and cake. Lots of cake. I expect a full report on the cake.",
        "You deserve every good thing coming your way, and I hope this year treats you exactly as kindly as you deserve.",
        "I hope this little surprise made you smile. ❤️",
      ],
    },
    emotional: {
      paragraphs: [
        "Happy Birthday, Manvi. ❤️",
        "I've started this letter more times than I'd like to admit, because some things are difficult to put into words.",
        "You're one of those people who make the world feel lighter — the kind of friend who makes ordinary days better just by being part of them.",
        "On your birthday, I want you to know that you matter far more than you might realize. I hope life is gentle with you. I hope you find happiness in little things, courage when things get hard, peace when you need it, and people who see exactly how special you are.",
        "Whatever this new year brings, I hope it brings you closer to the life you dream about — and I hope you never forget how much light you carry into the lives of the people around you. Including mine.",
        "I hope this little surprise made you smile. ❤️",
      ],
    },
    romantic: {
      paragraphs: [
        "Happy Birthday, Manvi. ❤️",
        "Before I say anything else: you are worth every little star in this universe I built for you.",
        "Somewhere between all the ordinary days, you became someone I think about, someone I care about more than I usually admit, and someone whose happiness genuinely matters to me.",
        "I won't pretend to know what the future holds — but I do know this: the world is unquestionably better with you in it, and mine certainly is.",
        "I hope this year gives you everything you quietly wish for. I hope you're celebrated the way you deserve, appreciated the way you appreciate others, and loved — loudly and gently, all at once.",
        "And if you ever wonder whether you matter — you do. To more people than you know. And to me.",
        "I hope this little surprise made you smile. ❤️",
      ],
    },
  } as Record<string, LetterConfig>,

  /** Leave empty ("") to stay anonymous, or set e.g. "— from someone who cares" */
  signature: "",

  /** The palette of this little universe (also used inside the 3D world). */
  theme: {
    midnight: "#0b0926",
    deep: "#14103d",
    navy: "#1a1550",
    twilight: "#2b2168",
    blush: "#f5b8cf",
    rosy: "#e78aa8",
    lavender: "#c9a7eb",
    babyblue: "#a9c7f2",
    cream: "#f7efe2",
    gold: "#ecd9a0",
  },

  /** Music is always off until she turns it on. */
  music: {
    enabledByDefault: false,
  },
};

export type ExperienceConfig = typeof experience;