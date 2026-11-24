import { searchLocalMovies } from "@/lib/movie-catalog";
import { z } from "zod";

const movieSchema = z.object({
  id: z.string().regex(/^tt\d{7,10}$/), name: z.string().min(1), releaseInfo: z.string().regex(/^\d{4}$/),
});
const base = "https://v3-cinemeta.strem.io";
async function metadata(path: string, timeout: number) {
  const response = await fetch(base + path, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error("Catálogo indisponível");
  return response.json() as Promise<unknown>;
}
async function director(id: string) {
  try {
    const details = await metadata(`/meta/movie/${id}.json`, 3500);
    return z.object({ meta: z.object({ director: z.array(z.string()) }) }).parse(details).meta.director.join(", ");
  } catch { return ""; }
}
export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get("q")?.trim();
  if (!term || term.length < 2 || term.length > 120) return Response.json({ error: "Digite entre 2 e 120 caracteres." }, { status: 400 });
  const local = searchLocalMovies(term);
  try {
    const data = await metadata(`/catalog/movie/top/search=${encodeURIComponent(term)}.json`, 9000);
    const { metas } = z.object({ metas: z.array(z.unknown()) }).parse(data);
    const seen = new Set<string>(local.map(movie => movie.imdbId));
    const extra = metas.flatMap(value => {
      const parsed = movieSchema.safeParse(value);
      if (!parsed.success || seen.has(parsed.data.id)) return [];
      seen.add(parsed.data.id);
      return [parsed.data];
    }).slice(0, Math.max(0, 12 - local.length));
    const movies = [...local] as { workId: string; imdbId: string; title: string; author: string; year: number }[];
    for (let i = 0; i < extra.length; i += 4) {
      movies.push(...await Promise.all(extra.slice(i, i + 4).map(async film => ({
        workId: film.id, imdbId: film.id, title: film.name, author: await director(film.id), year: Number(film.releaseInfo),
      }))));
    }
    return Response.json({ movies });
  } catch {
    if (local.length) return Response.json({ movies: local });
    return Response.json({ error: "O catálogo de filmes está indisponível. Tente novamente ou use o cadastro manual." }, { status: 503 });
  }
}
