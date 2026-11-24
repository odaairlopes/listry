import { CatalogGrid } from "@/components/collection";
import { catalog } from "@/lib/books";
export const metadata = { title: "Explorar livros", description: "Conheça romances, fábulas e ficção científica para sua próxima leitura." };
export default function Discover() {
  return <><div className="page-heading"><h1>Explorar livros</h1><span className="date">{catalog.length} títulos selecionados</span></div><CatalogGrid books={catalog}/></>;
}
