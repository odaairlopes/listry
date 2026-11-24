import Link from "next/link";
import { notFound } from "next/navigation";
import { BookDialog } from "@/components/dialogs";
import MoviePoster from "@/components/movie-poster";
import { movieStatus } from "@/lib/books";
import { readLibrary } from "@/lib/library";
type Props = { params: Promise<{ id: string }> };
async function findMovie({ params }: Props) {
  const { id } = await params;
  const item = (await readLibrary()).find(entry => entry.id === id);
  if (item?.kind !== "movie") notFound();
  return item;
}
export async function generateMetadata(props: Props) { return { title: (await findMovie(props)).title }; }
export default async function MoviePage(props: Props) {
  const movie = await findMovie(props);
  return <><Link className="back" href="/estante">Minha coleção</Link><article className="detail">
    <div className="detail-stage book-stage blue"><MoviePoster movie={movie}/></div>
    <div className="detail-copy"><span className="eyebrow">Filme · {movie.year}</span><h1>{movie.title}</h1>
    {movie.director && <p className="byline">Direção de {movie.director}</p>}
    <p className="detail-meta">{movieStatus[movie.status]}</p><BookDialog book={movie}/><Link className="review-link" href={{ pathname: "/criticas", query: { formato: "Filme", titulo: movie.title } }}>Escrever crítica</Link></div>
  </article></>;
}
