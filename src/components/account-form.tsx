"use client";
import { useActionState } from "react";
import { notify, Spinner } from "./feedback";
import { unstable_rethrow } from "next/navigation";
import Link from "next/link";
import { createAccount, signIn } from "@/app/conta/actions";

export default function AccountForm({ registration }: { registration: boolean }) {
  const [error, action, pending] = useActionState(async (previous: string, data: FormData) => {
    let message: string;
    try {
      message = await (registration ? createAccount : signIn)(previous, data);
    } catch (error) {
      unstable_rethrow(error);
      message = "Falha na conexão. Tente novamente.";
    }
    if (message) notify(message, "error");
    return message;
  }, "");
  return <form className="review-form account-panel" action={action}>
    <h1>{registration ? "Criar conta" : "Entrar no Listry"}</h1>
    {registration && <p>Leve a coleção e as críticas deste navegador para sua conta.</p>}
    <fieldset disabled={pending}>
      {registration && <label>Nome<input name="name" autoComplete="name" maxLength={100} required/></label>}
      <label>E-mail<input name="email" type="email" autoComplete="email" maxLength={254} required/></label>
      <label>Senha<input name="password" type="password" autoComplete={registration ? "new-password" : "current-password"}
        minLength={registration ? 12 : 1} maxLength={256} required aria-describedby={registration ? "password-hint" : undefined}/></label>
      {registration && <small id="password-hint">Use pelo menos 12 caracteres.</small>}
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="button accent-button">{pending && <Spinner/>}{pending ? "Aguarde…" : registration ? "Criar conta" : "Entrar"}</button>
    </fieldset>
    <Link className="account-alternative" href={registration ? "/conta" : "/conta?cadastro=1"}>{registration ? "Já tenho uma conta" : "Criar uma conta"}</Link>
  </form>;
}
