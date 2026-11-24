import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { GET } from "../src/app/api/livros/route.ts";

const request = () => new Request("http://localhost/api/livros?q=harry");
const results = () => Response.json({ docs: [{ key: "/works/OL82563W", title: "Harry Potter" }] });

test("ordena títulos relevantes, preserva autoria e aceita ISBN sem correspondência textual", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ docs: [
    { key: "OL1W", title: "A pirâmide vermelha", author_name: ["Rick Riordan"] },
    { key: "OL2W", title: "Cronicas Marcianas" },
    { key: "OL3W", title: "As Crônicas de Nárnia", editions: { docs: [{ title: "O leão e a feiticeira" }] } },
  ] }));
  async function search(term) {
    const response = await GET(new Request("http://localhost/api/livros?" + new URLSearchParams({ q: term })));
    return (await response.json()).books.map(book => book.title);
  }
  assert.deepEqual(await search("as crônicas"), ["As Crônicas de Nárnia", "Cronicas Marcianas"]);
  assert.deepEqual(await search("Rick Riordan"), ["A pirâmide vermelha"]);
  assert.equal((await search("978-0-545-01022-1")).length, 3);
});

test("aceita uma consulta que ultrapassa o antigo limite de dez segundos", async t => {
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => {
    await delay(10_100, undefined, { signal });
    return results();
  });
  const response = await GET(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).books[0].workId, "OL82563W");
});

test("repete uma conexão interrompida usando o mesmo prazo", async t => {
  const signals = [];
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => {
    signals.push(signal);
    if (signals.length === 1) throw new TypeError("fetch failed");
    return results();
  });
  assert.equal((await GET(request())).status, 200);
  assert.equal(signals.length, 2);
  assert.equal(signals[0], signals[1]);
});

test("respeita o limite do provedor e repassa Retry-After", async t => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    new Response(null, { status: 429, headers: { "Retry-After": "60" } }));
  const response = await GET(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal(fetchMock.mock.callCount(), 1);
});
