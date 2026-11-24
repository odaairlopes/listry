import { catalog } from "@/lib/books";
import { Flower2 } from "lucide-react";
import type { Book } from "@/lib/books";
import ImportedCover from "./imported-cover";
export default function Cover({ book }: { book: Book }) {
  const fallback = <span className={`type-cover ${book.tone}`}><small>{book.author}</small><strong>{book.title}</strong><Flower2 size={42} strokeWidth={1}/></span>;
  const id = book.coverId ?? catalog.find(item => item.id === book.id)?.coverId;
  return <span className="physical-book">{id ? <ImportedCover id={id} fallback={fallback}/> : fallback}</span>;
}
