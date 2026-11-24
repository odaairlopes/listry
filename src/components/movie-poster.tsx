import PosterImage from "./poster-image";
import { localMovieId } from "@/lib/movie-catalog";
import { Film } from "lucide-react";
import type { MovieEntry } from "@/lib/books";
export default function MoviePoster({ movie }: { movie: MovieEntry }) {
  const fallback = <span className="type-cover blue"><small>Cinema · {movie.year}</small><strong>{movie.title}</strong><Film size={36} strokeWidth={1}/></span>;
  return <span className="physical-book"><PosterImage id={movie.imdbId ?? localMovieId(movie.title, movie.year)} fallback={fallback}/></span>;
}
