"use client";
import { useState, useTransition } from "react";
import { notify, Spinner } from "./feedback";
import { saveReview } from "@/app/criticas/actions";
import { formats, reviewLength, type Review } from "@/lib/reviews";

type Props = { initialTitle: string; initialFormat: Review["format"]; suggestions: { title: string; format: string }[] };
export default function ReviewForm({ initialTitle, initialFormat, suggestions }: Props) {
  const [format, setFormat] = useState(initialFormat);
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, start] = useTransition();
  const count = reviewLength(body);
  return <form className="review-form" onSubmit={event => {
    event.preventDefault();
    if (count < 250 || pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setFeedback("");
    start(async () => {
      try {
        const result = await saveReview(data);
        if (result.error) { notify(result.error, "error"); setFeedback(result.error); return; }
        form.reset(); setBody(""); setFormat(initialFormat); setFeedback("Crítica salva."); notify("Crítica salva.");
      } catch { notify("Falha na conexão. Tente novamente.", "error"); setFeedback("Falha na conexão. Tente novamente."); }
    });
  }}>
    <h2>Escrever crítica</h2>
    <fieldset disabled={pending}><label>Formato<select name="format" value={format} onChange={e => setFormat(e.target.value as Review["format"])}>{formats.map(value => <option key={value}>{value}</option>)}</select></label>
    <label>Título da obra<input name="title" list="review-titles" defaultValue={initialTitle} maxLength={180} required/></label>
    <datalist id="review-titles">{suggestions.filter(item => item.format === format).map((item,i) => <option key={i} value={item.title}/>)}</datalist>
    <label>Nota<select required name="rating" defaultValue=""><option value="" disabled>Selecione de 0 a 10</option>{Array.from({length:11},(_,i) => <option key={i}>{i}</option>)}</select></label>
    <label>Sua crítica<textarea required name="body" rows={6} value={body} onChange={e => setBody(e.target.value)} aria-describedby="review-count"/></label>
    <small id="review-count">{count} caracteres · mínimo de 250</small>
    <button className="button accent-button" disabled={count < 250 || pending}>{pending && <Spinner/>}{pending ? "Salvando…" : "Salvar crítica"}</button></fieldset>
    <p role="status">{feedback}</p>
  </form>;
}
