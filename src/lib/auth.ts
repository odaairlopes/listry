import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import type { Transaction, Client } from "@libsql/client";
import { database, writeTransaction } from "./database";
import { hashPassword, verifyPassword } from "./password";

export const guestCookie = "estante-leitor";
const sessionCookie = "listry-session";
const lifetime = 30 * 86400;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
type Account = { id: string; name: string; email: string };

export async function guestOwner() {
  const token = (await cookies()).get(guestCookie)?.value;
  return token && /^[a-f0-9]{64}$/.test(token) ? token : undefined;
}
export const currentAccount = cache(async (): Promise<Account | undefined> => {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return undefined;
  const db = await database();
  const { rows } = await db.execute({ sql: `SELECT a.id,a.name,a.email FROM accounts a JOIN sessions s ON s.account_id=a.id
    WHERE s.digest=? AND s.expires>?`, args: [digest(token), Date.now()] });
  const row = rows[0];
  return row && { id: String(row.id), name: String(row.name), email: String(row.email) };
});

export async function allowAttempt(email: string, mode: "register" | "login") {
  const now = Date.now();
  const db = await database();
  const [, result] = await db.batch([
    { sql: "DELETE FROM auth_limits WHERE expires<=?", args: [now] },
    { sql: `INSERT INTO auth_limits VALUES (?,1,?)
      ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1 WHERE attempts<10`,
      args: [mode + ":" + digest(email), now + 15 * 60_000] },
  ], "write");
  return result.rowsAffected === 1;
}
async function createSession(db: Transaction | Client, accountId: string) {
  const token = randomBytes(32).toString("hex");
  await db.execute({ sql: "DELETE FROM sessions WHERE expires<=?", args: [Date.now()] });
  await db.execute({ sql: "INSERT INTO sessions VALUES (?,?,?)", args: [digest(token), accountId, Date.now() + lifetime * 1000] });
  return token;
}
async function setSession(token: string) {
  (await cookies()).set(sessionCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: lifetime });
}
export async function register(name: string, email: string, password: string) {
  const guest = await guestOwner();
  const encoded = await hashPassword(password);
  const accountId = "account:" + randomUUID();
  const token = await writeTransaction(async tx => {
    const result = await tx.execute({ sql: "INSERT INTO accounts VALUES (?,?,?,?) ON CONFLICT(email) DO NOTHING",
      args: [accountId, name, email, encoded] });
    if (!result.rowsAffected) return;
    if (guest) {
      await tx.execute({ sql: "UPDATE books SET owner=? WHERE owner=?", args: [accountId, guest] });
      await tx.execute({ sql: "UPDATE reviews SET owner=? WHERE owner=?", args: [accountId, guest] });
    }
    return createSession(tx, accountId);
  });
  if (!token) return false;
  await setSession(token);
  (await cookies()).delete(guestCookie);
  return true;
}
export async function login(email: string, password: string) {
  const db = await database();
  const { rows } = await db.execute({ sql: "SELECT id,password_hash FROM accounts WHERE email=?", args: [email] });
  const account = rows[0];
  if (!await verifyPassword(password, account ? String(account.password_hash) : undefined) || !account) return false;
  await setSession(await createSession(db, String(account.id)));
  await db.execute({ sql: "DELETE FROM auth_limits WHERE bucket=?", args: ["login:" + digest(email)] });
  return true;
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token) {
    const db = await database();
    await db.execute({ sql: "DELETE FROM sessions WHERE digest=?", args: [digest(token)] });
  }
  jar.delete(sessionCookie);
}
