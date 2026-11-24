"use client";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
export default function ThemeSwitch({ initialDark }: { initialDark: boolean }) {
  const [dark, setDark] = useState(initialDark);
  const label = dark ? "Ativar tema claro" : "Ativar tema escuro";
  return <button type="button" className="theme-switch" title={label} aria-label={label} onClick={() => {
    const theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.cookie = `repertorio-theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setDark(!dark);
  }}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>;
}
