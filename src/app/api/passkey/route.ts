import { timingSafeEqual } from "crypto";
import { experience } from "@/config/experience";

// A gentle note on honesty: this passkey is a sweet little gate, not
// bank-grade security. It is validated on the server with a timing-safe
// comparison so the secret itself never ships to the browser.

export async function POST(request: Request) {
  let submitted = "";
  try {
    const body = (await request.json()) as { passkey?: unknown };
    if (typeof body?.passkey === "string") submitted = body.passkey;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const expected = process.env[experience.passkeyEnvKey] ?? experience.passkeyFallback;

  const a = Buffer.from(submitted, "utf8");
  const b = Buffer.from(expected, "utf8");
  const ok = a.length === b.length && timingSafeEqual(a, b);

  // A small, deliberate delay — gentle with curious guests and brute force alike.
  await new Promise((resolve) => setTimeout(resolve, 450));

  return Response.json({ ok }, { status: ok ? 200 : 401 });
}