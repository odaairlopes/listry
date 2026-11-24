import "server-only";
import { createClient, type Client, type Transaction } from "@libsql/client";
import { closeSync, mkdirSync, openSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const schema = `CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      digest TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expires ON sessions(expires);
    CREATE TABLE IF NOT EXISTS auth_limits (
      bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS books (
      owner TEXT NOT NULL, id TEXT NOT NULL, book TEXT NOT NULL,
      PRIMARY KEY(owner, id)
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY, owner TEXT NOT NULL, format TEXT NOT NULL, title TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 0 AND 10), body TEXT NOT NULL CHECK(length(body) >= 250)
    );
    CREATE INDEX IF NOT EXISTS reviews_owner ON reviews(owner,id);`;
const markLegacyBooks = `UPDATE books SET book=json_set(book,'$.legacyDemo',1)
        WHERE owner IN (SELECT owner FROM books WHERE id IN ('duna','torto-arado','meia-noite','pequeno-principe')
          GROUP BY owner HAVING count(*)=4)
        AND json_extract(book,'$.cover')=id AND json_extract(book,'$.favorite')=0
        AND json_extract(book,'$.workId') IS NULL AND json_extract(book,'$.coverId') IS NULL
        AND (id,json_extract(book,'$.status'),json_extract(book,'$.page'),json_extract(book,'$.pages')) IN
          (('duna','reading',248,680),('torto-arado','planned',0,264),('meia-noite','planned',0,308),
          ('pequeno-principe','finished',96,96));`;

let connection: Promise<Client> | undefined;
async function connect() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const remote = Boolean(url || authToken || process.env.RENDER);
  let db: Client;
  if (remote) {
    if (!url || !authToken || !/^(libsql|https):\/\//.test(url)) {
      throw new Error("Configure TURSO_DATABASE_URL e TURSO_AUTH_TOKEN para o banco remoto.");
    }
    db = createClient({ url, authToken });
  } else {
    const directory = process.env.ESTANTE_DATA_DIR || path.join(process.cwd(), "data");
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const filename = path.join(directory, "estante.sqlite");
    closeSync(openSync(filename, "a", 0o600));
    db = createClient({ url: pathToFileURL(filename).href });
  }
  try {
    if (!remote) await db.execute("PRAGMA journal_mode=WAL");
    await db.executeMultiple(schema);
    // Only older local installations shipped the demo books tracked by user_version.
    if (remote) return db;
    const tx = await db.transaction("write");
    try {
      const version = await tx.execute("PRAGMA user_version");
      if (Number(version.rows[0]?.user_version) === 0) {
        await tx.execute(markLegacyBooks);
        await tx.execute("PRAGMA user_version=1");
      }
      await tx.commit();
    } finally { tx.close(); }
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}
export function database() {
  connection ??= connect().catch(error => { connection = undefined; throw error; });
  return connection;
}

export async function writeTransaction<T>(action: (tx: Transaction) => Promise<T>): Promise<T> {
  const db = await database();
  const tx = await db.transaction("write");
  try {
    const result = await action(tx);
    await tx.commit();
    return result;
  } finally { tx.close(); }
}
