/**
 * A full walk-through of Manvi's little universe in a real browser.
 * Run: node scripts/smoke.mjs   (server must be running on :3000)
 */
import { chromium } from "playwright-core";
import { readPasskey } from "./read-passkey.mjs";

const PASSKEY = readPasskey();
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const consoleErrors = [];
let passed = 0;
let failed = 0;

function ok(name) {
  passed++;
  console.log(`  ✔ ${name}`);
}
function fail(name, error) {
  failed++;
  console.error(`  ✘ ${name}\n    ${error}`);
}

async function step(name, fn) {
  try {
    await fn();
    ok(name);
  } catch (error) {
    fail(name, error.message?.split("\n")[0]);
    throw error;
  }
}

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
});

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  page.on("console", (msg) => {
    // the 401 is the intentional wrong-passkey rejection — expected, not an error
    if (msg.type() === "error" && !msg.text().includes("401")) {
      consoleErrors.push(`[console] ${msg.text()}`);
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(`[pageerror] ${error}`));
  page.setDefaultTimeout(30000);

  console.log("\n— The little universe walk-through —\n");

  await step("page loads with the right title", async () => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#passkey-input");
    if (!(await page.title()).includes("Manvi")) throw new Error("wrong title");
  });

  await step("the 3D canvas is alive", async () => {
    const canvas = page.locator("canvas");
    if ((await canvas.count()) < 1) throw new Error("no canvas found");
  });

  await step("wrong passkey is rejected with a gentle nudge", async () => {
    await page.fill("#passkey-input", "not-the-secret");
    await page.getByRole("button", { name: /Enter your little universe/ }).click();
    await page.waitForSelector("text=not quite");
  });

  await step("correct passkey opens the portal", async () => {
    await page.fill("#passkey-input", PASSKEY);
    await page.getByRole("button", { name: /Enter your little universe/ }).click();
    await page.waitForSelector("text=Happy Birthday, Manvi.", { timeout: 40000 });
  });

  await step("welcome scene shows the birthday date", async () => {
    await page.waitForSelector("text=11.10.2002");
  });

  await step("the story begins → gallery", async () => {
    await page.getByRole("button", { name: /Start our little story/ }).click();
    await page.waitForSelector("text=Five little frames. A thousand little feelings.");
  });

  await step("lightbox opens with the right caption + sparkles", async () => {
    await page.locator("[aria-label='Open memory 3']").click();
    await page.waitForSelector("text=A picture, a moment, a memory to keep.");
  });

  await step("arrow keys move between photos", async () => {
    await page.keyboard.press("ArrowRight");
    await page.waitForSelector("text=Little things that somehow mean a lot.");
    await page.keyboard.press("ArrowLeft");
    await page.waitForSelector("text=A picture, a moment, a memory to keep.");
  });

  await step("escape closes the lightbox", async () => {
    await page.keyboard.press("Escape");
    await page.waitForSelector("text=Five little frames", { timeout: 10000 });
  });

  await step("gallery → constellation", async () => {
    await page.getByRole("button", { name: /look at the stars/ }).click();
    await page.waitForSelector("text=Some moments stay with us.");
  });

  await step("a star reveals its typewriter message", async () => {
    await page.locator("[aria-label='Star memory 2']").click();
    await page.waitForSelector("text=A little snapshot of a day worth remembering.");
    await page.getByRole("button", { name: /Back to the stars/ }).click();
  });

  await step("constellation → heart garden", async () => {
    await page.getByRole("button", { name: /garden waiting for you/ }).click();
    await page.waitForSelector("text=The little heart garden");
  });

  await step("all five garden surprises can be discovered", async () => {
    for (const label of [
      "A glowing pink heart",
      "A lavender flower",
      "A tiny star",
      "A butterfly",
      "A small gift box",
    ]) {
      await page.locator(`[aria-label='${label}']`).click();
      await page.waitForTimeout(150);
    }
    await page.waitForSelector("text=5 of 5 little surprises discovered.");
  });

  await step("garden messages open in glass cards", async () => {
    await page.locator("[aria-label='A small gift box']").click();
    await page.waitForSelector("text=explore a little");
    await page.getByRole("button", { name: /Keep exploring/ }).click();
  });

  await step("garden → cake", async () => {
    await page.getByRole("button", { name: /One more little thing/ }).click();
    await page.waitForSelector("text=wish time");
  });

  await step("make a wish, then blow the candles out", async () => {
    await page.getByRole("button", { name: /Make a little wish/ }).click();
    await page.getByRole("button", { name: /Blow out the candles/ }).click({ timeout: 15000 });
    await page.waitForSelector("text=May this year bring you more happiness");
  });

  await step("cake → letter", async () => {
    await page.getByRole("button", { name: /There's a letter for you/ }).click();
    await page.waitForSelector("text=wanted to say");
  });

  await step("the letter opens and unfolds", async () => {
    await page.getByRole("button", { name: /Open your letter/ }).click();
    await page.waitForSelector("text=I wanted to do something a little different");
  });

  await step("the whole letter can be read (scroll reveal)", async () => {
    const last = page.locator("text=I hope this little surprise made you smile").first();
    await last.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await last.waitFor({ state: "visible" });
  });

  await step("the letter can be read again", async () => {
    await page.getByRole("button", { name: /Read it again/ }).click();
    await page.waitForSelector("text=I wanted to do something a little different");
  });

  await step("letter → final gift", async () => {
    await page.getByRole("button", { name: /One last little surprise/ }).click();
    await page.waitForSelector("text=one last little surprise");
  });

  await step("the final gift opens", async () => {
    await page.getByRole("button", { name: /Open your final surprise/ }).click();
    await page.waitForSelector("text=your happiness matters", { timeout: 40000 });
  });

  await step("the final credit appears", async () => {
    await page.waitForSelector("text=Made with lots of care", { timeout: 40000 });
  });

  await step("gift → finale", async () => {
    await page.getByRole("button", { name: /Stay a little longer/ }).click();
    await page.waitForSelector("text=This little universe is yours", { timeout: 40000 });
    await page.waitForSelector("text=Created especially for Manvi");
  });

  await step("finale: visit my memories works", async () => {
    await page.getByRole("button", { name: /Visit my memories/ }).click();
    await page.waitForSelector("text=Five little frames");
  });

  await step("navigation dots can revisit the letter", async () => {
    await page.locator("[aria-label='Return to The letter']").click();
    await page.waitForSelector("text=I hope this little surprise made you smile", { timeout: 30000 });
  });

  await step("music begins by itself after her first interaction", async () => {
    // the passkey click above was her first interaction — audio should already be on
    await page.waitForSelector("[aria-pressed='true']");
  });

  await step("music can be muted and unmuted", async () => {
    await page.getByRole("button", { name: /Mute the music/ }).click();
    await page.waitForSelector("[aria-pressed='false']");
    await page.getByRole("button", { name: /Unmute the music/ }).click();
    await page.waitForSelector("[aria-pressed='true']");
  });

  await step("finale: replay resets the whole universe", async () => {
    await page.locator("[aria-label='Return to Home']").click();
    await page.waitForSelector("text=This little universe is yours");
    await page.getByRole("button", { name: /Replay your little universe/ }).click();
    await page.waitForSelector("text=Happy Birthday, Manvi.", { timeout: 40000 });
    await page.waitForSelector("text=11.10.2002");
  });

  await step("after replay, the garden is reset", async () => {
    // walk forward quickly through nav dots to the garden
    await page.getByRole("button", { name: /Start our little story/ }).click();
    await page.waitForSelector("text=Five little frames"); // wait for arrival first
    await page.locator("[aria-label='Return to The heart garden']").click();
    await page.waitForSelector("text=0 of 5 little surprises discovered");
  });

  await context.close();

  console.log("\n— Mobile storybook check —\n");

  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  mobilePage.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[mobile console] ${msg.text()}`);
  });
  mobilePage.on("pageerror", (error) => consoleErrors.push(`[mobile pageerror] ${error}`));
  mobilePage.setDefaultTimeout(30000);

  await step("mobile: page loads and unlocks", async () => {
    await mobilePage.goto(BASE, { waitUntil: "domcontentloaded" });
    await mobilePage.waitForSelector("#passkey-input");
    await mobilePage.fill("#passkey-input", PASSKEY);
    await mobilePage.getByRole("button", { name: /Enter your little universe/ }).tap();
    await mobilePage.waitForSelector("text=Happy Birthday, Manvi.", { timeout: 40000 });
  });

  await step("mobile: story starts into the gallery", async () => {
    await mobilePage.getByRole("button", { name: /Start our little story/ }).tap();
    await mobilePage.waitForSelector("text=Five little frames");
    // swipe-friendly hint visible
    await mobilePage.locator("[aria-label='Open memory 5']").tap();
    await mobilePage.waitForSelector("text=will always have a special place here");
    await mobilePage.keyboard.press("Escape");
  });

  await mobileContext.close();
} finally {
  await browser.close();
}

console.log(`\n— Summary: ${passed} passed, ${failed} failed —`);
if (consoleErrors.length > 0) {
  console.error(`\nConsole errors (${consoleErrors.length}):`);
  consoleErrors.slice(0, 20).forEach((e) => console.error(`  ${e}`));
  process.exit(1);
}
if (failed > 0) process.exit(1);
console.log("\nNo console errors. Her little universe works. ❤️\n");