"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { allowAttempt, currentAccount, endSession, login, register } from "@/lib/auth";

const emailField = z.string().trim().email().max(254).toLowerCase();
const loginFields = z.object({ email: emailField, password: z.string().min(1).max(256) });
const registerFields = loginFields.extend({ name: z.string().trim().min(1).max(100), password: z.string().min(12).max(256) });
const limited = "Muitas tentativas. Aguarde 15 minutos para tentar novamente.";

export async function createAccount(_: string, form: FormData): Promise<string> {
  if (await currentAccount()) redirect("/conta");
  const data = registerFields.safeParse(Object.fromEntries(form));
  if (!data.success) return "Confira o nome, o e-mail e a senha de pelo menos 12 caracteres.";
  const { name, email, password } = data.data;
  if (!await allowAttempt(email, "register")) return limited;
  if (!await register(name, email, password)) return "Não foi possível criar a conta com esse e-mail. Se já possui uma conta, entre.";
  revalidatePath("/", "layout");
  redirect("/conta");
}
export async function signIn(_: string, form: FormData): Promise<string> {
  if (await currentAccount()) redirect("/conta");
  const data = loginFields.safeParse(Object.fromEntries(form));
  if (!data.success) return "E-mail ou senha inválidos.";
  const { email, password } = data.data;
  if (!await allowAttempt(email, "login")) return limited;
  if (!await login(email, password)) return "E-mail ou senha inválidos.";
  revalidatePath("/", "layout");
  redirect("/");
}
export async function signOut() {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}
