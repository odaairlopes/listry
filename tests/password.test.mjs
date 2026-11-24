import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/lib/password.ts";
test("a mesma senha recebe sais independentes e somente a senha correta autentica", async () => {
  const password = "uma frase de teste longa";
  const hash = await hashPassword(password);
  assert.notEqual(hash, await hashPassword(password));
  assert.ok(await verifyPassword(password, hash));
  assert.equal(await verifyPassword("uma frase incorreta", hash), false);
  assert.equal(await verifyPassword(password), false);
});
