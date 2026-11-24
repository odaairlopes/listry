import Collection from "@/components/collection";
import { readLibrary } from "@/lib/library";
export const metadata = { title: "Minha coleção" };
export default async function Shelf() {
  const entries = await readLibrary();
  return <><div className="page-heading"><h1>Minha coleção</h1><span className="date">{entries.length} títulos no acervo</span></div><Collection full entries={entries}/></>;
}
