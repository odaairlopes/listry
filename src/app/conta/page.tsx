import { currentAccount } from "@/lib/auth";
import AccountForm from "@/components/account-form";
import SignOutForm from "@/components/sign-out-form";

export const metadata = { title: "Minha conta" };
export default async function AccountPage({ searchParams }: { searchParams: Promise<{ cadastro?: string }> }) {
  const account = await currentAccount();
  if (account) return <section className="review-form account-panel">
    <h1>Minha conta</h1><h2>{account.name}</h2><p>{account.email}</p>
    <SignOutForm/>
  </section>;
  const registration = (await searchParams).cadastro === "1";
  return <AccountForm key={String(registration)} registration={registration}/>;
}
