"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { notify, Spinner } from "./feedback";
import ImportedCover from "./imported-cover";
import PosterImage from "./poster-image";
import { BookOpen, Film, Search } from "lucide-react";
import type { BookMatch } from "@/lib/book-search";

export default function BookSearch({ onSelect, movie = false }: { movie?: boolean; onSelect: (book: BookMatch) => void }) {
  const item = movie ? "filme" : "livro";
  const provider = movie ? "Buscar no catálogo de filmes" : "Buscar";
  const Icon = movie ? Film : BookOpen;
  const active = useRef<AbortController | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<BookMatch[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => () => active.current?.abort(), []);

  function reportError(message: string) {
    setMessage(message);
    notify(message, "error");
  }
  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active.current || query.trim().length < 2) return;
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setBooks([]);
    setMessage("");
    try {
      const params = new URLSearchParams({ q: query.trim() });
      const response = await fetch(`/api/${movie ? 'filmes' : 'livros'}?${params}`, { signal: controller.signal });
      if (!response.ok) {
        const failure: { error?: string } = await response.json();
        if (!controller.signal.aborted) reportError(failure.error || "Não foi possível consultar o catálogo. Tente novamente.");
        return;
      }
      const data: { books?: BookMatch[]; movies?: BookMatch[] } = await response.json();
      if (controller.signal.aborted) return;
      const results = (movie ? data.movies : data.books) ?? [];
      setBooks(results);
      notify(results.length ? "Busca concluída." : "Nenhum resultado encontrado.", results.length ? "success" : "info");
      setMessage(results.length ? `Selecione um ${item} para conferir os dados.` : `Nenhum ${item} encontrado. Tente outro termo ou use o cadastro manual.`);
    } catch {
      if (!controller.signal.aborted) reportError("Não foi possível consultar o catálogo. Tente novamente ou use o cadastro manual.");
    } finally {
      if (active.current === controller) active.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return <>
    <form onSubmit={search} aria-busy={loading}>
      <label>{provider}<input type="search" disabled={loading} value={query} onChange={event => {
        setQuery(event.target.value);
        setBooks([]);
        setMessage("");
      }} placeholder={movie ? "Nome do filme" : "Título, autor ou ISBN"} minLength={2} maxLength={120} required/></label>
      <button className="button ink-button" disabled={loading || query.trim().length < 2}>{loading ? <Spinner/> : <Search size={16}/>}{loading ? "Buscando…" : `Buscar ${item}s`}</button>
    </form>
    <p className="search-feedback" role="status">{loading ? "Consultando o catálogo…" : message}</p>
    {books.length > 0 && <ul className="search-results">{books.map(book => <li key={book.workId}>
      <button type="button" onClick={() => onSelect(book)}>{!movie && book.coverId ? <ImportedCover id={book.coverId} thumbnail fallback={<Icon size={18} aria-hidden="true"/>}/> : <PosterImage id={movie ? book.imdbId : undefined} thumbnail fallback={<Icon size={18} aria-hidden="true"/>}/>}<span><strong>{book.title}</strong><small>{[book.author || (movie ? "" : "Autoria não informada"), book.year].filter(Boolean).join(" · ")}</small></span></button>
    </li>)}</ul>}
  </>;
}
