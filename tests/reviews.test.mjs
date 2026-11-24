import assert from "node:assert/strict";
import test from "node:test";
import { formats, reviewSchema } from "../src/lib/reviews.ts";

test("cada formato exige nota e pelo menos 250 caracteres após aparar espaços", () => {
  for (const format of formats) {
    const input = { format, title: "Obra", rating: "0", body: "a".repeat(250) };
    assert.ok(reviewSchema.safeParse(input).success);
    for (const patch of [{ rating: "" }, { rating: "11" }, { title: " " }, { body: " " + "a".repeat(249) }]) {
      assert.equal(reviewSchema.safeParse({ ...input, ...patch }).success, false);
    }
  }
});
