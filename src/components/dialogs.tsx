"use client";
import { useId, useRef, useState, useTransition } from "react";
import { Plus, X, PencilLine, Bookmark, BookPlus, BookOpen, Clapperboard, Sparkles, Tv, ChevronLeft } from "lucide-react";
import { addBook, addMovie, updateMovie, saveCatalogBook, setFavorite, updateReading } from "@/app/actions";
import { statusLabel, statuses, movieStatus, type LibraryEntry, type Status } from "@/lib/books";
import type { BookMatch } from "@/lib/book-search";
import PosterImage from "./poster-image";
import { notify, Spinner } from "./feedback";
import BookSearch from "./book-search";

type Result = { ok: true } | { ok: false; error: string };
function useMutation() {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  function run(action: () => Promise<Result>, message: string, success?: () => void) {
    setError("");
    start(async () => {
      try {
        const result = await action();
        if (result.ok) { success?.(); notify(message); }
        else { setError(result.error); notify(result.error, "error"); }
      } catch { const message = "Conexão interrompida. Tente novamente."; setError(message); notify(message, "error"); }
    });
  }
  return { run, pending, error, clear: () => setError("") };
}
export function BookDialog({ book }: { book?: LibraryEntry }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [format, setFormat] = useState<"book" | "movie" | null>(null);
  const movie = book ? book.kind === "movie" : format === "movie";
  const heading = useId();
  const [mode, setMode] = useState<"search" | "manual" | "review">("search");
  const [selected, setSelected] = useState<BookMatch | null>(null);
  const missingPages = selected !== null && !movie && !selected.pages;
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>(book?.status ?? "planned");
  const { run, pending, error, clear } = useMutation();
  const title = book ? (movie ? "Atualizar situação" : "Atualizar progresso") : "Adicionar à coleção";
  function open() {
    clear();
    setFormat(null);
    setVisible(true);
    setMode("search");
    setSelected(null);
    setStatus(book?.status ?? "planned");
    ref.current?.querySelector("form")?.reset();
    ref.current?.showModal();
  }
  return <>
    <button className={book ? "button ink-button" : "button accent-button"} onClick={open}>
      {book ? <PencilLine size={16}/> : <Plus size={18}/>} {title}
    </button>
    <dialog ref={ref} aria-labelledby={heading} onClose={() => setVisible(false)} onCancel={event => { if (pending) event.preventDefault(); }}>
      <div className="dialog-head"><h2 id={heading}>{book ? title : format ? (movie ? "Adicionar filme" : "Adicionar livro") : "O que você quer adicionar?"}</h2><button type="button" className="icon-button" aria-label="Fechar" onClick={() => ref.current?.close()} disabled={pending}><X size={19}/></button></div>
      {!book && !format && <div className="format-grid">
        <button onClick={() => setFormat("book")}><BookOpen aria-hidden="true"/>Livros</button>
        <button onClick={() => setFormat("movie")}><Clapperboard aria-hidden="true"/>Filmes</button>
        <button disabled><Sparkles aria-hidden="true"/>Animes<small>Em breve</small></button>
        <button disabled><Tv aria-hidden="true"/>Séries<small>Em breve</small></button>
      </div>}
      {!book && format && <button className="change-format" disabled={pending} onClick={() => {
        setFormat(null); setSelected(null); setMode("search"); setStatus("planned"); clear();
      }}><ChevronLeft size={15}/>Trocar formato</button>}
      {!book && format && <div className="add-method" aria-label="Forma de cadastro">
        <button type="button" disabled={pending} aria-pressed={mode !== "manual"} onClick={() => { clear(); setSelected(null); setMode("search"); }}>{movie ? "Buscar filme" : "Buscar livro"}</button>
        <button type="button" disabled={pending} aria-pressed={mode === "manual"} onClick={() => { clear(); setSelected(null); setMode("manual"); }}>Cadastro manual</button>
      </div>}
      {visible && (book || format) && (!book && mode === "search" ? <BookSearch key={format} movie={movie} onSelect={item => { setSelected(item); setMode("review"); }}/> : <form key={selected?.workId ?? mode} onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (selected) {
          data.set("title", selected.title);
          if (movie) {
            data.set("director", selected.author);
            data.set("year", String(selected.year ?? ""));
          } else {
            data.set("author", selected.author || "Autoria não informada");
            data.set("pages", String(selected.pages ?? ""));
          }
        }
        run(() => book ? (movie ? updateMovie(book.id, data) : updateReading(book.id, data)) : (movie ? addMovie(data) : addBook(data)), book ? "Alterações salvas." : "Item adicionado à coleção.", () => ref.current?.close());
      }}>
        {book ? <p className="dialog-book">{book.title} · {book.kind === "movie" ? book.year : book.author}</p> : movie ? <>
          {selected?.imdbId && <><input type="hidden" name="imdbId" value={selected.imdbId}/><PosterImage id={selected.imdbId} thumbnail fallback={null}/></>}
          <label>Título<input name="title" disabled={!!selected} defaultValue={selected?.title} required maxLength={150}/></label>
          <label>{selected ? "Direção" : "Direção (opcional)"}<input name="director" disabled={!!selected} defaultValue={selected?.author} placeholder={selected ? "Não informada" : undefined} maxLength={150}/></label>
          <label>Ano de lançamento<input name="year" disabled={!!selected} type="number" defaultValue={selected?.year} required min="1880" max="2200"/></label>
        </> : <>
          {selected && <>
            <input type="hidden" name="workId" value={selected.workId}/>
            {selected.coverId && <input type="hidden" name="coverId" value={selected.coverId}/>}
            {missingPages && <p className="search-feedback">O catálogo não informa o total de páginas. Use o cadastro manual para adicionar sua edição.</p>}
          </>}
          <label>Título<input name="title" disabled={!!selected} defaultValue={selected?.title} required maxLength={150} placeholder="Nome do livro"/></label>
          <label>Autor ou autora<input name="author" disabled={!!selected} defaultValue={selected ? selected.author || "Autoria não informada" : undefined} required maxLength={150} placeholder="Nome de quem escreveu"/></label>
          <label>Total de páginas<input name="pages" disabled={!!selected} defaultValue={selected?.pages} type="number" placeholder={missingPages ? "Não informado" : undefined} min={1} max={100000} required inputMode="numeric"/></label>
        </>}
        <label>{movie ? "Situação do filme" : "Situação da leitura"}<select name="status" value={status} onChange={e => setStatus(e.target.value as Status)}>
          {statuses.map(value => <option value={value} key={value}>{(movie ? movieStatus : statusLabel)[value]}</option>)}
        </select></label>
        {book && book.kind !== "movie" && status === "reading" && <label>Página atual (de {book.pages})<input name="page" type="number" min={0} max={book.pages} defaultValue={book.page} required inputMode="numeric"/></label>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <button disabled={pending || missingPages} className="button accent-button submit">{pending && <Spinner/>}{pending ? "Salvando…" : book ? (movie ? "Salvar situação" : "Salvar progresso") : "Adicionar à coleção"}</button>
      </form>)}
    </dialog>
  </>;
}

export function FavoriteButton({ book }: { book: LibraryEntry }) {
  const { run, pending, error } = useMutation();
  return <div className="favorite-wrap">
    <button className="favorite" aria-label={`${book.favorite ? "Desfavoritar" : "Favoritar"} ${book.title}`} aria-pressed={book.favorite} disabled={pending} onClick={() => run(() => setFavorite(book.id, !book.favorite), book.favorite ? "Removido dos favoritos." : "Adicionado aos favoritos.")}>
      {pending ? <Spinner/> : <Bookmark size={16} fill={book.favorite ? "currentColor" : "none"}/>}
    </button>{error && <span className="inline-error" role="alert">{error}</span>}
  </div>;
}
export function CatalogButton({ id }: { id: string }) {
  const { run, pending, error } = useMutation();
  return <div><button className="button accent-button" disabled={pending} onClick={() => run(() => saveCatalogBook(id), "Livro salvo na coleção.")}>{pending ? <Spinner/> : <BookPlus size={17}/>} {pending ? "Salvando…" : "Adicionar à coleção"}</button>{error && <p role="alert">{error}</p>}</div>;
}
