"use client";
import { useState } from "react";
import Link from "next/link";
import { Bookmark, Grid2X2, List, Search, BookOpen, Layers3 } from "lucide-react";
import { statusLabel, type Book, movieStatus, type LibraryEntry, type MovieEntry, type Status } from "@/lib/books";
import MoviePoster from "./movie-poster";
import Cover from "./cover";
import { FavoriteButton } from "./dialogs";

type Filter = "all" | Status;
const filters: { value: Filter; title: string }[] = [{ value: "all", title: "Todos" }, { value: "reading", title: "Lendo" }, { value: "planned", title: "Quero ler" }, { value: "finished", title: "Concluídos" }];
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function BookCard({ book, entry }: { book: Book | MovieEntry; entry?: LibraryEntry }) {
  const movie = book.kind === "movie";
  const href = `/${movie ? "filmes" : "livros"}/${book.id}`;
  return <article className="book-card">
    <div className={`book-stage ${movie ? "blue" : book.tone}`}>
      <Link href={href} aria-label={`Ver ${book.title}`} className="cover-link">{movie ? <MoviePoster movie={book}/> : <Cover book={book}/>}</Link>
      {entry && <FavoriteButton book={entry}/>}
    </div>
    <div className="card-info">{entry ? <span className={`book-status ${entry.status}`}><i/>{movie ? `Filme · ${movieStatus[entry.status]}` : `Livro · ${statusLabel[entry.status]}`}</span> : <span className="book-status genre">{movie ? "Filme" : book.genre}</span>}
    <h3><Link href={href}>{book.title}</Link></h3><p>{movie ? [book.director, book.year].filter(Boolean).join(" · ") : book.author}</p></div>
  </article>;
}
export function CatalogGrid({ books }: { books: Book[] }) {
  return <div className="books-grid">{books.map(book => <BookCard key={book.id} book={book}/>)}</div>;
}
export default function Collection({ entries, full = false }: { entries: LibraryEntry[]; full?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(false);
  const [format, setFormat] = useState("all");
  const items = entries.filter(entry => format === "all" || (entry.kind ?? "book") === format);
  const visible = items.filter(book => (filter === "all" || book.status === filter) && (!favorites || book.favorite) && normalize(book.title + " " + (book.kind === "movie" ? book.director : book.author)).includes(normalize(query.trim())));
  return <section aria-label="Minha coleção" className="collection">
    {full && <div className="search-row"><label className="search-input"><Search size={18}/><input aria-label="Buscar por título, autoria ou direção" placeholder="Buscar por título, autoria ou direção" type="search" value={query} onChange={e => setQuery(e.target.value)}/></label>
      <button type="button" className="button outline" aria-pressed={favorites} onClick={() => setFavorites(!favorites)}><Bookmark size={16}/> Favoritos</button></div>}
    <label className="format-filter">Formato <select value={format} onChange={event => setFormat(event.target.value)}><option value="all">Todos os formatos</option><option value="book">Livros</option><option value="movie">Filmes</option></select></label>
    <div className="collection-tools"><div className="filters" aria-label="Filtrar por situação">{filters.map(({ value, title }) =>
      <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "planned" ? "Na fila" : value === "reading" ? "Em andamento" : title}<span>{value === "all" ? items.length : items.filter(entry => entry.status === value).length}</span></button>)}</div>
      <div className="view-toggle" aria-label="Formato de exibição">{([{ id: "grid", Icon: Grid2X2, label: "Grade" }, { id: "list", Icon: List, label: "Lista" }] as const).map(({ id, Icon, label }) => <button key={id} aria-label={label} aria-pressed={view === id} onClick={() => setView(id)}><Icon size={16}/></button>)}</div>
    </div>
    {visible.length ? <div className={view === "list" ? "books-list" : "books-grid"}>{visible.map(book => <BookCard key={book.id} book={book} entry={book}/>)}</div> :
      <div className="empty"><BookOpen size={28}/><h3>Nenhum título por aqui</h3><p>Experimente outro filtro ou adicione um título à coleção.</p></div>}
  </section>;
}
export function CollectionHeading() {
  return <div className="section-heading"><h2>Minha coleção</h2><Link href="/estante"><Layers3 size={16}/> Ver coleção completa</Link></div>;
}
