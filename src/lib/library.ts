import "server-only";
import type { Client, Transaction } from "@libsql/client";
import { database, writeTransaction } from "./database";
import { currentAccount, guestOwner, guestCookie } from "./auth";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import type { LibraryEntry } from "./books";
import type { Review } from "./reviews";

async function currentOwner() {
  return (await currentAccount())?.id ?? await guestOwner();
}

export const readLibrary = cache(async (): Promise<LibraryEntry[]> => {
  const owner = (await currentAccount())?.id;
  if (!owner) return [];
  return entriesFor(await database(), owner);
});

async function entriesFor(db: Client | Transaction, owner: string) {
  const { rows } = await db.execute({ sql: "SELECT book FROM books WHERE owner = ? AND json_extract(book, '$.legacyDemo') IS NULL ORDER BY rowid", args: [owner] });
  return rows.map(row => JSON.parse(String(row.book)) as LibraryEntry);
}

async function withOwner(write: (owner: string) => Promise<void>) {
  const existing = await currentOwner();
  const owner = existing ?? randomBytes(32).toString("hex");
  const jar = await cookies();
  await write(owner);
  if (!existing) jar.set(guestCookie, owner, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 31536000 });
}

export async function recordReview(review: Omit<Review, "id">) {
  await withOwner(async owner => {
    const db = await database();
    await db.execute({ sql: "INSERT INTO reviews(owner,format,title,rating,body) VALUES (?,?,?,?,?)",
      args: [owner, review.format, review.title, review.rating, review.body] });
  });
}
export async function readReviews(): Promise<Review[]> {
  const owner = await currentOwner();
  if (!owner) return [];
  const db = await database();
  const { rows } = await db.execute({ sql: "SELECT CAST(id AS TEXT) AS id,format,title,rating,body FROM reviews WHERE owner=? ORDER BY id DESC", args: [owner] });
  return rows.map(row => ({ id: String(row.id), format: String(row.format) as Review["format"], title: String(row.title), rating: Number(row.rating), body: String(row.body) }));
}
export async function changeLibrary(change: (entries: LibraryEntry[]) => LibraryEntry) {
  const account = await currentAccount();
  if (!account) return false;
  await writeTransaction(async tx => {
    const entry = change(await entriesFor(tx, account.id));
    await tx.execute({ sql: "INSERT INTO books(owner,id,book) VALUES (?,?,?) ON CONFLICT(owner,id) DO UPDATE SET book=excluded.book",
      args: [account.id, entry.id, JSON.stringify(entry)] });
  });
  return true;
}
