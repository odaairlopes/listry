import ReviewForm from "@/components/review-form";
import { readLibrary, readReviews } from "@/lib/library";
import { formats } from "@/lib/reviews";
export const metadata = { title: "Minhas críticas" };
export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ titulo?: string; formato?: string }> }) {
  const [reviews, entries, params] = await Promise.all([readReviews(), readLibrary(), searchParams]);
  return <><div className="page-heading"><h1>Minhas críticas</h1></div><div className="reviews-layout">
    <ReviewForm key={JSON.stringify(params)} initialTitle={typeof params.titulo === "string" ? params.titulo.slice(0,180) : ""}
      initialFormat={formats.find(format => format === params.formato) ?? "Livro"}
      suggestions={entries.map(entry => ({title:entry.title,format:entry.kind === "movie" ? "Filme" : "Livro"}))}/>
    <section className="reviews-list" aria-label="Críticas salvas">{reviews.length ? reviews.map(review =>
      <article key={review.id}><span className="eyebrow">{review.format}</span><h2>{review.title}</h2><strong>Nota {review.rating}/10</strong><p>{review.body}</p></article>
    ) : <div className="empty"><h2>Nenhuma crítica salva</h2><p>Sua primeira crítica aparecerá aqui.</p></div>}</section>
  </div></>;
}
