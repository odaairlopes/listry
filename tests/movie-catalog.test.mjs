import assert from "node:assert/strict";
import test from "node:test";
import { localMovieId, searchLocalMovies } from "../src/lib/movie-catalog.ts";

test("Harry Potter retorna os oito filmes principais com direção e pôster distintos por filme", () => {
  const films = searchLocalMovies("Harry Potter");
  assert.deepEqual(films.map(film => film.year), [2001, 2002, 2004, 2005, 2007, 2009, 2010, 2011]);
  assert.equal(new Set(films.map(film => film.imdbId)).size, 8);
  assert.ok(films.every(film => film.author && /^tt\d+$/.test(film.imdbId)));
});

test("filmes antigos da seleção recuperam o pôster por título e ano", () => {
  assert.equal(localMovieId("Duna", 1984), "tt0087182");
  assert.equal(localMovieId("Duna", 2021), "tt1160419");
  assert.equal(localMovieId("Duna", 1950), undefined);
});
