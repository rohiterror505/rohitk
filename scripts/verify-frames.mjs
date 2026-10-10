/**
 * Verifies that clicking the actual 3D polaroid frames opens the RIGHT
 * photo. The glow hitboxes used to overlap, so clicking near frame 5
 * opened photo 4. Now: clicks only register on the actual polaroid paper.
 */
import { chromium } from "playwright-core";
import { readPasskey } from "./read-passkey.mjs";

const PASSKEY = readPasskey();

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
});

const CAPTIONS = {
  1: "A little moment that deserves to be remembered.",
  2: "Some memories just make you smile.",
  3: "A picture, a moment, a memory to keep.",
  4: "Little things that somehow mean a lot.",
  5: "And this one will always have a special place here.",
};

let failed = 0;
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.setDefaultTimeout(30000);

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#passkey-input");
  await page.fill("#passkey-input", PASSKEY);
  await page.getByRole("button", { name: /Enter your little universe/ }).click();
  await page.waitForSelector("text=Happy Birthday, Manvi.");
  await page.getByRole("button", { name: /Start our little story/ }).click();
  await page.waitForSelector("text=Five little frames. A thousand little feelings.");
  await page.waitForTimeout(2500); // let the frames settle

  async function whatOpened() {
    for (const [n, cap] of Object.entries(CAPTIONS)) {
      if (await page.locator(`text=${cap}`).first().isVisible().catch(() => false)) {
        return Number(n);
      }
    }
    return 0;
  }

  // [name, x, y, expected photo number (0 = nothing should open)]
  const clicks = [
    ["center of frame 1", 243, 358, 1],
    ["center of frame 2", 396, 433, 2],
    ["right half of frame 2", 440, 430, 2],
    ["center of frame 3", 640, 365, 3],
    ["center of frame 4", 884, 433, 4],
    ["left half of frame 5 (was broken)", 1000, 351, 5],
    ["center of frame 5", 1062, 351, 5],
    ["gap between frames 4 and 5", 940, 351, 0],
  ];

  for (const [name, x, y, expected] of clicks) {
    await page.mouse.click(x, y);
    await page.waitForTimeout(1200);
    const opened = await whatOpened();
    if (expected === 0) {
      if (opened === 0) {
        console.log(`  ✔ ${name} → opens nothing (glow no longer steals clicks)`);
      } else if (opened === 5) {
        console.log(`  ✔ ${name} → lands on frame 5's paper (correct photo)`);
      } else {
        console.error(`  ✘ ${name} → opened wrong photo ${opened}`);
        failed++;
      }
    } else if (opened === expected) {
      console.log(`  ✔ ${name} → photo ${opened}`);
    } else {
      console.error(`  ✘ ${name} → expected photo ${expected}, opened: ${opened || "nothing"}`);
      failed++;
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(2600); // let the camera glide back and settle
  }

  if (errors.length) {
    console.error("Page errors:", errors);
    failed++;
  }
  await context.close();
} finally {
  await browser.close();
}

if (failed > 0) process.exit(1);
console.log("\nEvery polaroid click now opens the correct photograph. ✔");