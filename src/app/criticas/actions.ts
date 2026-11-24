"use server";
import { revalidatePath } from "next/cache";
import { recordReview } from "@/lib/library";
import { reviewSchema } from "@/lib/reviews";

export async function saveReview(form: FormData) {
  const parsed = reviewSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Informe o título, uma nota de 0 a 10 e uma crítica com pelo menos 250 caracteres." };
  try { await recordReview(parsed.data); }
  catch { return { error: "A crítica não foi salva. Tente novamente." }; }
  revalidatePath("/criticas");
  return { error: "" };
}
