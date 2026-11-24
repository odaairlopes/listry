const movies = [
  ["Duna", "Denis Villeneuve", 2021, "Dune", "tt1160419"],
  ["Duna", "David Lynch", 1984, "Dune", "tt0087182"],
  ["Duna: Parte Dois", "Denis Villeneuve", 2024, "Dune Part Two", "tt15239678"],
  ["Matrix", "Lana Wachowski e Lilly Wachowski", 1999, "The Matrix", "tt0133093"],
  ["Interestelar", "Christopher Nolan", 2014, "Interstellar", "tt0816692"],
  ["A Origem", "Christopher Nolan", 2010, "Inception", "tt1375666"],
  ["Central do Brasil", "Walter Salles", 1998, "Central Station", "tt0140888"],
  ["Ainda Estou Aqui", "Walter Salles", 2024, "I'm Still Here", "tt14961016"],
  ["Cidade de Deus", "Fernando Meirelles e Kátia Lund", 2002, "City of God", "tt0317248"],
  ["O Auto da Compadecida", "Guel Arraes", 2000, "", "tt0271383"],
  ["Harry Potter e a Pedra Filosofal", "Chris Columbus", 2001, "Harry Potter and the Philosopher's Stone", "tt0241527"],
  ["Harry Potter e a Câmara Secreta", "Chris Columbus", 2002, "Harry Potter and the Chamber of Secrets", "tt0295297"],
  ["Harry Potter e o Prisioneiro de Azkaban", "Alfonso Cuarón", 2004, "Harry Potter and the Prisoner of Azkaban", "tt0304141"],
  ["Harry Potter e o Cálice de Fogo", "Mike Newell", 2005, "Harry Potter and the Goblet of Fire", "tt0330373"],
  ["Harry Potter e a Ordem da Fênix", "David Yates", 2007, "Harry Potter and the Order of the Phoenix", "tt0373889"],
  ["Harry Potter e o Enigma do Príncipe", "David Yates", 2009, "Harry Potter and the Half-Blood Prince", "tt0417741"],
  ["Harry Potter e as Relíquias da Morte: Parte 1", "David Yates", 2010, "Harry Potter and the Deathly Hallows: Part 1", "tt0926084"],
  ["Harry Potter e as Relíquias da Morte: Parte 2", "David Yates", 2011, "Harry Potter and the Deathly Hallows: Part 2", "tt1201607"],
] as const;

const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
export function searchLocalMovies(term: string) {
  return movies.filter(([title, director, , alias]) =>
    normalize([title, director, alias].join(" ")).includes(normalize(term))
  ).map(([title, author, year, , imdbId]) => ({ workId: imdbId, imdbId, title, author, year }));
}
export function localMovieId(title: string, year: number) {
  return movies.find(movie => normalize(movie[0]) === normalize(title) && movie[2] === year)?.[4];
}
