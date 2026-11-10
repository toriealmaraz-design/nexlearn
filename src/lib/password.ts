const ITERATIONS = 120_000;
const KEY_LENGTH = 32;

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" }, key, KEY_LENGTH * 8);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveKey(password, salt);
  return `${toBase64(salt)}:${toBase64(hash)}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [encodedSalt, encodedHash] = storedHash.split(":");
  if (!encodedSalt || !encodedHash) return false;

  const expected = fromBase64(encodedHash);
  const actual = await deriveKey(password, fromBase64(encodedSalt));
  if (expected.length !== actual.length) return false;
  return expected.every((byte, index) => byte === actual[index]);
}
