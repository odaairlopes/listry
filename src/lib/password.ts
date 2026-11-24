import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

function derive(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error); else resolve(key);
    });
  });
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `s1:${salt}:${(await derive(password, salt)).toString("hex")}`;
}
export async function verifyPassword(password: string, encoded?: string) {
  const [,salt,hash] = (encoded ?? "").split(":");
  const key = await derive(password, salt || "unregistered-account");
  const expected = Buffer.from(hash || "00".repeat(64), "hex");
  return expected.length === key.length && timingSafeEqual(key, expected) && !!encoded;
}
