/**
 * Extra QA: screenshots of every scene, reduced-motion flow, and the
 * no-WebGL storybook fallback. Run: node scripts/qa-visual.mjs
 */
import { chromium } from "playwright-core";
import { mkdirSync, statSync } from "node:fs";
import { readPasskey } from "./read-passkey.mjs";

const PASSKEY = readPasskey();

const BASE = "http://localhost:3000";
const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });

let failed = 0;
const consoleErrors = [];

async function shot(page, name) {
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path });
  const kb = Math.round(statSync(path).size / 1024);
  console.log(`  📸 ${name}.png (${kb} KB)`);
  if (kb < 8) {
    console.error(`  ✘ ${name}.png looks suspiciously empty (${kb} KB)`);
    failed++;
  }
}

function wire(page, label) {
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("401")) {
      consoleErrors.push(`[${label}] ${m.text()}`);
    }
  });
  page.on("pageerror", (e) => consoleErrors.push(`[${label}] ${e}`));
}

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
});

/* ── 1. the visual walk ─────────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  wire(page, "visual");
  page.setDefaultTimeout(45000);

  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#passkey-input");
  await page.waitForTimeout(6000); // let the intro lines arrive
  await shot(page, "01-passkey");

  await page.fill("#passkey-input", PASSKEY);
  await page.getByRole("button", { name: /Enter your little universe/ }).click();
  await page.waitForSelector("text=Happy Birthday, Manvi.");
  await page.waitForTimeout(5000); // let all three lines land
  await shot(page, "02-welcome");

  await page.getByRole("button", { name: /Start our little story/ }).click();
  await page.waitForSelector("text=Five little frames");
  await page.waitForTimeout(2500);
  await shot(page, "03-gallery");

  await page.locator("[aria-label='Open memory 3']").click();
  await page.waitForSelector("text=A picture, a moment, a memory to keep.");
  await page.waitForTimeout(600);
  await shot(page, "04-gallery-lightbox");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /look at the stars/ }).click();
  await page.waitForSelector("text=Some moments stay with us.");
  await page.waitForTimeout(2000);
  await shot(page, "05-constellation");

  await page.locator("[aria-label='Star memory 5']").click();
  await page.waitForSelector("text=One of those memories that stays warm.");
  await page.waitForTimeout(500);
  await shot(page, "06-constellation-star");
  await page.getByRole("button", { name: /Back to the stars/ }).click();

  await page.getByRole("button", { name: /garden waiting for you/ }).click();
  await page.waitForSelector("text=The little heart garden");
  await page.waitForTimeout(2000);
  await shot(page, "07-garden");

  await page.locator("[aria-label='A glowing pink heart']").click();
  await page.waitForSelector("text=reasons to smile");
  await page.waitForTimeout(700);
  await shot(page, "08-garden-message");
  await page.getByRole("button", { name: /Keep exploring/ }).click();

  await page.getByRole("button", { name: /One more little thing/ }).click();
  await page.waitForSelector("text=wish time");
  await page.waitForTimeout(1800);
  await shot(page, "09-cake");

  await page.getByRole("button", { name: /Make a little wish/ }).click();
  await page.waitForSelector("button:has-text('Blow out the candles')");
  await page.waitForTimeout(2200); // fireflies gather
  await shot(page, "10-cake-wished");

  await page.getByRole("button", { name: /Blow out the candles/ }).click();
  await page.waitForSelector("text=May this year bring you more happiness");
  await page.waitForTimeout(1400); // confetti flying
  await shot(page, "11-cake-blown");

  await page.getByRole("button", { name: /There's a letter for you/ }).click();
  await page.waitForSelector("text=wanted to say");
  await page.waitForTimeout(1500);
  await shot(page, "12-letter-closed");

  await page.getByRole("button", { name: /Open your letter/ }).click();
  await page.waitForSelector("text=I wanted to do something a little different");
  await page.waitForTimeout(1800);
  await shot(page, "13-letter-open");

  await page.getByRole("button", { name: /One last little surprise/ }).click();
  await page.waitForSelector("text=one last little surprise");
  await page.waitForTimeout(1200);
  await shot(page, "14-gift");

  await page.getByRole("button", { name: /Open your final surprise/ }).click();
  await page.waitForSelector("text=your happiness matters", { timeout: 40000 });
  await page.waitForTimeout(3500);
  await shot(page, "15-gift-open");

  await page.getByRole("button", { name: /Stay a little longer/ }).click();
  await page.waitForSelector("text=This little universe is yours", { timeout: 40000 });
  await page.waitForTimeout(2500);
  await shot(page, "16-finale");

  await context.close();
}

/* ── 2. reduced motion ─────────────────────────────────────────── */
{
  console.log("\n— reduced motion —");
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  wire(page, "reduce");
  page.setDefaultTimeout(45000);

  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#passkey-input");
  await page.fill("#passkey-input", PASSKEY);
  await page.getByRole("button", { name: /Enter your little universe/ }).click();
  await page.waitForSelector("text=Happy Birthday, Manvi.", { timeout: 20000 });
  await page.getByRole("button", { name: /Start our little story/ }).click();
  await page.waitForSelector("text=Five little frames", { timeout: 20000 });
  console.log("  ✔ reduced-motion flow works with snappy transitions");
  await shot(page, "17-reduced-motion-gallery");
  await context.close();
}

