"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { catalog, statuses, type LibraryEntry } from "@/lib/books";
import { changeLibrary } from "@/lib/library";

type Result = { ok: true } | { ok: false; error: string };
class InputError extends Error {}
async function commit(change: (entries: LibraryEntry[]) => LibraryEntry): Promise<Result> {
  try {
    if (!await changeLibrary(change)) return { ok: false, error: "Entre na sua conta para alterar a coleção." };
  }
  catch (error) {
    if (error instanceof InputError) return { ok: false, error: error.message };
    console.error("Falha ao gravar a coleção", error);
    return { ok: false, error: "Não foi possível salvar. Tente novamente." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
const textField = z.string().trim().min(1).max(150);
const newBook = z.object({
  title: textField, author: textField, pages: z.coerce.number().int().min(1).max(100000),
  status: z.enum(statuses), workId: z.string().regex(/^OL\d{1,15}W$/).optional(),
  coverId: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
});
export async function addBook(form: FormData) {
  const result = newBook.safeParse(Object.fromEntries(form));
  if (!result.success) return { ok: false, error: "Confira o título, o autor e o total de páginas." } as const;
  const input = result.data;
  return commit(entries => {
    const equal = (value: string, other: string) => value.localeCompare(other, "pt-BR", { sensitivity: "base" }) === 0;
    if (entries.some(book => book.kind !== "movie" && ((input.workId && input.workId === book.workId) || (equal(book.title, input.title) && equal(book.author, input.author))))) throw new InputError("Este livro já está na sua coleção.");
    const known = catalog.find(book => equal(book.title, input.title) && equal(book.author, input.author));
    return { id: known?.id ?? randomUUID(), genre: known?.genre ?? "Acervo pessoal", tone: known?.tone ?? "sage", description: known?.description ?? "", cover: known?.cover, ...input, page: input.status === "finished" ? input.pages : 0, favorite: false };
  });
}
export async function saveCatalogBook(id: string) {
  return commit(entries => {
    const item = catalog.find(book => book.id === id);
    if (!item) throw new InputError("Livro indisponível.");
    return entries.find(book => book.id === id) ?? { ...item, status: "planned", page: 0, favorite: false };
  });
}
function requireEntry(entries: LibraryEntry[], id: string) {
  const item = entries.find(book => book.id === id);
  if (!item) throw new InputError("Este livro não está na sua coleção.");
  return item;
}
export async function setFavorite(id: string, favorite: boolean) {
  return commit(entries => {
    if (typeof favorite !== "boolean") throw new InputError("Valor inválido.");
    return { ...requireEntry(entries, id), favorite };
  });
}
export async function updateReading(id: string, form: FormData) {
  return commit(entries => {
    const book = requireEntry(entries, id);
    if (book.kind === "movie") throw new InputError("Escolha um livro.");
    const status = z.enum(statuses).safeParse(form.get("status"));
    if (!status.success) throw new InputError("Escolha uma situação de leitura.");
    const raw = form.get("page");
    const page = status.data === "finished" ? book.pages : status.data === "planned" ? 0 : Number(raw);
    if ((status.data === "reading" && (raw === null || raw === "")) || !Number.isInteger(page) || page < 0 || page > book.pages) throw new InputError("Informe uma página válida.");
    return { ...book, status: page === book.pages ? "finished" : status.data, page };
  });
}
const movieInput = z.object({
  title: textField, director: z.string().trim().max(150),
  year: z.coerce.number().int().min(1880).max(2200),
  imdbId: z.string().regex(/^tt\d{7,10}$/).optional(),
  appleId: z.string().regex(/^\d{1,16}$/).optional(), status: z.enum(statuses),
});
export async function addMovie(form: FormData) {
  const parsed = movieInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: "Confira os dados do filme e o ano de lançamento." } as const;
  const movie = parsed.data;
  return commit(entries => {
    if (entries.some(entry => entry.kind === "movie" && ((movie.imdbId && entry.imdbId === movie.imdbId) || (movie.appleId && entry.appleId === movie.appleId) ||
      (entry.year === movie.year && entry.title.localeCompare(movie.title, "pt-BR", { sensitivity: "base" }) === 0)))) {
      throw new InputError("Este filme já está na sua coleção.");
    }
    return { ...movie, kind: "movie", id: randomUUID(), favorite: false };
  });
}
export async function updateMovie(id: string, form: FormData) {
  return commit(entries => {
    const movie = requireEntry(entries, id);
    const status = z.enum(statuses).safeParse(form.get("status"));
    if (movie.kind !== "movie" || !status.success) throw new InputError("Situação inválida.");
    return { ...movie, status: status.data };
  });
}
