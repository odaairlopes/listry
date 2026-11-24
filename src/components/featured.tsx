import Image from "next/image";
import Link from "next/link";
import { BookOpen, Compass } from "lucide-react";
import { percentRead, type LibraryEntry } from "@/lib/books";
import { BookDialog } from "./dialogs";

export default function Featured({ book }: { book?: LibraryEntry }) {
  return <section className="featured" aria-label="Em andamento">
    <div className="hero-art"><Image src="/images/leitura.webp" alt="" fill preload sizes="(max-width: 640px) 100vw, 60vw"/></div>
    <div className="featured-copy"><span className="eyebrow"><BookOpen size={15}/>{book ? "Continuar de onde parei" : "Seu painel"}</span>
      <h2>{book ? <Link href={`/${book.kind === "movie" ? "filmes" : "livros"}/${book.id}`}>{book.title}</Link> : "Por onde começar?"}</h2>
      <p className="hero-author">{book ? (book.kind === "movie" ? `Filme · ${book.year}` : book.author) : "Quando você começar um livro ou filme, poderá continuar por aqui."}</p>
      {book?.kind === "movie" ? <BookDialog book={book}/> : book ? <><div className="reading-progress"><div><span>Página <b>{book.page}</b> de {book.pages}</span><strong>{percentRead(book)}%</strong></div><progress value={book.page} max={book.pages} aria-label="Progresso da leitura"/></div><BookDialog book={book}/></> : <Link className="button ink-button" href="/explorar"><Compass size={16}/>Explorar livros</Link>}
    </div>
  </section>;
}
