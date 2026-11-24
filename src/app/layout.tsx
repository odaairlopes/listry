import { ToastHost } from "@/components/feedback";
import ThemeSwitch from "@/components/theme-switch";
import { currentAccount } from "@/lib/auth";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import Navigation from "@/components/navigation";
import { BookDialog } from "@/components/dialogs";
import "./globals.css";
const sans = localFont({ src: "../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2", variable: "--font-sans", display: "swap", weight: "100 1000" });
const serif = localFont({ src: "../../node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2", variable: "--font-serif", display: "swap", weight: "400 900" });
export const metadata: Metadata = {
  title: { default: "Meu painel · Listry", template: "%s · Listry" },
  description: "Seu espaço para organizar livros, filmes e acompanhar seu progresso.",
};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const account = await currentAccount();
  const dark = (await cookies()).get("repertorio-theme")?.value === "dark";
  const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date());
  return <html data-theme={dark ? "dark" : "light"} lang="pt-BR" className={`${sans.variable} ${serif.variable}`}><body><a className="skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="topbar"><div className="shell header-inner">
      <Link href="/" aria-label="Listry, início" className="brand"><span><Image src="/icon.svg" alt="" width={32} height={32}/></span>Listry<span className="brand-dot">.</span></Link>
      <Navigation/><div className="header-action"><Link href="/conta" className="account-link">{account ? "Minha conta" : "Entrar"}</Link><ThemeSwitch initialDark={dark}/>{account ? <BookDialog/> : <Link className="button accent-button" href="/conta?cadastro=1">Criar conta</Link>}</div>
    </div></header>
    <main id="conteudo" className="shell main">{children}</main>
    <footer className="site-footer">
      <div className="shell footer-inner">
        <small>© {year === "2026" ? "2026" : `2026–${year}`} Listry</small>
        <small>Desenvolvido por <a href="https://odairlopes.vercel.app">OLSoftware</a></small>
      </div>
    </footer>
  <ToastHost accountId={account?.id}/>
  </body></html>;
}
