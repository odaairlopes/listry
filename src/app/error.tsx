"use client";
export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return <section className="empty"><h1>Não foi possível abrir a coleção</h1><p>Tente carregar seus livros novamente.</p><button className="button ink-button" onClick={reset}>Tentar novamente</button></section>;
}
