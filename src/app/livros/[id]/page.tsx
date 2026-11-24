import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";
import { catalog, statusLabel } from "@/lib/books";
import { readLibrary } from "@/lib/library";
import { currentAccount } from "@/lib/auth";
import Cover from "@/components/cover";
import { BookDialog, CatalogButton } from "@/components/dialogs";
type Props = { params: Promise<{ id: string }> };
async function findBook(id: string) {
  const item = (await readLibrary()).find(item => item.id === id);
  const entry = item?.kind === "movie" ? undefined : item;
  return { entry, book: entry ?? catalog.find(item => item.id === id) };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { book } = await findBook((await params).id);
  return { title: book?.title ?? "Livro indisponível", description: book?.description || undefined };
}
export default async function BookPage({ params }: Props) {
  const { entry, book } = await findBook((await params).id);
  if (!book) notFound();
  return <><Link className="back" href={entry ? "/estante" : "/explorar"}><ChevronLeft size={16}/>{entry ? "Minha coleção" : "Explorar livros"}</Link>
    <article className="detail"><div className={`detail-stage book-stage ${book.tone}`}><Cover book={book}/></div><div className="detail-copy">
      <span className="eyebrow"><BookOpen size={15}/>{book.genre}</span><h1>{book.title}</h1><p className="byline">{book.author}</p>
      <p className="description">{book.description}</p><p className="detail-meta">{book.pages} páginas {entry && <>· {statusLabel[entry.status]}</>}</p>
      {book.workId && <p className="detail-meta"><a href={`https://openlibrary.org/works/${book.workId}`}>Ver ficha na Open Library</a></p>}
      {entry ? <><div className="detail-progress"><label>Progresso · {entry.page} de {book.pages} páginas<progress value={entry.page} max={book.pages}/></label></div><BookDialog book={entry}/></> : await currentAccount() ? <CatalogButton id={book.id}/> : <Link className="button outline" href="/conta">Entre para salvar este livro</Link>}
    <Link className="review-link" href={{ pathname: "/criticas", query: { formato: "Livro", titulo: book.title } }}>Escrever crítica</Link></div></article></>;
}
