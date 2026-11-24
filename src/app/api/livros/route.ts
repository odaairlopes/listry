import { z } from "zod";
import type { BookMatch } from "@/lib/book-search";

const workSchema = z.object({
  key: z.string().regex(/^(?:\/works\/)?OL\d+W$/),
  title: z.string().trim().min(1),
  author_name: z.array(z.string()).optional(),
  cover_i: z.number().int().positive().optional().catch(undefined),
  first_publish_year: z.number().int().optional().catch(undefined),
  number_of_pages_median: z.number().int().min(1).max(100000).optional().catch(undefined),
  editions: z.object({
    docs: z.array(z.object({ title: z.string().optional(), cover_i: z.number().int().positive().optional().catch(undefined) })),
  }).optional().catch(undefined),
});
const responseSchema = z.object({ docs: z.array(z.unknown()) });

const searchTimeoutMs = 30_000;
const transientStatus = new Set([502, 503, 504]);
const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const articles = new Set(["o", "a", "os", "as", "de", "do", "da", "dos", "das", "e"]);

function relevance(value: string, phrase: string, words: string[]) {
  const field = normalize(value);
  if (!field || !phrase) return 0;
  if (field === phrase) return 4;
  if (field.startsWith(phrase)) return 3;
  if ((" " + field).includes(" " + phrase)) return 2;
  const tokens = field.split(" ");
  return words.every(word => tokens.some(token => token.startsWith(word))) ? 1 : 0;
}

async function fetchCatalog(params: URLSearchParams, signal: AbortSignal) {
  const url = `https://openlibrary.org/search.json?${params}`;
  const fetchOnce = () => fetch(url, {
    headers: { "User-Agent": "Listry/1.0", Accept: "application/json" },
    next: { revalidate: 3600 },
    signal,
  });
  try {
    const response = await fetchOnce();
    if (!transientStatus.has(response.status) || response.headers.has("Retry-After")) return response;
    await response.body?.cancel();
  } catch (error) {
    if (!(error instanceof TypeError) || signal.aborted) throw error;
  }
  signal.throwIfAborted();
  return fetchOnce();
}

export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get("q")?.trim();
  if (!term || term.length < 2 || term.length > 120) {
    return Response.json({ error: "Digite entre 2 e 120 caracteres." }, { status: 400 });
  }

  const isbn = term.replace(/[\s-]/g, "");
  const isIsbn = /^(?:\d{9}[\dXx]|\d{13})$/.test(isbn);
  const query = isIsbn ? `isbn:${isbn.toUpperCase()}` : term;
  const phrase = normalize(term);
  const keywords = phrase.split(" ").filter(word => !articles.has(word));
  const words = keywords.length ? keywords : phrase.split(" ");
  const params = new URLSearchParams({
    q: query, lang: "pt", limit: isIsbn ? "8" : "32",
    fields: "key,title,author_name,first_publish_year,cover_i,number_of_pages_median,editions,editions.title,editions.cover_i",
  });

  const deadline = AbortSignal.timeout(searchTimeoutMs);
  try {
    const response = await fetchCatalog(params, deadline);
    if (!response.ok) {
      console.warn("Busca na Open Library", { upstreamStatus: response.status });
      const limited = response.status === 429;
      const retryAfter = response.headers.get("Retry-After");
      return Response.json({
        error: limited ? "A Open Library recebeu muitas consultas. Aguarde um pouco e tente novamente." : "A Open Library está indisponível. Tente novamente ou use o cadastro manual.",
      }, { status: limited ? 429 : 503, headers: retryAfter ? { "Retry-After": retryAfter } : undefined });
    }
    const { docs } = responseSchema.parse(await response.json());
    const matches: { book: BookMatch; score: number }[] = [];
    for (const doc of docs) {
      const result = workSchema.safeParse(doc);
      if (!result.success) continue;
      const work = result.data;
      const editionTitle = work.editions?.docs[0]?.title?.trim() || work.title;
      const editionScore = relevance(editionTitle, phrase, words);
      const workScore = relevance(work.title, phrase, words);
      const author = work.author_name?.join(", ") ?? "";
      const score = Math.max(workScore, editionScore, relevance(author, phrase, words));
      if (!isIsbn && !score) continue;
      const book: BookMatch = {
        workId: work.key.replace("/works/", ""),
        title: workScore > editionScore ? work.title : editionTitle,
        author,
        year: work.first_publish_year, pages: work.number_of_pages_median, coverId: work.editions?.docs[0]?.cover_i ?? work.cover_i,
      };
      matches.push({ book, score });
    }
    matches.sort((a, b) => b.score - a.score);
    return Response.json({ books: matches.slice(0, 8).map(match => match.book) });
  } catch (error) {
    console.warn("Falha na busca da Open Library", { reason: deadline.aborted ? "timeout" : error instanceof Error ? error.name : "unknown" });
    if (deadline.aborted) return Response.json({ error: "A busca demorou mais de 30 segundos. Tente um título mais específico ou use o cadastro manual." }, { status: 504 });
    return Response.json({ error: "A Open Library está indisponível. Tente novamente ou use o cadastro manual." }, { status: 503 });
  }
}
