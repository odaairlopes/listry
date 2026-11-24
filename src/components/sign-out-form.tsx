"use client";
import { useActionState } from "react";
import { unstable_rethrow } from "next/navigation";
import { signOut } from "@/app/conta/actions";
import { notify, Spinner } from "./feedback";

export default function SignOutForm() {
  const [error, action, pending] = useActionState(async () => {
    try {
      await signOut();
      return "";
    } catch (error) {
      unstable_rethrow(error);
      const message = "Não foi possível sair. Tente novamente.";
      notify(message, "error");
      return message;
    }
  }, "");
  return <form action={action}>
    <button className="button outline" disabled={pending}>{pending && <Spinner/>}{pending ? "Saindo…" : "Sair da conta"}</button>
    {error && <p className="form-error">{error}</p>}
  </form>;
}