/* ── 3. no WebGL → storybook fallback ─────────────────────────── */
{
  console.log("\n— no-WebGL fallback —");
  const fallbackBrowser = await chromium.launch({
    channel: "msedge",
    headless: true,
    args: ["--disable-webgl", "--disable-webgl2"],
  });
  const context = await fallbackBrowser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  wire(page, "fallback");
  page.setDefaultTimeout(45000);

  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#fallback-passkey");
  const canvasCount = await page.locator("canvas").count();
  if (canvasCount !== 0) {
    console.error(`  ✘ expected no canvas in fallback, found ${canvasCount}`);
    failed++;
  }
  await page.fill("#fallback-passkey", PASSKEY);
  await page.getByRole("button", { name: /Enter your little universe/ }).click();
  await page.waitForSelector("text=Happy Birthday, Manvi.");
  await page.waitForSelector("text=Five little frames. A thousand little feelings.");
  await page.waitForSelector("text=wanted to say");
  await page.waitForSelector("text=Created especially for Manvi");
  console.log("  ✔ storybook fallback: full journey readable without WebGL");
  await shot(page, "18-fallback-letter");
  await context.close();
  await fallbackBrowser.close();
}

/* ── 4. mobile screenshots ─────────────────────────────────────── */
{
  console.log("\n— mobile —");
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  wire(page, "mobile");
  page.setDefaultTimeout(45000);

  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#passkey-input");
  await page.waitForTimeout(5500);
  await shot(page, "19-mobile-passkey");

  await page.fill("#passkey-input", PASSKEY);
  await page.getByRole("button", { name: /Enter your little universe/ }).tap();
  await page.waitForSelector("text=Happy Birthday, Manvi.", { timeout: 40000 });
  await page.waitForTimeout(4500);
  await shot(page, "20-mobile-welcome");

  await page.getByRole("button", { name: /Start our little story/ }).tap();
  await page.waitForSelector("text=Five little frames");
  await page.waitForTimeout(2000);
  await shot(page, "21-mobile-gallery");

  await page.locator("[aria-label='Open memory 2']").tap();
  await page.waitForSelector("text=Some memories just make you smile.");
  await page.waitForTimeout(600);
  await shot(page, "22-mobile-lightbox");

  await context.close();
}

await browser.close();

console.log(`\n— QA summary: ${failed} visual failures —`);
if (consoleErrors.length > 0) {
  console.error(`\nConsole errors (${consoleErrors.length}):`);
  consoleErrors.slice(0, 15).forEach((e) => console.error(`  ${e}`));
  process.exit(1);
}
if (failed > 0) process.exit(1);
console.log("\nVisual QA complete. Screenshots saved to ./screenshots ❤️");