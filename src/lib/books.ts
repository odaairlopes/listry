export const statuses = ["reading", "planned", "finished"] as const;
export type Status = (typeof statuses)[number];
export const statusLabel: Record<Status, string> = {
  reading: "Lendo", planned: "Quero ler", finished: "Concluído",
};
export type Book = {
  kind?: "book";
  id: string; title: string; author: string; pages: number;
  genre: string; tone: string; cover?: string; description: string;
  workId?: string; coverId?: number;
};
export type Entry = Book & { status: Status; page: number; favorite: boolean };
export const catalog: Book[] = [
  { id: "duna", title: "Duna", author: "Frank Herbert", pages: 680, genre: "Ficção científica", tone: "sand", coverId: 11481354, description: "Em Arrakis, um planeta desértico, o destino de Paul Atreides se entrelaça ao de um povo que conhece cada segredo das dunas. Uma história sobre ecologia, poder e as consequências de um mito." },
  { id: "torto-arado", title: "Torto Arado", author: "Itamar Vieira Junior", pages: 264, genre: "Romance", tone: "sage", coverId: 12369648, description: "Um acidente na infância liga as vozes de duas irmãs no sertão baiano. Entre a casa, a roça e o rio, Bibiana e Belonísia encontram caminhos diferentes para contar a história da mesma terra." },
  { id: "meia-noite", title: "A Biblioteca da Meia-Noite", author: "Matt Haig", pages: 308, genre: "Fantasia", tone: "blue", coverId: 10313767, description: "Nora encontra uma biblioteca onde cada volume guarda uma vida que poderia ter vivido. Ao abrir esses livros, ela revisita escolhas, arrependimentos e a possibilidade de recomeçar." },
  { id: "pequeno-principe", title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", pages: 96, genre: "Fábula", tone: "peach", coverId: 10708272, description: "Um piloto perdido no deserto conhece um viajante vindo de um pequeno planeta. Entre encontros e despedidas, o menino fala de sua rosa e das coisas que fazem alguém ser único." },
  { id: "dom-casmurro", coverId: 10558903, title: "Dom Casmurro", author: "Machado de Assis", pages: 256, genre: "Romance", tone: "sage", description: "Ao tentar reconstruir sua juventude, Bento Santiago revisita a amizade com Escobar e seu amor por Capitu. O leitor é convidado a decidir quanto cabe de lembrança e imaginação nesse relato." },
  { id: "frankenstein", coverId: 15228975, title: "Frankenstein", author: "Mary Shelley", pages: 288, genre: "Ficção gótica", tone: "blue", description: "Victor Frankenstein dá vida a uma criatura e foge das responsabilidades da criação. As vozes dos dois se cruzam em uma busca por reconhecimento que atravessa laboratórios, florestas e geleiras." }
];
export const percentRead = (entry: Entry) => Math.round(entry.page * 100 / entry.pages);
export type MovieEntry = {
  kind: "movie"; id: string; title: string; director: string; year: number;
  status: Status; favorite: boolean; appleId?: string; imdbId?: string;
};
export type LibraryEntry = Entry | MovieEntry;
export const movieStatus: Record<Status, string> = { planned: "Quero assistir", reading: "Assistindo", finished: "Assistido" };

