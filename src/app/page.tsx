import { CalendarDays } from "lucide-react";
import { readLibrary } from "@/lib/library";
import Featured from "@/components/featured";
import Collection, { CollectionHeading } from "@/components/collection";
export default async function Home() {
  const books = await readLibrary();
  const date = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date());
  return <><div className="page-heading"><h1>Meu painel</h1><span className="date"><CalendarDays size={16}/>{date}</span></div>
    <Featured book={books.slice().reverse().find(book => book.status === "reading")}/>
    <CollectionHeading/><Collection entries={books}/>
  </>;
}
