/**
 * Reads the passkey for test scripts from the environment or .env.local,
 * so the real secret never has to live inside the repository.
 */
import { existsSync, readFileSync } from "node:fs";

export function readPasskey() {
  if (process.env.PASSKEY) return process.env.PASSKEY;
  if (existsSync(".env.local")) {
    const match = readFileSync(".env.local", "utf8").match(/^PASSKEY=(.*)$/m);
    if (match) return match[1].trim();
  }
  throw new Error(
    "No passkey found. Set PASSKEY in your environment or create .env.local first."
  );
}