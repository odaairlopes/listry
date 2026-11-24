import { z } from "zod";
export const formats = ["Livro", "Filme", "Série", "Anime"] as const;
export const reviewLength = (value: string) => Array.from(value.trim()).length;
export const reviewSchema = z.object({
  format: z.enum(formats),
  title: z.string().trim().min(1).max(180),
  rating: z.string().regex(/^(?:10|[0-9])$/).transform(Number),
  body: z.string().trim().refine(text => reviewLength(text) >= 250),
});
export type Review = z.output<typeof reviewSchema> & { id: string };
