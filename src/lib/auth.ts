// Password-only auth. The session cookie holds an HMAC of a fixed label keyed by
// USER_PASSWORD — never the password itself — so it can't be forged without knowing it.
// Uses Web Crypto only, so it runs in both the proxy and server actions.

export const SESSION_COOKIE = "ledger_session";

const encoder = new TextEncoder();

async function hmacHex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function getPassword(): string | undefined {
  return process.env.USER_PASSWORD || undefined;
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function sessionToken(): Promise<string | null> {
  const password = getPassword();
  return password ? hmacHex(password, "ledger-session-v1") : null;
}

export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  const expected = await sessionToken();
  return !!expected && !!cookieValue && safeEqual(cookieValue, expected);
}

export async function checkPassword(input: string): Promise<boolean> {
  const password = getPassword();
  if (!password) return false; // fail closed if USER_PASSWORD is not configured
  // Hash both so lengths match and comparison is constant-time.
  const [a, b] = await Promise.all([hmacHex("cmp", input), hmacHex("cmp", password)]);
  return safeEqual(a, b);
}
