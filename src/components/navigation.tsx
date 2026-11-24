"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers3, Compass, NotebookPen } from "lucide-react";
const pages = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/estante", label: "Minha coleção", icon: Layers3 },
  { href: "/explorar", label: "Explorar", icon: Compass },
  { href: "/criticas", label: "Críticas", icon: NotebookPen },
];
export default function Navigation() {
  const path = usePathname();
  return <nav aria-label="Navegação principal">{pages.map(({ href, label, icon: Icon }) =>
    <Link key={href} href={href} aria-current={path === href ? "page" : undefined}><Icon size={16}/>{label}</Link>
  )}</nav>;
}
