import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import { database } from "../src/lib/database.ts";
import { hashPassword, verifyPassword } from "../src/lib/password.ts";

nextEnv.loadEnvConfig(process.cwd(), true);
if (process.env.NODE_ENV === "production" || process.env.TURSO_DATABASE_URL || process.env.TURSO_AUTH_TOKEN || process.env.RENDER) {
  throw new Error("Use a conta de demonstração em uma instalação local de testes.");
}

const email = "demo@listry.test";
const password = "Listry-Demo-2026!";
const db = await database();
try {
  const hash = await hashPassword(password);
  const result = await db.execute({ sql: `INSERT INTO accounts (id,name,email,password_hash)
    VALUES (?,?,?,?) ON CONFLICT(email) DO NOTHING`,
    args: ["account:" + randomUUID(), "Leitor de demonstração", email, hash] });
  if (!result.rowsAffected) {
    const { rows: [account] } = await db.execute({ sql: "SELECT password_hash FROM accounts WHERE email=?", args: [email] });
    if (!await verifyPassword(password, account.password_hash)) {
      throw new Error("O e-mail de demonstração já pertence a outra conta. Use um banco de testes separado.");
    }
  }
  console.log("Conta de demonstração pronta. Entre com %s e a senha %s", email, password);
} finally {
  db.close();
}
